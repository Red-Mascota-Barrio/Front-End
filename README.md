# Red de Mascotas de Barrio — Front-End

React 19 + Vite + **Bootstrap 5 / React-Bootstrap**. Consume la API Laravel del repositorio `Back-End`.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL=https://mascotas.api.adsocidm.com/api
npm run dev               # http://localhost:5173
npm run lint
npm run build
```

## Estructura de `src/`

```
src/
├── main.jsx              # Carga Bootstrap → tema → App (el orden importa)
├── App.jsx               # Router + AuthProvider
├── index.css             # Reset mínimo global
├── assets/
│   └── images/           # Recursos gráficos por dominio: auth/, common/, inicio/
├── components/
│   ├── common/           # Iconografía y piezas reutilizables
│   ├── layout/           # AppNavbar, Footer, notificaciones
│   ├── home/ auth/ mascotas/ eventos/ foro/ perfil/
│   └── admin/            # AdminLayout, AdminUI y utilidades del panel
├── config/               # Configuración compartida del cliente (API/base URLs)
├── context/              # Estado global (AuthContext)
├── pages/                # Una página por ruta (Inicio, Auth, Mascotas, Eventos, Foro, Perfil, Admin)
├── routes/               # AppRouter y ProtectedRoute
├── services/             # Capa HTTP por recurso (axios en api.js)
├── styles/               # Tema Bootstrap y estilos por módulo
└── utils/                # Helpers y normalización de datos
```

## Convenciones

- **Estilos:** primero clases de Bootstrap; los colores/radios salen de `styles/theme.css`.
  No redefinir `.btn`, `.badge` ni `.navbar`: se personalizan con variables `--bs-*`.
- **Íconos:** Bootstrap Icons vía `<Icono nombre="calendar-event" />`; especies con `<IconoEspecie />`.
  Evitar emojis en la interfaz.
- **API:** las rutas de cada recurso viven en su `services/*.js`. Laravel responde
  `{ resultado, mensaje, datos }` y los errores de validación en `error`.

## Pendiente en el Back-End (el front ya lo contempla)

- `GET /mis-mascotas` (mascotas del usuario) y `GET /categorias` (categorías del foro).
- Rutas de perfil: subir foto, cambiar contraseña con la actual y eliminar la propia cuenta.
