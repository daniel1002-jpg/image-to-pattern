# User Story #001: Interactive Row Tracker

## 📝 Historia de Usuario

**Como** usuario que está tejiendo un patrón  
**Quiero** poder marcar las filas que ya he completado  
**Para** no perderme en el patrón y saber exactamente dónde voy

---

## 🎯 Contexto y Valor

**Pain Point que resuelve:** Los patrones en PDF estáticos obligan a los tejedores a usar papel y lápiz para marcar su progreso, generando fricción y posibles errores al perder la cuenta.

**Valor diferencial:** Esta es la Feature B del MVP que nos distingue de competidores como Stitch Fiddle (que exporta PDFs estáticos).

---

## ✅ Criterios de Aceptación

### Escenario 1: Marcar una fila como completada
- **Dado que** tengo un patrón generado en pantalla
- **Cuando** hago click en una fila de la grilla
- **Entonces** la fila debe resaltarse visualmente (ej. cambio de opacidad o borde)
- **Y** el estado debe persistir mientras esté en la sesión

### Escenario 2: Desmarcar una fila
- **Dado que** tengo una fila marcada como completada
- **Cuando** vuelvo a hacer click en esa fila
- **Entonces** la fila debe volver a su estado original (desmarcarse)

### Escenario 3: Indicador de progreso
- **Dado que** tengo filas marcadas
- **Cuando** visualizo el patrón
- **Entonces** debo ver un contador que muestre "X de Y filas completadas"

### Escenario 4: Reset del tracker
- **Dado que** tengo filas marcadas
- **Cuando** hago click en un botón "Reset Progress"
- **Entonces** todas las filas deben desmarcarse
- **Y** el contador debe volver a "0 de Y filas completadas"

---

## 🔧 Consideraciones Técnicas

### Frontend (React + TypeScript)
- Estado local con `useState` para trackear filas completadas
- Array de IDs de filas: `completedRows: number[]`
- CSS para resaltar filas (clase `.completed-row`)
- Componente nuevo: `RowTracker` o agregar funcionalidad a `PatternGrid`

### Persistencia (MVP)
- **Para el MVP:** Solo en sesión (sin backend)
- **Futuro:** LocalStorage para persistir entre sesiones
- **Post-MVP:** Guardar en base de datos con cuentas de usuario

### UX/UI
- Click en cualquier parte de la fila para marcar/desmarcar
- Feedback visual inmediato (transición suave)
- Botón "Reset" bien visible pero no intrusivo
- Mobile-friendly (touch events)

---

## 📋 Tareas de Desarrollo

### Backend
- [ ] **No requiere cambios** (funcionalidad 100% frontend)

### Frontend
- [ ] Agregar estado `completedRows` en el componente principal
- [ ] Implementar función `toggleRowCompletion(rowIndex: number)`
- [ ] Agregar estilos CSS para `.completed-row`
- [ ] Crear indicador de progreso (ej. "15 de 50 filas completadas")
- [ ] Agregar botón "Reset Progress"
- [ ] Hacer la fila clickable (event handler `onClick`)
- [ ] Testing manual en móvil (touch events)

### Testing
- [ ] Test: marcar/desmarcar filas funciona correctamente
- [ ] Test: contador de progreso se actualiza
- [ ] Test: reset limpia todas las filas marcadas
- [ ] Test: funciona en móvil (touch)

---

## � Notas

- Esta funcionalidad NO requiere cambios en el backend
- Es un quick win que mejora significativamente la UX
- Mobile-first: muchos tejedores usan tablet/teléfono mientras tejen

**Documentación completa**: Ver [Backlog de Features en Notion](https://www.notion.so/2f9d181de3ba8128b975d171f579f80e)
