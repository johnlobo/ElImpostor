# Despliegue en producción

La app se despliega como imagen Docker publicada en GHCR, detrás de Nginx Proxy Manager, en el
mismo VPS que otros proyectos ya desplegados con este mismo esquema. El repo incluye `Dockerfile`,
`nginx.conf`, `docker-compose.yml` y `.github/workflows/release.yml`.

Diferencia clave respecto a esos otros proyectos: **ElImpostor no tiene backend**. Es una SPA de Vite
100% cliente (sin Express, sin Firebase, sin variables de entorno) — el juego vive entero en
`localStorage` del navegador. Por eso la imagen final no es un servidor Node, es **nginx** sirviendo
los archivos estáticos del build (`nginx:1.27-alpine`, puerto **80** interno, no 3000).

## 1. Clave SSH de despliegue

Una clave dedicada por repo, autorizada en el propio VPS. Generada en el servidor:

```bash
cd ~/.ssh
ssh-keygen -t ed25519 -C "gh-deploy-elimpostor" -f gh_deploy_elimpostor -N ""
cat gh_deploy_elimpostor.pub >> authorized_keys
chmod 600 gh_deploy_elimpostor authorized_keys
```

La clave **privada** (`gh_deploy_elimpostor`) es la que va al secret de GitHub — nunca la pública.

## 2. Secrets de GitHub Actions (Settings → Secrets and variables → Actions)

En el repo `johnlobo/ElImpostor`:

```bash
gh secret set SSH_HOST --repo johnlobo/ElImpostor -b "<host del VPS>"
gh secret set SSH_USER --repo johnlobo/ElImpostor -b "<usuario SSH>"
gh secret set SSH_PORT --repo johnlobo/ElImpostor -b "<puerto SSH del VPS>"
gh secret set DEPLOY_PATH --repo johnlobo/ElImpostor -b "<ruta de docker-compose.yml en el servidor>"
gh secret set SSH_PRIVATE_KEY --repo johnlobo/ElImpostor < ~/.ssh/gh_deploy_elimpostor
```

`SSH_HOST`/`SSH_USER`/`SSH_PORT` son el mismo VPS que otros proyectos ya desplegados aquí — mismos
valores. `DEPLOY_PATH` en cambio sí es propio de este repo: la ruta del servidor no queda escrita a
mano en el workflow (eso dejaría usuario y estructura de carpetas del VPS visibles en un archivo
público), sale por secret.

`gh secret set` no acepta el valor como argumento posicional (`gh secret set NOMBRE valor` falla con
"accepts at most 1 arg(s)") — hay que pasarlo con `-b "valor"` o por stdin (`echo valor | gh secret set NOMBRE`,
o `< archivo` para valores multilínea como la clave privada).

## 3. Servidor: carpeta y `docker-compose.yml`

Por SSH al VPS, en la ruta que hayas puesto en el secret `DEPLOY_PATH`:

```bash
mkdir -p <ruta de DEPLOY_PATH>
```

Copia el `docker-compose.yml` de este repo a esa carpeta (no se sincroniza solo — el workflow de
release solo hace `docker compose pull` + `docker compose up -d` con lo que ya esté ahí; si cambias
`docker-compose.yml` en el repo hay que copiar el cambio a mano también al servidor):

```yaml
services:
  elimpostor:
    image: ghcr.io/johnlobo/elimpostor:latest
    container_name: elimpostor
    restart: unless-stopped
    networks:
      - proxy-network

networks:
  proxy-network:
    external: true
```

Usa la red externa `proxy-network` (la misma que Nginx Proxy Manager y los demás contenedores de
este VPS) — debe existir ya en el host.

## 4. Nginx Proxy Manager

Nuevo Proxy Host:

- **Domain**: `impostor.digitalpartners.es`
- **Forward Hostname/IP**: `elimpostor` (nombre del contenedor)
- **Forward Port**: `80` (nginx dentro del contenedor, **no** 3000 — esta app no corre Node en
  producción)
- SSL: pide certificado Let's Encrypt, igual que los demás hosts.

Sin Authelia ni ninguna protección adicional delante: no hay nada que autenticar, es un juego local
sin login ni datos de usuario en servidor.

## 5. Lanzar el release

Desde local o code-server:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Luego en GitHub → Releases → New release → selecciona el tag → Publish. Dispara el workflow: build
de la imagen → push a `ghcr.io/johnlobo/elimpostor` → despliegue por SSH
(`docker compose pull && docker compose up -d`) en el servidor.

Verifica en Repo → Actions que el workflow termina en verde, y en Repo → Packages que aparece la
imagen publicada.

## 6. Por qué nginx y no Node

Al revisar el código de ElImpostor se detectaron dependencias muertas heredadas de un scaffold de
AI Studio (`@google/genai`, `express`, `dotenv`, `tsx`) sin un solo uso real en `src/` — la app
nunca llamó a Gemini ni tuvo servidor propio, todo el estado (jugadores, partida activa, historial,
leaderboard) vive en `localStorage` del navegador. Se eliminaron esas dependencias del `package.json`
antes de montar el despliegue: no tenía sentido cargar un runtime Node completo en producción para
servir archivos estáticos. `nginx:1.27-alpine` es más simple, más ligero, y es lo correcto para una
SPA sin backend.

`nginx.conf` fuerza `Cache-Control: no-cache` en `/sw.js` y `/manifest.json` específicamente — si el
Service Worker se sirviera con cache larga, un release nuevo podría no llegarle a un cliente que ya
tiene el viejo cacheado. Los assets con hash (`/assets/*`) sí se cachean un año, son inmutables por
diseño de Vite (el hash cambia si el contenido cambia).
