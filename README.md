# Maite: Rumbo al Salar

Prototipo RPG narrativo educativo para la hackatón Build Games with Codex. Esta versión contiene una ruta jugable para los capítulos 1 y 2, con dos puzles por capítulo. El capítulo 2 continúa desde el cierre del primero en la Estación Vega Norte; los capítulos 3–5, los otros seis puzles y los finales quedan fuera de este prototipo.

## Cómo jugar

Abre `index.html` en Chrome, Edge o Firefox actualizado. No requiere instalación, servidor, dependencias ni conexión de red. La partida se guarda automáticamente en el almacenamiento local del navegador donde se abrió.

## Objetivo de esta versión

Ayuda a Maite a acordar un relevo seguro para Don Jaime y comprobar las horas del turno antes de registrar el acuerdo.

1. Habla con la Señora Nancy.
2. Conversa con Don Jaime y escucha su aviso.
3. Si quieres, toma el completo italiano: su ficha de un solo uso ayuda a relacionar la salida anotada con la llamada a Tomás, sin rellenar una respuesta. Al tomarlo, una voz reclama su tocomple y Maite responde: «Te aviso luego si estaba envenenado, jeje…». Explora también el Noticiero del Salar.
4. Entra a la Oficina de Operaciones y resuelve **Las horas del relevo**: coloca en la línea de tiempo los eventos de salida, llamada, colación, aviso radial y regreso del bus, usando las fichas de registros.
5. Habla con Tomás y decide qué información del aviso puede registrarse.
6. Encuentra a Diego, aísla la mancha y registra su ubicación sin adivinar su composición.
7. En la oficina, resuelve **Deja libre el paso del patio**: mueve las piezas en la dirección indicada, mantén libre la zona roja aislada y saca la camioneta por el carril verde. Vuelve con Nancy para cerrar el turno.
8. Busca el detalle opcional **23** en el borde trasero del escritorio. Al entrar a la oficina, Maite menciona una vez un pequeño destello para orientar la exploración.
9. Al cerrar el capítulo 1, continúa a la **Estación Vega Norte**. Habla con Constanza y revisa el monitor: el resumen diario no reemplaza la lectura original H-17.
10. En la estación, habla con Constanza y Benjamín, revisa H-17 y clasifica cuatro registros entre la ruta terrestre y el emisario marino. Encuentra las notas de la maqueta, reparte ocho fichas con las relaciones indicadas y registra la observación de Eliana antes de cerrar el acuerdo.

## Controles

- Caminar: WASD o flechas. También puedes hacer clic en un punto del escenario.
- Mapa de tránsito (diagnóstico): B muestra en verde el área transitable y en rojo casas, plantas y objetos bloqueados.
- Interactuar: E o clic/tap directamente en el modelo del NPC; los demás puntos interactivos conservan sus etiquetas.
- Diálogo: clic, Enter o Espacio; las opciones también aceptan teclas 1 y 2.
- Puzle del relevo: elige una tarjeta de evento y luego una hora; puedes cambiarla de lugar, retirarla o reiniciar la línea de tiempo.
- Puzle del patio: selecciona una pieza y usa las flechas de pantalla o del teclado para moverla una casilla. Esc sale del puzle.
- Puzle de trazabilidad: asigna cuatro tarjetas a la ruta terrestre o marina con botones visuales. Puedes pausar el minuto, pedir pistas, revisar fuentes o restablecerlas.
- Puzle de maqueta: selecciona una de ocho fichas numeradas y luego una bandeja; puedes cambiarla o devolverla individualmente. Las notas, pistas y cronómetro opcional están disponibles antes y durante el reparto.
- Esc cierra un puzle abierto y pausa el reloj.
- Paneles: M mochila, C evidencias, J diario, K atributos, V sonido.
- Menú de pausa: Esc.

## Incluye

