# GeoLluvias

Aplicación web para reporte georreferenciado de daños por lluvias, infraestructura afectada y zonas vulnerables.

## Requisitos

- Node.js 18 o superior
- MongoDB Atlas o un cluster MongoDB existente

## Configuración

1. Crea un archivo `server/.env` con tus credenciales.
2. Crea un archivo `client/.env` si vas a usar URL remotas para API, socket o Mapbox.

### `server/.env`

```env
PORT=4000
MONGO_URI=mongodb+srv://jossamador10:<db_password>@georef26711.dll0fsf.mongodb.net/geolluvias?retryWrites=true&w=majority
JWT_SECRET=pon_aqui_una_clave_larga
CLIENT_ORIGIN=http://localhost:5173
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_MAPBOX_TOKEN=tu_token_de_mapbox
```

## Scripts

Desde la raíz del proyecto:

```bash
npm install
npm run build
```

Para desarrollo:

```bash
npm run dev --workspace server
npm run dev --workspace client
```

## Nota sobre MongoDB

Tu string de conexión debe usar la contraseña real en lugar de `<db_password>`. Si tu cluster no usa la base `geolluvias`, puedes cambiar ese nombre por el que prefieras.
