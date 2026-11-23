# Integración de los extras de la organización

**Estado:** brief confirmado por la autora; los cinco extras están implementados en la ruta prototipo del capítulo 1; revisión manual pendiente.

## O-01 — Completo italiano con efecto

- **Escena:** pausa del turno en la mesa de colación del Campamento Horizonte.
- **Diálogo:** la persona de la colación avisa: «Queda una pura». Si Maite toma el completo, una voz desde la carpa reclama: «Oye… ¿quién se sacó mi tocomple?» Maite responde: «Te aviso luego si estaba envenenado, jeje…».
- **Asset:** [`assets/drafts/extras/completo-italiano-v1.png`](../assets/drafts/extras/completo-italiano-v1.png), icono transparente pixel art con tomate, palta y mayonesa.
- **Efecto de juego:** comerlo consume el objeto y concede una ficha de pista, disponible una sola vez en el puzle de las horas del relevo. La ficha revela una relación estratégica entre dos eventos; no rellena la respuesta. El guardado persiste tanto la comida como el uso. Así produce un efecto mecánico visible sin cambiar los tres atributos principales.
- **Cuidado narrativo:** es una pausa voluntaria de colación; no reemplaza el descanso que el juego trata como condición laboral.

## O-02 — Guiño original a 31 Minutos

- **Escena:** cápsula opcional de 31 segundos, «Noticiero del Salar», durante la pausa del campamento.
- **Asset:** [`assets/drafts/extras/reportero-guante-turno-v1.png`](../assets/drafts/extras/reportero-guante-turno-v1.png), reportero títere original hecho con un guante de trabajo, casco y micrófono de lata.
- **Diálogo tentativo:** el Guante de Turno anuncia, con solemnidad absurda, que «la hoja sin firma fue vista por última vez en la oficina». Maite responde que la buscará en el registro. El chiste lleva a una interacción real sin burlarse de incidentes ni personas.
- **Límite creativo:** homenaje al formato de noticiero de títeres chileno; no reutilizar nombres, personajes, diseños, logotipo, música, voces ni frases de la serie.

## O-03 — Frase literal

La frase exacta **«Queda una pura»** se verá en el diálogo de la mesa de colación, antes de recoger el último completo. Mantener mayúsculas y palabras tal cual; no esconderla solo en este documento.

## O-04 — Secreto 23

- **Lugar:** parte trasera/borde del escritorio de la Oficina de Operaciones, visible solo al explorar e interactuar con ese rincón.
- **Pista:** la primera vez que Maite entra, comenta que vio un destello pequeño junto al escritorio; la frase aparece una sola vez y no revela el número.
- **Asset:** [`assets/drafts/extras/placa-23-secreta-v1.png`](../assets/drafts/extras/placa-23-secreta-v1.png), placa metálica pequeña con «23» legible.
- **Recompensa:** una nota opcional en el diario, persistente al guardar y cargar. No cuenta como evidencia de auditoría ni es necesaria para completar un puzle.
- **Lectura visual:** reducir mucho la placa y dejarla parcialmente tapada; ofrecer una alternativa de interacción accesible además del descubrimiento solo por vista.

## O-05 — Logo de Codex

- **Archivo de origen recibido en la carpeta:** `codex.png` (640 × 640, RGBA). SHA-256: `87B2480A8FBB1EE1C3454E40EF2CD3C3A8D98E7203ECEE25FDFB50B813F0AAFA`.
- **Copia de proyecto:** [`assets/third-party/codex.png`](../assets/third-party/codex.png), copiada sin cambios.
- **Ubicación propuesta:** placa de créditos/título color marfil, con espacio y margen suficientes para que el trazo negro del logo contraste. No recolorear ni redibujar.
- **Fuente indicada en el brief:** <https://hackathon.codexparatodos.com/logos/codex.png>. Licencia de uso no indicada en el archivo recibido; conservar atribución y verificar antes de publicar.

## Lista de aceptación manual

1. Recoger y comer el completo; observar el reclamo y la respuesta de Maite, gastar la ficha una sola vez, comprobar que orienta sin rellenar una hora y revisar el guardado/carga.
2. Abrir la cápsula original del Noticiero del Salar y comprobar que el guiño se entiende sin copiar elementos de la serie.
3. Confirmar la cadena literal `Queda una pura` en la interfaz del juego.
4. Encontrar la placa 23 en la exploración; verificar nota en el diario y que el secreto sea opcional.
5. Ver el logo Codex en el juego sobre fondo claro y confirmar que es el PNG recibido, sin edición.

## Alcance actual

La ruta nueva implementa estos cinco puntos y conserva el HTML monolítico anterior solo como referencia. El completo, el noticiero de 31 segundos, la frase, la placa y el logo aparecen en juego. La lista manual de aceptación anterior sigue pendiente de revisión en navegador; no afirmar que quedó verificada hasta completar esa revisión.
