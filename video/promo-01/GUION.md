# Promo 01 · "La llamada"

**Duración:** 59,6 s (1,2 s de entrada en silencio, 54 s de voz y 4 s de cierre) · **Formato:** 1920×1080, 30 fps · **Voz:** Camila (ElevenLabs), en inglés

## La idea

El audio no habla de IA, habla de una brecha: **en una llamada tu experiencia es evidente, en tu web no.**
Thallo cierra esa brecha: escucha, convierte lo que oye en contenido y lo distribuye.

El video lo cuenta con un solo objeto que atraviesa toda la pieza: **lo que se dice en la llamada.**
Los subtítulos de la llamada pasan a ser notas, las notas no llegan a la web genérica, Thallo las recoge
en una entrevista y al final esas mismas frases son los titulares de la web nueva
("Why clients choose us" sale de "why clients choose your firm").
El cierre vuelve a la llamada: *Let's talk.*

## Escenas

| Tiempo | Capítulo | Lo que dice la voz | Lo que se ve |
|---|---|---|---|
| 0:00–0:05 | 01 The call | "If we got on a call right now…" | Videollamada en curso: Camila (isotipo Thallo) y "You · your firm". El anillo y la onda reaccionan a la voz real; subtítulos en vivo palabra por palabra; "why clients choose your firm" se subraya en lima. |
| 0:05–0:12 | 01 The call | "…a few examples, how you work…" | La llamada se hace a un lado y aparecen las **notas de la llamada**: cada punto entra al decirse y la barra "Picture of your firm" se va llenando. |
| 0:12–0:16 | 02 Your website | "But how much of that would I get from your website?" | Barrido lateral hacia **yourfirm.com**, una web genérica ("Innovative solutions for your business"). Las notas intentan entrar, se apagan y caen. Un garabato rodea el titular vacío; la web se desatura. |
| 0:16–0:17 | — | "That's where we can help." | Telón oliva, la flor de Thallo gira y entra el titular. |
| 0:17–0:25 | 03 We listen | "At Thallo, we sit down with your team…" | Foto de la marca (mesa, cuaderno Thallo) con movimiento lento. Libreta de entrevista: tres preguntas que aparecen con la voz y se "responden" a mano. |
| 0:25–0:29 | 03 We listen | "…the work you've done together and the results…" | La libreta gira: proyectos A, B y C en una línea de tiempo y la **rama que crece** (el motivo del sitio) hasta "Results ↗". |
| 0:29–0:39 | 04 We build | "Then, we turn that knowledge into service pages, blog posts, case studies…" | Corte a papel claro. Todo lo escuchado aparece como etiquetas, se concentra en una chispa lima y nacen cuatro piezas (website pages, blog, case study y guía), cada una justo con su palabra; en pantalla se dice "Website pages" y no "service pages" para no limitar el tipo de páginas. Cada tarjeta dice de qué parte de la llamada salió ("From: how you work"). Un cursor de comprador las recorre y aparece *Good fit — let's talk*. |
| 0:39–0:47 | 05 We run it | "We take care of the writing, SEO, publishing, and distribution…" | Pipeline de 4 pasos que se enciende con cada palabra ("You approve · we run it", frase real del modelo de servicio). Después el contenido se reparte a canales: Google, ChatGPT, Claude, Gemini, Perplexity, LinkedIn e industry media, y de ahí a personas. Así se conecta con la visibilidad en IA aunque la voz no la nombre. |
| 0:47–0:53 | 06 The result | "If you want your website to reflect your level of expertise…" | Vuelve **la misma web genérica** y se reescribe ante los ojos: "Leadership hires for teams that can't afford a miss." Entran notificaciones de consultas calificadas. |
| 0:53–0:58 | — | "Let's talk." | La pared con la flor iluminada, *Let's talk.*, logotipo, thallodigital.com y *Book a call →*. Fundido a negro. |

## Decisiones de diseño

