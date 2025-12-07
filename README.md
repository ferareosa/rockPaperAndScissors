https://rock-paper-and-scissors-nine.vercel.app/

# Arena Piedra, Papel o Tijera

SPA multijugador para desafiar a tus amigas (y a la CPU Nova) en partidas simultáneas de piedra, papel o tijera. Toda la interfaz se construyó con **React**, creando componentes reutilizables para botones, manos, resultados y marcadores. El enrutamiento y la orquestación de vistas se gestionan con **React Router DOM**, aprovechando su modo SPA y el sistema de rutas tipo file-based.

## Características principales

- ⚡️ Interfaz React responsiva con animaciones y persistencia en `localStorage`.
- 🧭 Navegación con React Router DOM (`react-router` y `@react-router/dev`).
- 🎨 Estilos con Tailwind CSS para una estética retro-futurista.
- 🧠 Bot CPU Nova integrado para partidas 1v1 o multijugador extendido.
- 📊 Marcadores editables y reseñas de ronda en un modal a pantalla completa.

## Requisitos previos

- Node.js 18+
- npm (o pnpm/bun si prefieres adaptar los scripts).

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Visita `http://localhost:5173` y prueba la SPA con HMR.

## Build de producción

```bash
npm run build
```

El resultado se genera en `build/client` (estáticos) y `build/server` (SSR/híbrido). Para servirlo localmente puedes usar:

```bash
npm run start
```

## Despliegue con Docker

Hay tres Dockerfiles listos (npm, pnpm, bun). Ejemplo con npm:

```bash
docker build -t rps-arena .

```

El contenedor funciona en AWS ECS, Cloud Run, Azure Container Apps, Fly.io, Railway, etc.

## Estructura relevante

```
├── app/
│   ├── routes/            # Rutas manejadas por React Router DOM
│   └── src/
│       ├── components/    # Componentes React (UI arena, botones, scoreboard)
│       ├── controllers/   # Lógica del juego (evaluateRound, bot, etc.)
│       └── types/         # Tipos TypeScript compartidos
├── app.css                # Tailwind base
├── package.json           # Scripts y dependencias
└── README.md
```

## Scripts útiles

- `npm run dev` – entorno local con HMR.
- `npm run build` – build optimizada.
- `npm run start` – sirve la build.
- `npm run typecheck` – genera tipos de React Router y ejecuta `tsc`.

## Contribuciones

1. Haz fork o crea branch.
2. Ejecuta los scripts de test/typing.
3. Abre un PR con la descripción de los cambios.

---

Construido con ❤️ usando React + React Router DOM.
├── build/
