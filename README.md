# 🧶 Image-to-Pattern

Convierte imágenes en patrones de tejido interactivos. Una herramienta que transforma cualquier foto en una grilla de colores optimizada para proyectos de tejido, bordado o pixel art.

## 🎯 Características

- **Carga de imágenes**: Soporta PNG, JPG y otros formatos comunes
- **Ajuste dinámico**: Controla el ancho del patrón (20-100 puntos) y la cantidad de colores (2-16)
- **Reducción inteligente de colores**: Usa KMeans clustering para encontrar la paleta óptima
- **Vista previa interactiva**: Visualiza el patrón con paleta de colores clara
- **Tracker de tejido**: Marca filas mientras tejes para seguir tu progreso
- **Responsive**: Funciona en desktop y dispositivos móviles

## 📋 Requisitos

- **Backend**: Python 3.8+
- **Frontend**: Node.js 18+

## 🚀 Instalación Rápida

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install fastapi uvicorn pillow scikit-learn python-multipart
uvicorn main:app --reload
```

Backend en: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicación en: `http://localhost:5173`

## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── main.py                 # API FastAPI
│   └── services/
│       └── image_processor.py  # Lógica de procesamiento
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Componente principal
│   │   ├── App.css             # Estilos
│   │   └── main.tsx            # Punto de entrada
│   └── package.json
└── README.md
```

## 🔄 Flujo de la Aplicación

1. Selecciona una imagen desde tu dispositivo
2. Configura parámetros:
   - **Ancho**: Determina la resolución del patrón (20-100)
   - **Colores**: Reduce la complejidad de la paleta (2-16)
3. Genera el patrón (el backend procesa la imagen)
4. Visualiza el resultado y sigue el progreso haciendo click en las filas

## 🛠️ API Endpoints

### `POST /process-image/`

Procesa una imagen y retorna el patrón.

**Parámetros:**
- `file`: Archivo de imagen (multipart/form-data)
- `width`: Ancho del patrón (default: 50)
- `n_colors`: Colores en la paleta (default: 5)

**Respuesta:**
```json
{
  "status": "Processed successfully",
  "dimensions": {
    "width": 50,
    "height": 35
  },
  "palette": ["#ff0000", "#00ff00", "#0000ff"],
  "grid": [[0, 1, 2, ...], ...]
}
```

## 🎨 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | FastAPI | 0.100+ |
| Frontend | React | 19 |
| Lenguaje | TypeScript/Python | 5.9/3.8+ |
| Build | Vite | 7 |
| ML | scikit-learn | 1.3+ |

## 📝 Convenciones

Seguimos **Conventional Commits**:

```
<tipo>: <descripción breve en imperativo>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Ejemplo: `feat: add row tracker functionality`

## 🔄 Flujo de Trabajo con Ramas

```
main
├── feature/nombre-descriptivo
├── fix/nombre-bug
└── docs/nombre-doc
```

Crear rama: `git checkout -b feature/nueva-funcionalidad`

## 📄 Licencia

MIT - © 2025 Daniel Mamani

---

**¿Problemas?** Verifica que:
- Backend corre en `http://127.0.0.1:8000`
- Puertos 5173 (frontend) y 8000 (backend) disponibles
- Dependencias instaladas correctamente
