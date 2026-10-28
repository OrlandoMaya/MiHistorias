# MiHistorias

App web para llenar historias clínicas académicas, organizar pacientes y llevar páginas de revisión de tema por caso, con asistente de IA para el análisis y los diagnósticos diferenciales.

- **Frontend:** React + Vite + Tailwind v4 + componentes estilo shadcn/ui (Radix)
- **Backend:** NestJS + TypeORM
- **Base de datos:** PostgreSQL
- **IA:** Claude (Anthropic API)

## Cómo arrancar

1. Instala y abre **Docker Desktop**.
2. Revisa el archivo `.env` (se crea a partir de `.env.example`). Para usar la IA, pega tu clave en `ANTHROPIC_API_KEY=` ([consíguela aquí](https://console.anthropic.com)).
3. En esta carpeta ejecuta:

```bash
docker compose up -d --build
```

4. Abre <http://localhost:8080>, crea tu cuenta con **Regístrate** y listo. Cada compañera crea la suya; cada una ve solo sus pacientes.

Para apagarlo: `docker compose down` (los datos quedan guardados en los volúmenes `pgdata` y `uploads`).
Si cambias la clave de la IA en `.env`: `docker compose up -d mihistorias-api`.

## Despliegue en el servidor

Mismo proceso que Devotion y Pulsso (Caddy del VPS en Docker con red compartida). Guía paso a paso: **[deploy/README.md](deploy/README.md)**.

```bash
cp .env.example .env   # POSTGRES_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY, CADDY_NETWORK
docker compose -f docker-compose.yml -f deploy/docker-compose.caddy-externo.yml --profile prod up -d --build
```

- Contenedores `mihistorias-web` (nginx: app + proxy a la API) y `mihistorias-api` (red interna), más PostgreSQL.
- Solo `mihistorias-web` se conecta a la red de tu Caddy. En el Caddyfile del VPS va el bloque `mihistorias.pulsso.online { reverse_proxy mihistorias-web:80 }` (ver la guía); el certificado SSL lo saca Caddy solo.
- Para cerrar el registro de cuentas nuevas: `ALLOW_REGISTRATION=false` (el primer usuario siempre puede registrarse).

## Qué incluye

- **Organizador de pacientes:** búsqueda, filtros (activa / de alta / archivada), % de completitud por historia.
- **Historia clínica** con autoguardado y 14 secciones: identificación (edad calculada), motivo, enfermedad actual, antecedentes (ginecoobstétricos si es mujer), revisión por sistemas con casillas, examen físico (signos vitales con PAM/IMC/Glasgow y alertas, estado general, figura del cuerpo y hallazgos normales/anormales por región), paraclínicos (varias tablas por fecha con plantillas e interpretación), imágenes (subir archivos + reporte + interpretación), análisis y diferenciales con chat de IA, dx etiológico y sindromático, listado de problemas, diagnóstico y plan de manejo.
- **Revisiones y notas** por caso: páginas de revisión de tema (con plantilla), preguntas de la ronda y notas libres, en Markdown.
- **Imprimir** la historia desde el botón de la impresora.

## Desarrollo local sin Docker para el código

```bash
docker compose up -d db
cd backend && npm install && npm run dev      # API en :3000 (o deja corriendo la de Docker)
cd frontend && npm install && npm run dev     # app en :5173 (proxy /api → :3000)
```

## Notas

- El esquema de la base se crea solo (`synchronize: true` de TypeORM). Para un despliegue serio conviene pasar a migraciones.
- Los archivos subidos se guardan en el volumen `uploads` y se sirven con nombres aleatorios no adivinables, sin pedir sesión.
