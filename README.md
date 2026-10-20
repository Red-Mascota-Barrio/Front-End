# Red de Mascotas de Barrio — Front-End

React 19 + Vite + **Bootstrap 5 / React-Bootstrap**. Consume la API Laravel del repositorio `Back-End`.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000/api
npm run dev               # http://localhost:5173
npm run lint
npm run build
```

## Estructura de `src/`

```
src/
├── main.jsx              # Carga Bootstrap → tema → App (el orden importa)
├── App.jsx               # Router + AuthProvider
├── index.css             # Reset mínimo
├── assets/images/        # auth/, common/, inicio/
├── components/
│   ├── common/Icono.jsx  # <Icono nombre="..."/> (Bootstrap Icons) e íconos de especie / tipo de evento
│   ├── layout/           # AppNavbar, Footer
│   ├── home/ auth/ mascotas/ eventos/ foro/ perfil/
│   └── admin/            # AdminLayout (sidebar), AdminUI (piezas del panel), AdminIcon
├── context/AuthContext.jsx   # sesión (token, user, role) + estadísticas
├── pages/                # Una página por ruta (Inicio, Auth, Mascotas, Eventos, Foro, Perfil, Admin)
├── routes/               # AppRouter (rutas) y ProtectedRoute (roles 1 = admin, 2 = usuario)
├── services/             # Una capa por recurso de la API (axios en api.js)
├── styles/
│   ├── theme.css         # Tema Bootstrap con la paleta del mockup (variables --bs-* y --verde-*)
│   ├── layout.css        # Navbar, footer, héroes, tarjetas laterales, estados vacíos
│   └── home|auth|mascotas|eventos|foro|perfil|admin.css   # estilos de cada módulo
└── utils/                # Helpers: fechas y normalización (admin.js), foro, eventos, mascotas, perfil
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
