#!/usr/bin/env node
/**
 * record-walkthrough.mjs — graba un tutorial de INTERACCIÓN en MP4.
 *
 * Hermano de `record-page.mjs` (el del repo de CS Travel, que graba barridos de
 * scroll). El motor es el mismo y por las mismas razones: Chrome controlado por
 * Puppeteer, los fotogramas salen del screencast del DevTools Protocol
 * (`Page.startScreencast`) — el compositor entregando cada fotograma según lo
 * pinta, no capturas una a una — y ffmpeg los monta respetando los timestamps
 * reales. Sin cursor del sistema, sin barra de scroll, sin notificaciones.
 *
 * Lo que cambia es el guion. Un barrido de scroll se describe con un número de
 * segundos; un tutorial no: hay que hacer clic aquí, escribir esto, esperar a
 * que cargue aquello. Así que el recorrido vive en `scripts/walkthroughs/<x>.mjs`
 * como una lista de pasos, y este archivo sólo sabe grabar mientras alguien los
 * ejecuta.
 *
 * Tres cosas que un barrido no necesita y un tutorial sí:
 *
 *   1. UN CURSOR. El screencast no captura el puntero del sistema — no existe en
 *      headless. Sin un cursor dibujado, el vídeo es una sucesión de cosas que
 *      pasan solas y no se entiende dónde hay que hacer clic. Aquí se dibuja uno
 *      y se anima hasta el elemento antes de cada clic.
 *
 *   2. RÓTULOS. Lo que explica el paso, quemado en el fotograma, para que el
 *      vídeo se entienda sin audio y sin un documento al lado.
 *
 *   3. UNA SESIÓN INICIADA. wp-admin pide login. Este script NO escribe
 *      contraseñas: `--login` abre Chrome con ventana para que la persona entre
 *      una vez, y el perfil (`--profile`) guarda la cookie para todas las tomas
 *      siguientes.
 *
 * Uso:
 *   node scripts/record-walkthrough.mjs --login
 *   node scripts/record-walkthrough.mjs --guion blog-post --out docs/video/blog.mp4
 *
 * Opciones:
 *   --guion      nombre del archivo en scripts/walkthroughs/ (sin .mjs)
 *   --out        MP4 de salida (por defecto docs/video/<guion>.mp4)
 *   --base       URL base del sitio (http://localhost:8081)
 *   --width      ancho del viewport CSS (1600)
 *   --height     alto del viewport CSS (900)
 *   --scale      deviceScaleFactor (1)
 *   --fps        fotogramas por segundo del MP4 (30)
 *   --quality    calidad JPEG del screencast, 1-100 (92)
 *   --profile    carpeta de perfil de Chrome, para conservar la sesión
 *   --login      abre Chrome con ventana y espera a que inicies sesión
 *   --headful    graba con ventana visible (para depurar el guion)
 *   --keep       conserva los fotogramas sueltos
 *   --chrome     ruta a chrome.exe (si no, se autodetecta)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const arg = (name, fallback = undefined) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
};
const num = (name, fallback) => {
  const v = arg(name);
  return v === undefined || v === true ? fallback : Number(v);
};

const guionName = arg('guion');
const base = String(arg('base', 'http://localhost:8081'));
const width = num('width', 1600);
const height = num('height', 900);
const scale = num('scale', 1);
const fps = num('fps', 30);
const quality = num('quality', 92);
const loginMode = arg('login') === true;
const headful = arg('headful') === true || loginMode;
const keepFrames = arg('keep') === true;

const profileDir = path.resolve(
  String(
    arg(
      'profile',
      path.join(os.tmpdir(), 'thallo-walkthrough-profile'),
    ),
  ),
);

if (!guionName && !loginMode && arg('check') !== true) {
  console.error('Falta --guion (o --login, o --check). Ejemplo: node scripts/record-walkthrough.mjs --guion blog-post');
  process.exit(1);
}

const out = path.resolve(String(arg('out', path.join('docs', 'video', `${guionName || 'walkthrough'}.mp4`))));

// ---------- Chrome ----------
function findChrome() {
  const fromArg = arg('chrome');
  if (typeof fromArg === 'string') return fromArg;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        ]
      : process.platform === 'darwin'
        ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
        : ['/usr/bin/google-chrome', '/usr/bin/chromium'];
  const hit = candidates.find((p) => fs.existsSync(p));
  if (!hit) throw new Error('No encontre Chrome. Pasalo con --chrome "ruta/al/chrome.exe" o CHROME_PATH.');
  return hit;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────────────────────────────────────────────────────────
   El decorado: cursor y rótulo.

   Se instala con `evaluateOnNewDocument`, así que sobrevive a cada navegación
   sin tener que reinyectarlo a mano después de cada clic que cambia de página.
   Todo cuelga de `window.__thallo`, y todo está fuera del flujo: `position:fixed`
   con z-index por encima de wp-admin, que llega hasta 999999 en algunos modales.
   ──────────────────────────────────────────────────────────────────────────── */
