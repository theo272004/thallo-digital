/**
 * El recorrido: publicar un artículo del blog, de principio a fin.
 *
 * Es el tutorial para alguien que no ha tocado WordPress nunca. Por eso el
 * guion hace exactamente lo que haría esa persona — nada de atajos por URL, ni
 * de rellenar campos por JavaScript: se pincha en el menú, se elige el patrón,
 * se escribe, se sube la foto y se publica.
 *
 * Los cuatro campos que la persona tiene que rellenar (título, extracto, imagen
 * destacada y categoría) llevan cada uno su paso y su rótulo, porque son lo
 * único que la plantilla no puede adivinar. Todo lo demás — la foto de fondo
 * con el título encima, el menú lateral, el CTA del final, "Keep reading" — se
 * enseña al final, ya publicado, para que se vea que aparece solo.
 */

const TITULO = 'Why your buyers ask a model before they ask you';

const EXTRACTO =
  'Buyers now build a shortlist before they ever fill in a form. This is what that means for the way you publish.';

/* Una de las cinco de `inc/hub.php`. Si no coincide con una de ellas, el
   artículo se publica igual pero no aparece en su casilla de la portada. */
const CATEGORIA = 'AI Visibility';

export default {
  steps: 11,
  start: '/wp-admin/',

  async run(ctx) {
    // ── 1 · De dónde se sale ────────────────────────────────────────────────
    await ctx.say(
      'Esto es el escritorio de WordPress. Todo el artículo se hace desde aquí; no hace falta tocar código ni pedirle nada a nadie.',
      { hold: 3200 },
    );

    // ── 2 · La puerta del blog ──────────────────────────────────────────────
    await ctx.say('En el menú de la izquierda, "Blog" → "New article".', { hold: 2200 });
    await ctx.click('#menu-posts', { after: 1200 });
    await ctx.click('#menu-posts a[href="post-new.php"]', { after: 6000 });

    // El editor tarda en montarse; esperamos al modal de patrones.
    await ctx.page
      .waitForSelector('.editor-start-page-options__modal', { visible: true, timeout: 30_000 })
      .catch(() => {});
    await ctx.sleep(1500);

    // ── 3 · El patrón ───────────────────────────────────────────────────────
    await ctx.say(
      'WordPress ofrece la plantilla del artículo solo. Se elige "Thallo · post skeleton" y ya está toda la estructura puesta.',
      { hold: 3600 },
    );
    await ctx.click('.block-editor-block-patterns-list__list-item', { after: 3500 });

    // ── 4 · El título ───────────────────────────────────────────────────────
    await ctx.say('Primero de los cuatro datos: el título.', { hold: 2000 });

    const canvas = await ctx.canvas();
    const titulo = await canvas.waitForSelector('.editor-post-title__input, [contenteditable][aria-label*="title" i]', {
      visible: true,
      timeout: 20_000,
    });
    await titulo.click();
    await ctx.sleep(500);
    await ctx.write(TITULO, { delay: 42, after: 1200 });

    // ── 5 · El cuerpo ───────────────────────────────────────────────────────
    await ctx.say(
      'El cuerpo ya viene escrito como ejemplo: se escribe encima. Los títulos de sección son los "Heading" — de ahí sale el menú lateral.',
      { hold: 4200 },
    );
    await ctx.scroll(500, { ms: 1400 });
    await ctx.sleep(1200);
    await ctx.scroll(0, { ms: 1000 });

    // ── 6 · El panel de la derecha ──────────────────────────────────────────
    await ctx.say('Lo que queda está en el panel de la derecha, en la pestaña "Post".', { hold: 2600 });
    const ajustes = await ctx.page.$('button[aria-label="Settings"][aria-pressed="false"]');
    if (ajustes) await ctx.click('button[aria-label="Settings"]', { after: 1600 });
    await ctx.click('button[aria-label="Post"]', { after: 1400 }).catch(() => {});

    // ── 7 · El extracto ─────────────────────────────────────────────────────
    await ctx.say(
      'El extracto. Es el párrafo blanco que va sobre la foto, y también el resumen en la portada del blog. Si se deja vacío, WordPress se inventa uno cortando el primer párrafo.',
      { hold: 4600 },
    );
    /* "Add an excerpt…" abre un desplegable; el campo vive dentro, en
       `.editor-post-excerpt__textarea`. El boton no tiene aria-label, asi que
       se busca por su texto. */
    await ctx.clickByText('button', /add an excerpt/i, { after: 1600 });

    const campoExcerpt = await ctx.page
      .waitForSelector('.editor-post-excerpt__textarea textarea', { visible: true, timeout: 10_000 })
      .catch(() => null);

    if (!campoExcerpt) throw new Error('no encontre el campo de extracto');

    await campoExcerpt.click();
    await ctx.write(EXTRACTO, { delay: 24, after: 1400 });

    /* Cerrar el desplegable pinchando fuera, NO con Escape: Escape descarta lo
       escrito y deja el extracto vacio — el articulo se publica igual y nadie
       se entera hasta que la portada sale sin resumen. */
    await ctx.clickByText('button', /^Summary$|^Post$/i, { after: 1200 }).catch(() => {});
    await ctx.press('Tab', { after: 1200 });
    await ctx.sleep(800);

    /* La comprobacion buena no es el textarea sino el almacen del editor: es lo
       que se guarda de verdad al publicar. */
    const guardado = await ctx.page
      .evaluate(() => window.wp.data.select('core/editor').getEditedPostAttribute('excerpt'))
      .catch(() => '');
    if (!String(guardado || '').trim()) throw new Error('el extracto no llego al editor');

    // ── 8 · La imagen destacada ─────────────────────────────────────────────
    await ctx.say(
      'La imagen destacada. Es la foto grande del principio del artículo — la que se ve detrás del título.',
      { hold: 3600 },
    );
    await ctx.click('.editor-post-featured-image__toggle', { after: 2600 });

    // El modal de medios: subir un archivo del ordenador.
    await ctx.note('Se sube una foto desde el ordenador, como en cualquier sitio.', { hold: 2400 });
    const subir = await ctx.page
      .waitForSelector('.media-modal input[type="file"]', { timeout: 15_000 })
      .catch(() => null);
    if (subir) {
      await subir.uploadFile(ctx.foto);
      await ctx.sleep(4500);
      const botonSet = await ctx.page.$('.media-modal .media-button-select, .media-modal button.media-button-select');
      if (botonSet) {
        await ctx.click('.media-modal .media-button-select', { after: 3000 });
      }
    }
    await ctx.sleep(1500);

    // ── 9 · La categoría ────────────────────────────────────────────────────
    await ctx.say(
      'La categoría. Tiene que ser una de las cinco del blog: si se escribe otra, el artículo se publica igual pero no aparece en su casilla de la portada.',
      { hold: 4400 },
    );
    /* El panel de categorias empieza plegado: sin abrirlo no hay casillas que
       marcar. Y la casilla se busca por su nombre — marcar "la primera de la
       lista" es como se colo "Uncategorized" en la primera toma. */
    /* "Categories" es el texto del boton que pliega el panel, no un aria-label:
       los `components-panel__body-toggle` de WordPress llevan el nombre dentro.
       Si el panel ya estuviera abierto, no pasa nada por no encontrarlo. */
    await ctx.clickByText('button', /^Categories$/i, { after: 1800 });
    await ctx.sleep(900);

    const marcada = await ctx.checkByLabel(CATEGORIA);
    if (!marcada) throw new Error(`no encontre la categoria "${CATEGORIA}"`);
    await ctx.sleep(1200);

    // ── 10 · Publicar ───────────────────────────────────────────────────────
    await ctx.say('Y ya está: Publicar.', { hold: 2000 });
    await ctx.click('.editor-post-publish-panel__toggle', { after: 2200 });
    await ctx.click('.editor-post-publish-button', { after: 6000 }).catch(() => {});
    await ctx.sleep(2500);

    // ── 11 · Lo que puso la plantilla sola ──────────────────────────────────
    await ctx.say('Esto es lo que ha quedado — y nada de lo que viene ahora se ha escrito a mano.', { hold: 3200 });

    /* El enlace al artículo publicado lo da el propio panel de WordPress: se
       lee de ahí en vez de construir la URL, que es lo que haría la persona. */
    const enlace = await ctx.page
      .$eval('.post-publish-panel__postpublish-header a, .components-notice a', (a) => a.href)
      .catch(() => null);

    await ctx.goto(enlace || '/', { wait: 2500 });

    await ctx.note('La foto de fondo con el título encima: la pone la plantilla con la imagen destacada.', {
      hold: 3800,
    });
    await ctx.scroll(760, { ms: 1800 });
    await ctx.note('El menú lateral se construye solo, leyendo los títulos de sección del artículo.', { hold: 3800 });
    await ctx.scroll(1700, { ms: 2000 });
    await ctx.sleep(1200);
    await ctx.scroll(3200, { ms: 2200 });
    await ctx.note('El bloque final y "Keep reading" van en todos los artículos. Nadie los escribe.', { hold: 3800 });
    await ctx.scroll(4400, { ms: 2000 });
    await ctx.sleep(1500);
    await ctx.hush();
    await ctx.sleep(800);
  },
};
