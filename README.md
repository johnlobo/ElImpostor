# El Impostor

Juego de deducción social para jugar en grupo compartiendo un solo móvil, offline y sin
registro. Se reparte una palabra secreta a todos menos a uno o varios impostores, que deben
disimular durante la ronda de pistas sin que el grupo los descubra en la votación.

## Cómo se juega

1. **Jugadores**: añade entre 3 y 20 jugadores (nombre, avatar, color), o carga un grupo guardado.
2. **Roles**: se reparte la palabra secreta y se asignan impostores al azar. Cada jugador revela su
   rol en privado manteniendo pulsado en la pantalla (modo "pásate el móvil").
3. **Pistas**: cada jugador da una pista sutil sobre la palabra, en conversación libre, por turnos o
   con temporizador.
4. **Votación**: el grupo decide a quién eliminar. Dos formatos:
   - **Uno a uno**: se vota y elimina a un jugador por ronda; si queda algún impostor vivo se repite
     hasta atraparlos a todos.
   - **Todos a la vez**: una única acusación en bloque señalando exactamente a todos los
     impostores — acertar el grupo completo gana la partida al instante, fallar por uno solo la
     pierde. Fuerza votación verbal.
   Cada votación puede ser secreta (pasando el móvil) o verbal (en voz alta).
5. **Resolución**: si el impostor es descubierto puede tener un último intento de adivinar la
   palabra secreta para robar la victoria (configurable). Puntuación acumulada y marcador global
   entre partidas.

## Funcionalidades

- **100% offline**: PWA instalable, sin servidor ni cuenta — todo el estado vive en `localStorage`
  del navegador.
- **9 categorías por defecto** con 50 palabras cada una (comida, cine, animales, lugares,
  profesiones, deportes, objetos, personajes, videojuegos), más categorías personalizadas propias.
- **Configuración de reglas**: número de impostores (fijo o automático según jugadores), qué sabe el
  impostor (nada / la categoría / una palabra falsa), orden de pistas, modo y formato de votación,
  intento final de adivinar la palabra.
- **Grupos de jugadores guardados** para no tener que re-escribir nombres cada partida.
- **Marcador global** y **historial de partidas** persistentes.
- **Sonido y vibración** con tonos generados vía Web Audio API (sin archivos de audio).

## Stack técnico

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS. Sin backend ni base de datos — es una
  SPA puramente cliente.
- **Persistencia**: `localStorage`, con los datos sensibles de la partida activa (palabra secreta,
  identidad de los impostores) ofuscados antes de guardarse para que no se lean a simple vista desde
  las devtools durante una ronda en curso.
- **PWA**: manifest + service worker propios (sin `vite-plugin-pwa`), instalable en pantalla de
  inicio.

Para el detalle de arquitectura (por qué el estado vive donde vive, las decisiones de diseño de cada
modo de juego, etc.) no hay un `CLAUDE.md` todavía en este repo — el código es el mejor punto de
partida, empezando por `src/App.tsx` (máquina de estados de fases) y `src/types.ts`.

## Ejecutar en local

**Requisitos:** Node.js o [Bun](https://bun.sh) (el repo usa `bun.lock`).

```bash
bun install
bun run dev      # http://localhost:5175
```

Otros scripts:

```bash
bun run lint     # tsc --noEmit — comprobación de tipos (no hay suite de tests todavía)
bun run build    # build de producción -> dist/
bun run preview  # sirve el build de producción
```

## Despliegue

Se despliega como imagen Docker (nginx sirviendo el build estático) detrás de Nginx Proxy Manager,
publicada en GHCR por GitHub Actions en cada Release. Ver
[`doc/despliegue-produccion.md`](doc/despliegue-produccion.md) para el proceso completo.