const DECOR = `
(() => {
  if (window.__thallo) return;

  const api = {};
  window.__thallo = api;

  let root, cursor, caption, capNum, capText, capBar;
  let at = { x: 80, y: 80 };

  function build() {
    if (root && document.body.contains(root)) return;
    root = document.createElement('div');
    root.id = 'thallo-decor';
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';

    const style = document.createElement('style');
    style.textContent = \`
      #thallo-decor *{box-sizing:border-box;font-family:Inter,ui-sans-serif,system-ui,'Segoe UI',sans-serif}
      #thallo-cursor{position:fixed;width:26px;height:26px;margin:-4px 0 0 -4px;
        transition:transform .01s linear;will-change:transform}
      #thallo-cursor svg{display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
      #thallo-ring{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
        border:3px solid #55672E;opacity:0;transform:scale(.3)}
      #thallo-ring.go{animation:thallo-ping .5s ease-out}
      @keyframes thallo-ping{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.15)}}
      #thallo-cap{position:fixed;left:32px;bottom:32px;max-width:640px;
        background:rgba(23,26,16,.94);color:#fff;border-radius:16px;padding:18px 22px 20px;
        box-shadow:0 18px 50px rgba(0,0,0,.4);opacity:0;transform:translateY(10px);
        transition:opacity .28s ease,transform .28s ease}
      #thallo-cap.on{opacity:1;transform:none}
      #thallo-cap .n{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;
        color:#CBD0AC;margin:0 0 7px}
      #thallo-cap .t{font-size:19px;line-height:1.42;margin:0;font-weight:500}
      #thallo-cap .bar{height:3px;border-radius:2px;background:rgba(203,208,172,.25);margin-top:14px;overflow:hidden}
      #thallo-cap .bar i{display:block;height:100%;background:#CBD0AC;width:0%;transition:width .4s ease}
    \`;

    cursor = document.createElement('div');
    cursor.id = 'thallo-cursor';
    cursor.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26">' +
      '<path d="M5 2.5 19 12.2l-6.1.6-3.2 6.2z" fill="#fff" stroke="#171A10" stroke-width="1.4" stroke-linejoin="round"/>' +
      '</svg>';

    const ring = document.createElement('div');
    ring.id = 'thallo-ring';

    caption = document.createElement('div');
    caption.id = 'thallo-cap';
    capNum = document.createElement('p');
    capNum.className = 'n';
    capText = document.createElement('p');
    capText.className = 't';
    const bar = document.createElement('div');
    bar.className = 'bar';
    capBar = document.createElement('i');
    bar.appendChild(capBar);
    caption.append(capNum, capText, bar);

    root.append(style, cursor, ring, caption);
    (document.body || document.documentElement).appendChild(root);
    api._ring = ring;
    api.place(at.x, at.y);
  }

  api.place = (x, y) => {
    at = { x, y };
    build();
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    api._ring.style.left = x + 'px';
    api._ring.style.top = y + 'px';
  };

  api.where = () => at;

  /* El movimiento del cursor se anima aquí, en el hilo de render de la página,
     y no a base de mouse.move desde Node: un bucle de CDP entrega saltos
     visibles a 30fps, y un requestAnimationFrame no. */
  api.glide = (x, y, ms) =>
    new Promise((done) => {
      build();
      const from = { ...at };
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        const e = ease(p);
        api.place(Math.round(from.x + (x - from.x) * e), Math.round(from.y + (y - from.y) * e));
        if (p < 1) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });

  api.ping = () => {
    build();
    api._ring.classList.remove('go');
    void api._ring.offsetWidth;
    api._ring.classList.add('go');
  };

  api.say = (n, text, pct) => {
    build();
    capNum.textContent = n;
    capText.textContent = text;
    capBar.style.width = (pct || 0) + '%';
    caption.classList.add('on');
  };

  api.hush = () => {
    build();
    caption.classList.remove('on');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
`;