- Campamento y oficina con arte de fondo original del proyecto.
- Diálogos con alternativas, misión, evidencia y atributos persistentes.
- Dos puzles lógicos: reconstruir una secuencia de cinco eventos con registros del turno y despejar el acceso del patio respetando el gabinete fijo y la zona aislada.
- Capítulo 2 con escena de la Estación Vega Norte, Constanza, Benjamín y Eliana con retratos, tablero de trazabilidad simplificado, notas distribuidas en el mapa y balance de ocho fichas con solución única (Planta 4, Reserva 2, Prueba 2). Las maquetas son ejercicios didácticos; H-17 queda pendiente de verificación con datos originales.
- Los cinco extras confirmados por la autora, integrados en esta ruta: completo con pista de un uso, Noticiero del Salar de 31 segundos, frase «Queda una pura», detalle secreto 23 y logo Codex.
- Guardado local y opción de reiniciar con confirmación.
- Música original para los capítulos 1 y 2, loop de puzle y transición entre capítulos, con fundidos y control de silencio. Se inicia tras activar ♫.

## Requisitos y límites conocidos

- Navegador moderno con JavaScript y reproducción WAV habilitados. Por política del navegador, la música comienza tras una interacción para activar el sonido.
- La ruta usa assets v1; el equipo revisó su apariencia para esta versión. Algunos recursos siguen identificados como borradores en el registro de assets.
- El botón Créditos identifica el PNG de Codex y los recursos creados para el proyecto. La licencia del logo Codex aún debe confirmarse antes de publicar.
- La licencia MIT de `LICENSE` cubre el código del prototipo, no concede derechos sobre el logo Codex ni sobre las fotos fuente excluidas del repositorio.
- No se carga código o tipografía remota; el juego puede abrirse sin internet.

## Archivos y documentación

- `index.html`, `game.css`, `game.js`: prototipo jugable.
- `assets/drafts/`: imágenes generadas v1.
- `assets/audio/music/`: temas de los capítulos 1 y 2, loop de puzle y cues seleccionados del paquete de audio entregado.
- `assets/third-party/codex.png`: logo recibido de la autora, sin cambios.
- `docs/integracion-extras-organizacion.md`: diseño y aceptación de los extras.
- `docs/recursos-terceros.md`: fuentes y licencias pendientes.
- `docs/prompt-maestro.md`: especificación completa del juego previsto.

## Integrantes

**Equipo: AFKs Games**

- Luis Bobadilla.
- Juan Alejandro Seguel Donoso.
- Sofia Ignacia Cifuentes Tudela — autora registrada en el historial Git local.

Los aportes individuales se completarán en la entrega final.

## Trabajo con Codex

El prototipo se construyó e iteró con Codex durante la jornada de la hackatón: se usó para desarrollar la ruta jugable, ajustar navegación y puzles, e integrar los requisitos de la organización. Se hicieron comprobaciones manuales en navegador del capítulo 1 y queda pendiente una pasada manual del capítulo 2. Los borradores visuales se generaron con ImageGen; su procedencia y estado de revisión están documentados en `docs/registro-assets.md`. No se han registrado otras herramientas de IA.

## Recursos de terceros y licencias

El código del juego se distribuye bajo MIT; consulta [`LICENSE`](LICENSE). Los recursos mantienen sus licencias por separado. El inventario, la procedencia y los permisos pendientes están en [`docs/recursos-terceros.md`](docs/recursos-terceros.md). La licencia del logo Codex sigue pendiente de confirmación; MIT no cubre ese archivo.

## Entrega y demostración

Para mostrar la demo, abre `index.html` en un navegador y recorre el juego funcionando. La organización evalúa el prototipo jugable; un video o unas diapositivas no lo sustituyen. El repositorio público de entrega es [Sofizza/maite-rumbo-al-salar](https://github.com/Sofizza/maite-rumbo-al-salar). La revisión manual del capítulo 2 y la confirmación de la licencia del logo Codex siguen pendientes; MIT cubre solo el código.

## Estado de la entrega

Prototipo de dos capítulos. El recorrido, puzles, guardado, reinicio y controles del capítulo 1 se comprobaron manualmente en navegador. El capítulo 2 está integrado, pero requiere una pasada manual. Los cinco requisitos de la organización están implementados en el prototipo; su revisión manual y la licencia del logo siguen pendientes. El checklist de entrega está en [`docs/lista-entrega-y-pruebas.md`](docs/lista-entrega-y-pruebas.md). La hackatón pide un repositorio público, licencia open source, instrucciones de ejecución y registro de recursos de terceros y sus licencias: [requisitos del evento](https://luma.com/zv06n9np?locale=es).
