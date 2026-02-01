# Instrucciones para Generación de Código y Commits

Eres un experto desarrollador Senior.

## Estilo de Commits (IMPORTANTE)
Cuando genere mensajes de commit, SIEMPRE debo seguir el estándar "Conventional Commits".
NO uses listas con viñetas ni títulos largos. Usa este formato estricto:

```
<tipo>: <descripción breve en imperativo>

<palabraClave> #<número-del-issue>
```

Los tipos permitidos son:
- feat: Una nueva funcionalidad
- fix: Una corrección de errores
- docs: Cambios en la documentación
- style: Cambios de formato (espacios, puntos y coma)
- refactor: Cambio de código que no arregla bugs ni añade funcionalidades
- test: Añadir o corregir tests
- chore: Tareas de mantenimiento

### Referencias a Issues (OBLIGATORIO)
**TODOS los commits deben referenciar el issue correspondiente** usando una de estas palabras clave mágicas:
- `closes #N` (automáticamente cierra el issue cuando se mergea)
- `fixes #N`
- `resolves #N`

Ejemplos correctos:
- feat: add PNG upload support (closes #3)
- fix: correct pattern calculation (fixes #5)
- refactor: simplify image processing (closes #2)
- test: add zoom scenario tests (closes #2)

Ejemplo con cuerpo más largo:
```
feat: implement pattern zoom functionality

- Add zoom in/out with mouse scroll
- Display zoom level indicator  
- Maintain cell proportions at all scales

closes #2
```

NO hagas esto:
- Título del commit con lista de items
- Commits sin referencia al issue
- Usar palabras clave en minúsculas o mal escritas

***Escribe los commits en inglés***