/* ─────────────────────────────────────────────────────────────────────────────
   El contexto que recibe un guion.
   ──────────────────────────────────────────────────────────────────────────── */
function makeContext(page, state) {
  const decor = async (fn, ...args) => {
    try {
      return await page.evaluate(fn, ...args);
    } catch {
      /* Una navegación en vuelo destruye el contexto; el decorado se
         reconstruye solo en el documento siguiente. */
      return null;
    }
  };

  const ensureDecor = async () => {
    await decor((src) => {
      if (!window.__thallo) {
        const s = document.createElement('script');
        s.textContent = src;
        document.documentElement.appendChild(s);
        s.remove();
      }
    }, DECOR);
  };

  const ctx = {
    page,
    base,
    sleep,

    /* La foto que el guion sube como imagen destacada. Un archivo de verdad,
       porque el modal de medios de WordPress sube de verdad. */
    foto: path.resolve(String(arg('foto', path.join('public', 'notebook-desk.webp')))),

    /** El rótulo de abajo a la izquierda. Cada paso empieza por aquí. */
    async say(text, { hold = 1500 } = {}) {
      state.step += 1;
      const pct = state.total ? Math.round((state.step / state.total) * 100) : 0;
      const label = state.total ? `Paso ${state.step} de ${state.total}` : `Paso ${state.step}`;
      await ensureDecor();
      await decor((n, t, p) => window.__thallo && window.__thallo.say(n, t, p), label, text, pct);
      await sleep(hold);
    },

    /** Una nota sin gastar número de paso — para explicar lo que se ve. */
    async note(text, { hold = 1800 } = {}) {
      const pct = state.total ? Math.round((state.step / state.total) * 100) : 0;
      await ensureDecor();
      await decor((t, p) => window.__thallo && window.__thallo.say('', t, p), text, pct);
      await sleep(hold);
    },

    async hush() {
      await decor(() => window.__thallo && window.__thallo.hush());
    },

    async goto(url, { wait = 1200 } = {}) {
      const full = url.startsWith('http') ? url : base.replace(/\/$/, '') + url;
      await page.goto(full, { waitUntil: 'networkidle2', timeout: 90_000 }).catch(() => {});
      await ensureDecor();
      await sleep(wait);
    },

    /** Espera a que un selector exista y sea visible. Devuelve su caja. */
    async box(selector, { timeout = 15_000 } = {}) {
      await page.waitForSelector(selector, { visible: true, timeout });
      const b = await page.$eval(selector, (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      });
      return b;
    },

    /** Lleva el cursor dibujado hasta el centro del elemento. */
    async moveTo(selector, { ms = 620, offset = null } = {}) {
      const b = await ctx.box(selector);
      const x = Math.round(offset ? b.x + offset.x : b.x + b.w / 2);
      const y = Math.round(offset ? b.y + offset.y : b.y + b.h / 2);
      await ensureDecor();
      await decor((X, Y, M) => window.__thallo && window.__thallo.glide(X, Y, M), x, y, ms);
      await sleep(ms + 120);
      return { x, y };
    },

    /** Mover, marcar el clic y clicar de verdad. */
    async click(selector, { ms = 620, after = 900, offset = null } = {}) {
      const { x, y } = await ctx.moveTo(selector, { ms, offset });
      await decor(() => window.__thallo && window.__thallo.ping());
      await sleep(180);
      await page.mouse.click(x, y);
      await sleep(after);
      await ensureDecor();
    },

    /**
     * Pinchar el primer elemento cuyo texto encaje. Para los botones que
     * WordPress deja sin aria-label — "Add an excerpt…" es uno — donde lo unico
     * estable es lo que se lee en pantalla.
     */
    async clickByText(selector, re, { ms = 620, after = 900 } = {}) {
      const handles = await page.$$(selector);
      for (const h of handles) {
        const t = await page.evaluate((el) => (el.textContent || '').trim(), h);
        const shown = await h.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        if (shown && re.test(t)) {
          const b = await h.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
          });
          await ensureDecor();
          await decor((X, Y, M) => window.__thallo && window.__thallo.glide(X, Y, M), Math.round(b.x), Math.round(b.y), ms);
          await sleep(ms + 120);
          await decor(() => window.__thallo && window.__thallo.ping());
          await sleep(180);
          await h.click();
          await sleep(after);
          await ensureDecor();
          return true;
        }
      }
      return false;
    },

    /**
     * Marcar la casilla cuyo nombre sea exactamente el dado.
     *
     * Existe porque la alternativa — "la primera casilla de la lista" — marca
     * "Uncategorized", que es justo el termino que el tema esconde y que deja
     * al articulo fuera de la portada.
     */
    async checkByLabel(name) {
      const found = await page.evaluate((wanted) => {
        const boxes = [...document.querySelectorAll('input[type="checkbox"]')];
        for (const box of boxes) {
          const label =
            (box.closest('label') && box.closest('label').textContent) ||
            (box.id && (document.querySelector(`label[for="${box.id}"]`) || {}).textContent) ||
            '';
          if (label.trim() === wanted) {
            const r = box.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return null;
            box.scrollIntoView({ block: 'center', behavior: 'instant' });
            const r2 = box.getBoundingClientRect();
            return { x: Math.round(r2.x + r2.width / 2), y: Math.round(r2.y + r2.height / 2) };
          }
        }
        return null;
      }, name);

      if (!found) return false;

      await ensureDecor();
      await decor((X, Y, M) => window.__thallo && window.__thallo.glide(X, Y, M), found.x, found.y, 620);
      await sleep(760);
      await decor(() => window.__thallo && window.__thallo.ping());
      await sleep(180);
      await page.mouse.click(found.x, found.y);
      await sleep(700);
      return true;
    },

    /** Escribir con ritmo humano en el elemento que tenga el foco. */
    async write(text, { delay = 38, after = 500 } = {}) {
      await page.keyboard.type(text, { delay });
      await sleep(after);
    },

    async press(key, { after = 400, times = 1 } = {}) {
      for (let i = 0; i < times; i += 1) {
        await page.keyboard.press(key);
        await sleep(90);
      }
      await sleep(after);
    },

    /** Desplaza la página y deja que el rótulo siga encima. */
    async scroll(y, { ms = 900 } = {}) {
      await decor(
        (top, dur) =>
          new Promise((done) => {
            const from = window.scrollY;
            const t0 = performance.now();
            const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
            const tick = (now) => {
              const p = Math.min(1, (now - t0) / dur);
              window.scrollTo({ top: from + (top - from) * ease(p), behavior: 'instant' });
              if (p < 1) requestAnimationFrame(tick);
              else done();
            };
            requestAnimationFrame(tick);
          }),
        y,
        ms,
      );
      await sleep(ms + 150);
    },

    /** El lienzo del editor de bloques vive en un iframe desde WP 6.3. */
    async canvas({ timeout = 20_000 } = {}) {
      const handle = await page
        .waitForSelector('iframe[name="editor-canvas"]', { timeout })
        .catch(() => null);
      if (!handle) return page.mainFrame();
      return handle.contentFrame();
    },
  };

  return ctx;
}

