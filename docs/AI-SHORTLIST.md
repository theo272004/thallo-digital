# The AI Shortlist — cómo se publica

La serie de estudios vive en WordPress como **páginas**, no como entradas del
blog. No sale en el archivo del blog, ni en el feed, ni en "Latest". Nada se
configura: el tema reconoce la serie por dónde están las páginas.

| Qué | Dónde | Cómo lo lee el tema |
| --- | --- | --- |
| El hub | Página con slug `ai-shortlist` | Plantilla `page-ai-shortlist.html`, sola |
| Un volumen | Página hija del hub | Plantilla `AI Shortlist · Volume`, sola |

## Las dos puertas

En el menú de WordPress hay una entrada para cada publicación, y ésa es toda
la diferencia:

- **Blog → New article**: un artículo. Se inserta el patrón *Thallo · post
  skeleton*, se pone imagen destacada, extracto y categoría. Todo lo demás
  (foto de fondo con el título encima, menú lateral, CTA, "Keep reading")
  lo pone la plantilla.
- **AI Shortlist → New volume**: un estudio. Abre el editor con la página ya
  colgada del hub y el patrón del volumen ya cargado. Se escribe encima, se
  pone Industry y extracto, se elige la fecha y se publica o programa.
  **All volumes** lista sólo la serie; **The hub page** abre el hub (y lo
  crea como borrador si aún no existe).

Los dos caminos de abajo siguen valiendo, pero con el menú no hace falta
saber qué es una entrada ni elegir padre a mano.

## El hub

Una página, slug `ai-shortlist`. **Título** = el nombre grande de arriba (la
última palabra sale en cursiva serif sola). **Extracto** = la pregunta en
cursiva bajo el título. **Contenido** = los dos párrafos de introducción.

El title tag, la meta description y la tarjeta OG del hub están fijados en
`wordpress-theme/thallo-blog/inc/shortlist.php` (`thallo_shortlist_hub_seo`)
con los textos exactos que pidió Camila.

## Un volumen

1. Páginas → Añadir nueva. **Título** = la categoría ("Executive search
   firms"). **Extracto** = la pregunta del volumen; es también el teaser en
   el hub. En el panel lateral: **Página superior → The AI Shortlist**, y
   en **Industry** el sector ("Professional Services", "Finance").
2. En el editor, botón + → Patrones → **Thallo · AI Shortlist volume**. Es
   la forma entera del estudio en el orden que todos los volúmenes respetan:
   entradilla, hallazgo, **las dos listas enfrentadas** (lo que nombra la IA
   contra lo que rankea Google), **la tabla por modelo**, las firmas que
   aparecen en las dos, **el reparto por tipo de pregunta**, de qué están
   hechos los resultados y qué dominios se citan, el caso, el aparte de lo
   observado pero no medido, las preguntas y el colofón. Se escribe encima de
   los corchetes; no se reordena.

   Las dos listas enfrentadas son **dos tablas normales** dentro de un bloque
   de columnas: se editan como cualquier otra. La de la derecha lleva
   `thallo-surface--google`, y eso es lo único que pasa sus barras de verde
   oliva a gris. La tabla por modelo lleva `thallo-models` y no dibuja barras
   a propósito — tres barras por fila es un gráfico disfrazado de tabla, y esa
   tabla existe para comparar tres cifras a ojo.

   Tres bloques van como HTML dentro del editor y no como tabla: el reparto
   por tipo de pregunta, la lista de de qué están hechos los resultados y la
   de dominios citados. Se editan, pero con más cuidado que una celda.
   **La forma nueva (desde el 21-09-2026) es por secciones.** Cami pidió
   que un estudio se lea como su referencia: cada apartado es un grupo
   `thallo-sec` a lo ancho, con una etiqueta pequeña encima (`thallo-kicker`:
   "The finding", "Ranking overview", "Agreement"…), el titular, el texto y
   el material a dos columnas — `thallo-sec__grid` con `__main` y `__side`,
   donde el lado es una foto (`thallo-photo`, de las del sitio), una nota
   (`thallo-note`) o una cita (`thallo-quote`) — sobre bandas grises
   alternas (`thallo-sec--band`). **La referencia de esa forma es
   `content/ai-shortlist/executive-search-firms.html`**: para un volumen
   nuevo, copiar ese archivo y escribir encima, no el patrón (que todavía
   tiene la forma de una sola columna). El hero lo pone la plantilla: la foto
   de la derecha la elige el tema por la industria (`thallo_shortlist_art()`).

3. Las tablas de ranking son bloques de tabla normales. La tasa de mención se
   escribe como porcentaje — `78%` — y el tema dibuja la barra en la página.
   La fila de cabecera decide las columnas: `#`, `Firm`, una cabecera con
   `rate` lleva la barra, `position`/`Google rank` es la cifra a la derecha,
   y cualquier otra es una nota que desaparece en el móvil.
4. **Publicar con fecha.** El número del volumen (01, 02…) es su posición en
   la lista ordenada por fecha; nadie lo escribe. Un volumen **programado**
   para una fecha futura aparece en el hub en gris, con "Coming soon" y la
   fecha, sin enlace, hasta que WordPress lo publica. Los borradores no
   aparecen. Para forzar un orden distinto: Atributos de página → Orden.

El title tag de un volumen es `The AI Shortlist, Vol. 01 — <título> | Thallo
Digital`; la descripción y la tarjeta OG salen del título y del extracto.
La línea del final ("Volume 02, …, publishes 27 October") se lee del
calendario, nunca se escribe.

## La dirección

En producción WordPress está en `/blog/`, así que la serie contesta en
`thallodigital.com/blog/ai-shortlist/` hasta que se pegue la regla de
[`deploy/ai-shortlist.htaccess`](../deploy/ai-shortlist.htaccess) en el
`.htaccess` de la raíz (instrucciones dentro del archivo). El tema mira si
esa regla existe: mientras no esté, todos sus enlaces siguen bajo `/blog/`;
en cuanto esté, los pasa a `thallodigital.com/ai-shortlist/` solo, sin volver
a subir nada.

## Local

`preview_start` con la entrada **`blog`** del `.claude/launch.json` de este
repositorio arranca `C:\Users\NICOLAS\Desktop\thallo-local-wp\start.ps1` y sirve
el WordPress local en <http://localhost:8081/>. El hub responde en
`http://localhost:8081/ai-shortlist/` — sin `/blog/` delante, porque en local
WordPress está en la raíz y `thallo_shortlist_at_root()` lo detecta solo.

El hub y un volumen se crean desde wp-admin como en producción: **AI Shortlist
→ The hub page** y **AI Shortlist → New volume**.

> Este apartado describía un `blog-local/seed-shortlist.php` y un servidor en
> el 8080. Ninguno de los dos existe en este repositorio; eran de otro sitio de
> trabajo. Si alguna vez hace falta sembrar la serie de un golpe, hay que
> escribir ese script, no buscarlo.

## Subir

`npm run theme:zip` → `wordpress-theme/thallo-blog.zip` → WP → Apariencia →
Temas → Añadir nuevo → Subir (sobrescribe el instalado). Después, crear la
página `ai-shortlist` y las hijas como arriba.
