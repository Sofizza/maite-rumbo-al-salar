# Lista de entrega y pruebas

Usar esta lista durante desarrollo y marcar cada punto solo tras verificarlo. Registrar qué fue comprobado automáticamente, qué se observó manualmente y qué queda pendiente. No afirmar que el código se probó hasta ejecutar la comprobación correspondiente.

## Juego

- [ ] Menú de inicio a pantalla completa; Jugar/Continuar y Partida nueva.
- [ ] Confirmación antes de reemplazar una partida existente.
- [ ] Cinco capítulos, veinte pasos y objetivos visibles.
- [ ] Ruta jugable desde inicio a cierre y transiciones 1→2, 2→3, 3→4, 4→5.
- [ ] Diez puzles; solución, error, pista, reinicio, reintento y persistencia verificados.
- [ ] Tres finales y resumen de atributos.
- [ ] Mochila, Carpeta, Diario y Referencias sincronizados con el estado.
- [ ] Teclado, clic/toque, controles táctiles, foco, etiquetas y tooltips.
- [ ] Maite y NPC patrullando se mueven simultáneamente; los marcadores siguen a NPC móviles.
- [ ] Mapa B marca rutas libres en verde y casas, plantas y objetos en rojo; colisión y recorrido por clic verificados en campamento y oficina a varios tamaños.
- [ ] Audio inicia tras interacción válida; mute y preferencia persisten.
- [ ] Guardar/cargar desde patio, oficina y transición; recompensas no se duplican.
- [ ] Conversaciones, puzles y casos interactivos funcionan después de recargar.

## Oficina y arte

- [ ] Entrada a la oficina desde el patio y regreso conservando el estado.
- [ ] Constanza y la Señora Nancy se distinguen y pueden iniciar conversación.
- [ ] Maite camina entre escritorio, mesa y alfombra sin bloquearse.
- [ ] Salir al campamento permanece accesible aunque haya un prompt de interacción.
- [ ] Escala/posición de Maite y Ale y dimensiones del mobiliario comprobadas contra referencias disponibles.
- [ ] Dos láminas PNG transparentes de 1040 × 72 px, 20 celdas de 52 × 72 px, direcciones/orden/ancla correctos.
- [ ] Transparencia, recortes, identidad y lectura revisados a tamaño real.
- [ ] Cada recurso tiene origen, versión y estado de aprobación en [`registro-assets.md`](registro-assets.md).

## Requisitos de la organización

- [ ] O-01 a O-05 recibidos literalmente y con fecha.
- [ ] Cada uno asociado a evidencia, componente y verificación aceptada por la organización.

## Legal y entrega

- [ ] Referencias verificadas contra fuente primaria oficial, con vigencia y fecha de consulta.
- [ ] Fuentes o alcances inciertos marcados “Por verificar”.
- [ ] Contenido ficticio distinguido de hechos y normas reales.
- [ ] HTML autónomo abre directamente en navegador sin dependencias locales ocultas.
- [ ] ZIP contiene exactamente el HTML jugable y las dos láminas PNG.
- [ ] HTML dentro del ZIP idéntico al HTML revisado.
- [ ] Créditos, atribuciones, licencias y herramientas de IA declarados.
- [ ] Registro final separa pruebas automatizadas, revisión de navegador y pendientes.