// ---------- modo comprobacion ----------
/* Responde a una sola pregunta: ¿el perfil tiene sesion abierta? Sin esto, la
   unica forma de saberlo era lanzar la grabacion y ver que salia. */
if (arg('check') === true) {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    userDataDir: profileDir,
    defaultViewport: { width, height, deviceScaleFactor: scale },
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = (await browser.pages())[0] || (await browser.newPage());
  await page
    .goto(base.replace(/\/$/, '') + '/wp-admin/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    .catch((e) => console.error('  no cargo: ' + e.message));

  const info = await page
    .evaluate(() => ({
      url: location.href,
      title: document.title,
      admin: !!(document.body && document.body.classList.contains('wp-admin')),
      user: (document.querySelector('#wp-admin-bar-my-account .display-name') || {}).textContent || null,
    }))
    .catch(() => null);

  const shot = path.join(os.tmpdir(), 'thallo-session-check.png');
  await page.screenshot({ path: shot }).catch(() => {});
  await browser.close();

  if (info && info.admin) {
    console.log(`-> sesion abierta como "${(info.user || '').trim() || '?'}". Listo para grabar.`);
    process.exit(0);
  }
  console.log('-> NO hay sesion en el perfil.');
  console.log('   url: ' + (info ? info.url : '(sin respuesta)'));
  console.log('   captura: ' + shot);
  process.exit(1);
}

// ---------- modo login ----------
if (loginMode) {
  fs.mkdirSync(profileDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: false,
    userDataDir: profileDir,
    defaultViewport: null,
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${width},${height}`,
      '--window-position=40,40',
    ],
  });
  const page = (await browser.pages())[0] || (await browser.newPage());

  /* wp-login.php y no wp-admin/: el segundo contesta 302 y, si la redireccion
     tarda, `networkidle2` se queda esperando y la ventana se ve en blanco —
     que es exactamente lo que paso la primera vez. `domcontentloaded` pinta en
     cuanto hay algo que pintar. */
  const loginUrl = base.replace(/\/$/, '') + '/wp-login.php';
  try {
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (e) {
    console.error(`  No pude cargar ${loginUrl}: ${e.message}`);
    console.error('  Comprueba que el WordPress local este arrancado.');
  }
  await page.bringToFront().catch(() => {});

  /* Una prueba de que la ventana pinta algo, en vez de fiarse de que si. */
  const shot = path.join(os.tmpdir(), 'thallo-login-window.png');
  await sleep(1200);
  await page.screenshot({ path: shot }).catch(() => {});
  const title = await page.title().catch(() => '');

  console.log('');
  console.log('  Ventana abierta en: ' + loginUrl);
  console.log('  Titulo de la pagina: ' + (title || '(vacio — algo va mal)'));
  console.log('  Captura de comprobacion: ' + shot);
  console.log('');
  console.log('  Inicia sesion ahi. En cuanto entres, esto lo detecta y se cierra solo.');
  console.log('  (Perfil: ' + profileDir + ')');
  console.log('');

  const deadline = Date.now() + 10 * 60 * 1000;
  let ok = false;
  while (Date.now() < deadline) {
    await sleep(1500);
    const inside = await page
      .evaluate(() => document.body && document.body.classList.contains('wp-admin'))
      .catch(() => false);
    if (inside) {
      ok = true;
      break;
    }
  }

  await sleep(800);
  await browser.close();
  console.log(ok ? '-> sesion guardada en el perfil. Ya puedo grabar.' : '-> no detecte la sesion (agotados 10 min).');
  process.exit(ok ? 0 : 1);
}

// ---------- grabacion ----------
const guionPath = path.resolve('scripts', 'walkthroughs', `${guionName}.mjs`);
if (!fs.existsSync(guionPath)) {
  console.error(`No existe el guion ${guionPath}`);
  process.exit(1);
}
const guion = (await import(pathToFileURL(guionPath).href)).default;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'walkthrough-'));
const frames = [];

fs.mkdirSync(profileDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: !headful,
  userDataDir: profileDir,
  defaultViewport: { width, height, deviceScaleFactor: scale },
  args: [
    '--hide-scrollbars',
    '--disable-infobars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate,MediaRouter',
    `--window-size=${width},${height}`,
  ],
});

let client;
try {
  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.evaluateOnNewDocument(DECOR);

  /* Sin barras de scroll ni cursor de texto parpadeando, que en un vídeo a 30fps
     sale como un defecto de codificación. */
  await page.evaluateOnNewDocument(() => {
    const css = `::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}
                 html{scrollbar-width:none!important}
                 *{caret-color:transparent!important}`;
    const add = () => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head && document.head.appendChild(s);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
    else add();
  });

  const state = { step: 0, total: guion.steps || 0 };
  const ctx = makeContext(page, state);

  // Arranca donde diga el guion, antes de empezar a grabar.
  if (guion.start) await ctx.goto(guion.start, { wait: 1500 });

  client = await page.createCDPSession();
  let n = 0;
  client.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
    const file = path.join(tmpDir, `f${String(n++).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, ts: (metadata && metadata.timestamp) || Date.now() / 1000 });
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch {}
  });

  console.log('-> grabando');
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality,
    maxWidth: width * scale,
    maxHeight: height * scale,
    everyNthFrame: 1,
  });

  await sleep(900);
  await guion.run(ctx);
  await sleep(1200);

  await client.send('Page.stopScreencast');
  await sleep(300);
} catch (err) {
  console.error('');
  console.error('El guion se rompio: ' + err.message);
  console.error('Se monta el MP4 con lo grabado hasta aqui, para poder ver donde fallo.');
  try {
    if (client) await client.send('Page.stopScreencast');
  } catch {}

  /* Una captura del momento exacto del fallo. El MP4 tambien lo muestra, pero
     hay que montarlo y abrirlo; esto se mira de inmediato. */
  try {
    const pages = await browser.pages();
    const p = pages[0];
    const shot = path.join(os.tmpdir(), 'thallo-walkthrough-error.png');
    await p.screenshot({ path: shot });
    console.error('Captura del fallo: ' + shot);
  } catch {}
} finally {
  await browser.close();
}

