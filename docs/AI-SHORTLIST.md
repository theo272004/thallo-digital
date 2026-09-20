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
   hallazgo, tabla, tres sorpresas, fuentes, patrones, comparación con
   Google, preguntas, colofón. Se escribe encima de los corchetes; no se
   reordena.
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

`preview_start` con la entrada **`blog`** del `.claude/launch.json` de la
carpeta madre sirve el WordPress local en <http://127.0.0.1:8080/>.
`blog-local/seed-shortlist.php` crea el hub, un volumen publicado con el
patrón y cinco programados — el estado de la serie en el lanzamiento.

## Subir

`npm run theme:zip` → `wordpress-theme/thallo-blog.zip` → WP → Apariencia →
Temas → Añadir nuevo → Subir (sobrescribe el instalado). Después, crear la
página `ai-shortlist` y las hijas como arriba.
