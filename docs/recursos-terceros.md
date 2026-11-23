# Recursos de terceros y licencias

Registro preliminar para preparar la publicación. Completar y verificar las licencias antes de distribuir la entrega.

| Recurso | Procedencia | Uso previsto | Licencia/atribución | Estado |
| --- | --- | --- | --- | --- |
| Logo Codex (`assets/third-party/codex.png`) | PNG `codex.png` recibido en la carpeta de trabajo; el brief también indica <https://hackathon.codexparatodos.com/logos/codex.png>. Copia de proyecto sin cambios. SHA-256 `87B2480A8FBB1EE1C3454E40EF2CD3C3A8D98E7203ECEE25FDFB50B813F0AAFA`. | Créditos o pantalla de título, sobre fondo claro. | El archivo no declara licencia. Confirmar permiso/atribución con la organización antes de publicar. | Copiado; licencia por verificar. |
| Assets visuales generados para este proyecto | Borradores bajo `assets/drafts/`, creados para este proyecto con ImageGen. | Personajes, escenas, objetos y extras del juego, sujeto a revisión y aprobación. | No son recursos externos incorporados. Registrar cualquier referencia o material adicional en la versión final. | Borradores; revisar antes de integrar. |
| Fotos y ZIP de referencia entregados por la autora | `inputs/source-photos/` y `inputs/referencias-visuales-originales.zip`; excluidos de Git. | Referencia de identidad y estilo durante la producción. | Material proporcionado para el proyecto; no redistribuir las fuentes en la entrega pública. | Fuentes locales excluidas del repositorio. |
| Código HTML del juego anterior | `inputs/legacy-source/`; copia local excluida de Git y documentada en `docs/revision-codigo-anterior.md`. | Solo referencia para una auditoría y eventual extracción justificada. | Revisar autoría y licencias de dependencias/assets antes de reutilizar cualquier parte. | No reutilizado en el juego nuevo. |
| Música original de la entrega | WAV seleccionados del `AUDIO-PAQUETE-TRASPASO.zip`, bajo `assets/audio/music/`. | Temas de capítulos 1 y 2, puzles, resolución y transición entre ambos capítulos; amplitud de los temas de capítulos ajustada para equilibrar su nivel de salida. | El manifiesto del paquete indica síntesis original sin grabaciones o samples de juegos de referencia; conservar el paquete de traspaso como registro de procedencia. | Integrada; revisar escucha en navegador al probar la entrega. |

La ficha pública de la hackatón pide entregar el juego con licencia de código abierto, instrucciones de ejecución y la identificación de recursos de terceros y sus licencias: <https://luma.com/zv06n9np?locale=es>. Se eligió MIT para el código en `LICENSE`; el registro de terceros debe completarse antes de publicar.

La ruta jugable no solicita Google Fonts ni bibliotecas externas; usa tipografías de sistema, JavaScript y reproducción de audio nativos del navegador. El archivo `LICENSE` del proyecto aplica al código y no reemplaza la verificación de permisos del logo o de otros recursos.