if (frames.length < 2) {
  console.error('No llegaron fotogramas del screencast.');
  process.exit(1);
}
console.log(`-> ${frames.length} fotogramas capturados`);

// ---------- montaje ----------
const listFile = path.join(tmpDir, 'frames.txt');
const lines = [];
for (let i = 0; i < frames.length; i++) {
  const d = i < frames.length - 1 ? Math.max(1 / 240, frames[i + 1].ts - frames[i].ts) : 1 / fps;
  lines.push(`file '${frames[i].file.replace(/\\/g, '/')}'`);
  lines.push(`duration ${d.toFixed(6)}`);
}
lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`);
fs.writeFileSync(listFile, lines.join('\n'));

fs.mkdirSync(path.dirname(out), { recursive: true });

const ffArgs = [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', listFile,
  '-vf', `fps=${fps},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  out,
];
console.log('-> montando MP4 con ffmpeg');
const code = await new Promise((resolve) => {
  const p = spawn('ffmpeg', ffArgs, { stdio: ['ignore', 'inherit', 'inherit'] });
  p.on('error', (e) => {
    console.error(`ffmpeg no arranco: ${e.message}`);
    resolve(1);
  });
  p.on('close', resolve);
});

if (!keepFrames) fs.rmSync(tmpDir, { recursive: true, force: true });

if (code !== 0) process.exit(code);

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`-> listo: ${out} (${mb} MB)`);
