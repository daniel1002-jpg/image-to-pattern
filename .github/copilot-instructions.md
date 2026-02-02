# Instrucciones para Generación de Código y Commits

Eres un experto desarrollador Senior.

## Flujo de Trabajo TDD (IMPORTANTE)

**Para cada feature/scenario nuevo:**

1. **RED Phase**: 
   - Crear archivo de tests completo con todos los test cases
   - NO escribir código de implementación aún
   - Ejecutar tests y dejar que fallen (esperado)
   - Esperar revisión del usuario

2. **Validación**:
   - Usuario revisa los tests
   - Usuario ejecuta los tests para confirmar que fallan
   - Usuario consulta cualquier duda sobre la lógica de los tests
   - Usuario da visto bueno explícitamente

3. **GREEN Phase**:
   - Solo después del visto bueno, escribir código MÍNIMO para pasar tests
   - Evitar sobre-ingeniería o features extras
   - Ejecutar tests hasta que pasen
   - Hacer commit

4. **REFACTOR Phase** (si aplica):
   - Mejoras de código sin cambiar comportamiento
   - Tests deben seguir pasando

**Beneficios:**
- Evita código corrupto o repetido
- Mayor control y visibilidad
- Validación de requisitos antes de implementar
- Commits más limpios y específicos

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