- **Marca respetada al 100 %:** la misma regla de color que la web. Oliva `#39471D` y papel `#F7F8F3`; la cursiva de acento va en oliva sobre fondo claro y en salvia `#CBD0AC` sobre oscuro. El lima `#DFFF3B` queda solo en elementos gráficos (anillo de voz, pipeline, puntos, botón final), nunca en texto. Sin fondos verde claro. Inter extrabold con cursiva light para el acento y kickers en Space Mono; no se cambió ninguna tipografía.
- **Fotos de la marca en vez de cajas vacías:** las cuatro piezas de "We build" llevan fotografía real; las respuestas de la entrevista son líneas rectas, sin recuadro.
- **Las fotos son las del sitio** (`public/`), así el video y la web se sienten como una sola marca.
- **Ninguna cifra inventada.** Los gráficos suben sin números; la "firma" de ejemplo es ficticia y genérica (búsqueda ejecutiva / fintech, coherente con el Volume 01).
- **Acabado de cine:** grano de película fijo y viñeta en las escenas oscuras; arranque desde negro y la voz entra a los 1,2 s, cuando la llamada ya está asentada en pantalla.
- **Relevos limpios:** un titular nunca entra antes de que salga el anterior; los cortes de línea están puestos a mano.
- **Sincronía real:** cada entrada está anclada a una palabra transcrita con marcas de tiempo, no a "más o menos ahí". Si se graba otra toma de voz, se vuelve a transcribir y todo se recoloca solo.

## Archivos

- `index.html`: la animación (GSAP). Ábrela con `?play` para verla en tiempo real con audio, o con `?t=31.5` para congelar un fotograma.
- `render.mjs`: la exporta fotograma a fotograma a `out/silent.mp4`.
- `mix.py`: crea la cama sonora sintetizada y genera los MP4 finales.
- `out/thallo-promo-01.mp4`: versión final (voz + música/sonido).
- `out/thallo-promo-01-vo-only.mp4`: solo voz, para ponerle música licenciada.
- `out/thallo-promo-01.srt`: subtítulos para LinkedIn y YouTube.

```bash
node video/promo-01/render.mjs
python -I video/promo-01/mix.py
```

## ¿Y Google Flow (Veo)?

**Recomendación: no rehacerlo entero en Flow.** El mensaje es de proceso (llamada → notas → contenido → canales) y eso se explica mejor con interfaz animada que con personas. Además, el video generado es difícil de sincronizar palabra por palabra y suele deformar textos, logos y pantallas.

Donde Flow **sí** aporta es en sumar presencia humana en dos momentos. Son tomas de 4 a 8 s que se intercalan como fondo, debajo de la misma gráfica:

1. **0:00–0:05, la llamada.** Reemplazar el fondo desenfocado:
   > Cinematic close-up, a founder of a professional services firm on a video call in a warm, dimly lit office, speaking animatedly and gesturing with their hands, laptop glow on the face, dark olive green and warm wood tones, shallow depth of field, soft window light, 35mm film look, slow push-in, no text on screen.

2. **0:17–0:25, "we sit down with your team".** Detrás de la libreta:
   > Overhead-to-eye-level slow dolly across a dark wooden meeting table, two people in a calm working session, an olive-green notebook open with handwritten notes, ceramic mugs, a small plant, moody low-key lighting with warm highlights, muted olive and charcoal palette, editorial and premium, no faces in sharp focus, no text, no logos.

Consejos para Flow: pedir siempre **"no text, no logos"** (los logos se ponen después y quedan nítidos); generar varias tomas y elegir; mantener la paleta oliva/carbón para que encaje con las fotos de la marca.

## Siguientes pasos posibles

- **Versión vertical 9:16** (Reels, Shorts, LinkedIn móvil): misma animación, recompuesta.
- **Música licenciada** (Artlist o Epidemic) sobre la versión "vo-only": la cama sintetizada es correcta, pero una pista real sube la calidad.
- **Subtítulos quemados** para autoplay sin sonido.
