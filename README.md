# 🧶 Image-to-Pattern

Aplicación web que convierte imágenes en patrones de tejido cuadriculados (pixel art/granny squares). Un puente entre el diseño digital y la ejecución física del tejido, resolviendo fricciones que las herramientas actuales ignoran.

## 🎯 Propuesta de Valor

Mientras que herramientas como **Stitch Fiddle** tienen UX compleja y apps de pixel art generan paletas de colores irreales, **Image-to-Pattern** combina:

- **Backend robusto**: Algoritmos científicos (K-Means clustering) para reducción de colores inteligente
- **Conocimiento de dominio**: Enfocado en las necesidades reales de tejedores

### Pain Points que Resolvemos

1. **El Abismo del Color**: Las apps convierten a códigos Hex/RGB que no existen en mercerías
2. **Parálisis por Configuración**: Exceso de parámetros técnicos antes de ver resultados
3. **Experiencia Estática**: PDFs que dificultan seguir el progreso al tejer

## ✨ Características (MVP)

- **Upload simple**: Drag & Drop de imágenes PNG, JPG y otros formatos
- **Reducción automática de colores**: Quantization usando K-Means (5-10 colores dominantes)
- **Pixelado ajustable**: Controla la resolución del patrón (20-100 puntos)
- **Visualización interactiva**: Grilla renderizada en pantalla con paleta de colores
- **Sin autenticación**: Todo en sesión temporal (sin login necesario)

### 🚀 Roadmap de Features Futuros

**OUT del MVP actual** (dejado para versiones posteriores):
- ❌ Cuentas de usuario y guardado en la nube
- ❌ Editor manual (pintar pixel a pixel)
- ❌ Generación de PDF
- ❌ Base de datos de marcas de lanas reales

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

### Levantar Backend + Frontend juntos

Una vez instaladas las dependencias del backend y frontend, puedes iniciar ambos con:

```bash
python scripts/dev.py
```

El script usará el Python del entorno virtual `backend/venv` si existe.

Esto inicia:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## ✅ CI (GitHub Actions)

Se ejecutan los tests del frontend en cada push a `main` y en PRs.

## 🌍 Deploy (placeholders)

**Frontend (Vercel)**
- URL publica: `https://<vercel-app>.vercel.app`
- Variable de entorno en Vercel:
  - `VITE_API_BASE_URL=https://<render-service>.onrender.com`

**Backend (Render - Free Tier)**
- URL publica: `https://<render-service>.onrender.com`
- Variables de entorno en Render:
  - `FRONTEND_ORIGINS=https://<vercel-app>.vercel.app`

> Nota: `FRONTEND_ORIGINS` acepta multiples dominios separados por coma.

## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── main.py                 # API FastAPI
│   └── services/
│       └── image_processor.py  # Lógica de procesamiento con K-Means
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Componente principal
│   │   ├── App.css             # Estilos
│   │   └── main.tsx            # Punto de entrada
│   └── package.json
└── README.md
```

## 🔄 Flujo del Pipeline de Datos

1. **Upload**: Usuario sube imagen → Frontend envía a API (Multipart)
2. **Pre-process**: Backend redimensiona (ej. 100x100 px) para ajustar al tamaño de una manta real
3. **Quantization**: K-Means agrupa los píxeles en bloques de color sólido
4. **Response**: Backend devuelve matriz JSON `[[color_id, hex], ...]` al Frontend
5. **Render**: Frontend dibuja la grilla basándose en la matriz

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

## 🎨 Stack Tecnológico: "Python Powerhouse"

| Capa | Tecnología | Versión | Razón de Elección |
|------|------------|---------|-------------------|
| Backend | FastAPI | 0.100+ | Asíncrono, rápido, con Swagger automático |
| Frontend | React | 19 | Optimización para grillas grandes |
| Lenguaje | TypeScript/Python | 5.9/3.8+ | Tipado fuerte + ecosistema científico |
| Build | Vite | 7 | Desarrollo rápido |
| Procesamiento | Pillow (PIL) | Latest | Manipulación de imágenes |
| ML | scikit-learn | 1.3+ | K-Means clustering para reducción de colores |

### ¿Por qué Python en el Backend?

Decisión estratégica: Python tiene un **ecosistema científico superior** a Node.js para procesamiento de imágenes y algoritmos ML (Pillow + scikit-learn).

## 🏢 Estrategia: "Product-Led Portfolio"

Este proyecto adopta un enfoque híbrido:

- **Calidad de Código**: Estándares de ingeniería altos (Clean Code) para portafolio profesional
- **Funcionalidad Real**: Producto usable por usuarios finales, no solo una demo estática
- **Infraestructura $0**: Despliegue con Vercel (Frontend) + Render/Railway (Backend)

## 💼 Modelo de Negocio Potencial

- **Marketing de Afiliados**: Recomendar lanas exactas con links a Amazon/MercadoLibre
- **Freemium**: Uso gratuito web, micro-pago por descargar PDF de alta calidad

## 📝 Convenciones de Commit

Seguimos **Conventional Commits**:

```
<tipo>: <descripción breve en imperativo>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Ejemplo**: `feat: add kmeans color quantization`

## 🔄 Flujo de Trabajo con Ramas

```
main
├── feature/nombre-descriptivo
├── fix/nombre-bug
└── docs/nombre-doc
```

Crear rama: `git checkout -b feature/nueva-funcionalidad`

## 📊 Análisis de Competencia

| Herramienta | Fortaleza | Debilidad |
|-------------|-----------|-----------|
| Stitch Fiddle | Muy robusto | UX compleja, curva de aprendizaje alta |
| Wooltara | Buena UX/UI | Débil en generación técnica de patrones |
| Apps Pixel Art | Algoritmos potentes | Inutilizables para tejedores (paletas irreales) |

## 📄 Licencia

MIT - © 2025 Daniel Mamani

---

**¿Problemas?** Verifica que:
- Backend corre en `http://127.0.0.1:8000`
- Puertos 5173 (frontend) y 8000 (backend) disponibles
- Dependencias instaladas correctamente

**Documentación completa del proyecto**: [Project Charter en Notion](https://www.notion.so/Project-Charter-Image-to-Pattern-MVP-2b1d181de3ba8005aaf4ecf556352bf5)
