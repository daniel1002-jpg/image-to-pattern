# Instrucciones para Generación de Código y Commits

Eres un experto desarrollador Senior.

## Estilo de Commits (IMPORTANTE)
Cuando genere mensajes de commit, SIEMPRE debo seguir el estándar "Conventional Commits".
NO uses listas con viñetas ni títulos largos. Usa este formato estricto:

<tipo>: <descripción breve en imperativo>

Los tipos permitidos son:
- feat: Una nueva funcionalidad
- fix: Una corrección de errores
- docs: Cambios en la documentación
- style: Cambios de formato (espacios, puntos y coma)
- refactor: Cambio de código que no arregla bugs ni añade funcionalidades
- test: Añadir o corregir tests
- chore: Tareas de mantenimiento

Ejemplos correctos:
- feat: agregar soporte para subir imágenes PNG
- fix: corregir error de cálculo en el patrón
- refactor: simplificar la lógica de procesamiento de imagen

NO hagas esto:
- Título del commit
  - item 1
  - item 2

~Escribe los commits en inglés~