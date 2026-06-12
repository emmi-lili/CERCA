# Cerca 💜

Una pequeña app para dos, hecha para la distancia. Cuenta regresiva hasta el
reencuentro, diario compartido, una pregunta nueva cada día y notificaciones
push — solo para nosotros dos.

## Stack

- **Next.js 14** (App Router)
- **Supabase** — Auth (magic link), Postgres, Realtime, Edge Functions
- **Tailwind CSS**
- **Framer Motion** — animaciones
- **lucide-react** — íconos
- **web-push** — notificaciones

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores:

```bash
cp .env.example .env.local
```

| Variable | De dónde sale |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secreto) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |

### 3. Configurar los dos correos

Edita `lib/constants.ts` y reemplaza `EMAIL_1_HERE` / `EMAIL_2_HERE` por los
dos correos reales. Solo esos dos pueden pedir un enlace mágico.

También puedes ajustar `REUNION_DATE` (la fecha del reencuentro).

### 4. Crear la base de datos

Abre el **SQL editor** de Supabase y ejecuta el contenido de
[`supabase/schema.sql`](supabase/schema.sql).

### 5. Correr en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — deberías ver la pantalla
de login.

## Notificaciones push (opcional)

1. Genera las llaves VAPID: `npx web-push generate-vapid-keys`
2. Ponlas en `.env.local` (pública + privada).
3. Despliega la edge function y crea los webhooks siguiendo las instrucciones
   al inicio de [`supabase/functions/send-push/index.ts`](supabase/functions/send-push/index.ts).
4. En la app, ve a **Perfil → Activar notificaciones**.

## Estructura

```
app/
  layout.tsx              · layout raíz, fuentes, orbes flotantes, nav
  page.tsx                · inicio: cuenta regresiva + estado de pareja
  diario/page.tsx         · diario compartido
  preguntas/page.tsx      · juego de preguntas
  perfil/page.tsx         · perfil + notificaciones + cerrar sesión
  auth/page.tsx           · login con enlace mágico
  auth/callback/route.ts  · callback de Supabase Auth
components/               · Countdown, PartnerStatus, JournalFeed, QuestionCard…
lib/                      · constants, clientes Supabase, utils
public/sw.js              · service worker para push
supabase/
  schema.sql              · esquema de la base de datos
  functions/send-push/    · edge function de notificaciones
middleware.ts             · refresco de sesión + protección de rutas
```
