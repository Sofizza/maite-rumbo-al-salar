# Cinco requisitos adicionales de la organización

La organización indicó cinco ingredientes sorpresa que deben integrarse al juego. Mantenerlos separados de la especificación general, conservar su formulación original y vincular cada uno a una prueba observable. Fueron compartidos por el equipo el 23 de noviembre de 2026; quedan anotados para la fase de integración.

Fuente de los requisitos y del código de honor: [página de la hackatón](https://hackathon.codexparatodos.com/?referrer=luma&utm_source=luma). Logo indicado: [descargar codex.png](https://hackathon.codexparatodos.com/logos/codex.png). Leer el código de honor antes de entregar.

| ID | Requisito literal | Evidencia presencial solicitada | Parte del juego/documentación afectada | Cómo se verificará | Estado |
| --- | --- | --- | --- | --- | --- |
| O-01 | **Un completo italiano.** Tiene que producir algún efecto en la partida. | Mostrar un efecto observable en una partida. | Consumible de colación; al comerlo concede una ficha de pista que se usa una vez en un puzle. | Recogerlo, comerlo, comprobar el indicador de pista, usarla en un puzle y verificar guardado/carga. | Implementado en prototipo; revisión manual pendiente |
| O-02 | **Un guiño a 31 Minutos.** Reinterprétenlo a su manera. | Incluir una reinterpretación reconocible dentro del juego. | Viñeta breve «Noticiero del Salar» con un títere original de guante parchado y duración de 31 segundos; humor de noticiero chileno absurdo. | Ver la escena y confirmar que no usa personajes, frases, música ni logotipos del programa. | Implementado en prototipo; revisión manual pendiente |
| O-03 | **La frase «Queda una pura».** Inclúyanla en algún momento del juego. | La frase aparece literalmente en el juego. | Diálogo en la mesa de colación del campamento: «Queda una pura». | Buscar la cadena literal y verla en la conversación de la colación. | Implementado en prototipo; revisión manual pendiente |
| O-04 | **El número 23.** Escóndanlo como un secreto o un detalle por descubrir. | Número 23 descubrible como secreto/detalle. | Placa pequeña y opcional en el borde trasero del escritorio de Operaciones; descubrirla agrega una nota de curiosidad al diario, no evidencia legal. | Explorar e interactuar con la placa; comprobar secreto/nota persistente y que no sea obligatoria para avanzar. | Implementado en prototipo; revisión manual pendiente |
| O-05 | **El logo de Codex.** Inclúyanlo en algún lugar del juego. | Logo visible en el juego. | Copia exacta de `assets/third-party/codex.png`, exhibida sobre una placa marfil en créditos/título para dar contraste. | Comprobar legibilidad y visibilidad en la entrega; revisar atribución/licencia. | Implementado en pantalla de título; revisión de licencia pendiente |

Diseño y estado por requisito: [`integracion-extras-organizacion.md`](integracion-extras-organizacion.md). Los cinco extras están confirmados por la autora e incluidos en la ruta prototipo del capítulo 1. La versión HTML anterior sigue siendo referencia, sin modificar.

## Criterios para documentarlos

- Copiar literalmente cada propuesta y registrar quién la entregó y cuándo.
- Distinguir el requisito de la evidencia que pide la organización y del mecanismo que se implementará.
- Asociar cada requisito con archivos, escenas o decisiones concretas y con una prueba reproducible.
- Si dos extras se contradicen con el prompt maestro, anotarlo en la bitácora y resolverlo con el equipo antes de modificar el alcance.
- No afirmar que algo demuestra desarrollo presencial si la organización no lo reconoce como evidencia suficiente.
