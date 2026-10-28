# Subir MiHistorias al servidor (con tu Caddy en Docker)

Tu Caddy corre en Docker y llega a cada app **por nombre de contenedor** en una red compartida, sin publicar
puertos. MiHistorias sigue ese mismo patrón (igual que Devotion):

```
Internet ──HTTPS──▶ tu Caddy ──red compartida──▶ mihistorias-web (nginx) ──red interna──▶ mihistorias-api ──▶ PostgreSQL
```

- Solo `mihistorias-web` entra a la red de Caddy. La API y la base de datos quedan en la red interna de MiHistorias:
  ni Caddy ni los otros proyectos pueden verlas.
- Los contenedores se llaman `mihistorias-web` y `mihistorias-api` para no chocar con los `web`/`api` de otros
  proyectos en la red compartida.

## 1. DNS

En el panel de `pulsso.online`, crea:

| Tipo | Nombre | Valor |
|---|---|---|
| `A` | `mihistorias` | la misma IP que `calendar.pulsso.online` y `devotion.pulsso.online` |

Comprueba: `dig +short mihistorias.pulsso.online`.

## 2. Saber la red de tu Caddy

```bash
docker ps --format '{{.Names}}' | grep -i caddy          # nombre del contenedor de Caddy
docker inspect <contenedor-caddy> --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}'
```

Esa red (la misma que pusiste en `CADDY_NETWORK` de Devotion) es la que va en `CADDY_NETWORK`.

## 3. Código y configuración

```bash
git clone https://github.com/OrlandoMaya/MiHistorias.git mihistorias && cd mihistorias
cp .env.example .env
nano .env
```

Antes del primer arranque:

| Variable | Valor |
|---|---|
| `POSTGRES_PASSWORD` | Contraseña larga. **Solo se aplica al crear la base**: si la cambias después, la API no conecta. |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `ANTHROPIC_API_KEY` | Tu clave de Anthropic para el asistente IA (opcional; sin ella la app funciona sin IA) |
| `CADDY_NETWORK` | La red del paso 2 |
| `WEB_PORT` | `6000` (ya viene así). Solo escucha en `127.0.0.1`; desde internet se entra por Caddy |
| `POSTGRES_PORT` | Un puerto libre, p. ej. `5433` (solo `127.0.0.1`; Devotion ya usa el `5432`) |

## 4. Levantar MiHistorias

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.caddy-externo.yml --profile prod up -d --build
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Networks}}' | grep mihistorias
curl -s http://127.0.0.1:6000/api/auth/status      # {"status":"ok","registration":true}
```

La web queda en el puerto **6000** del servidor (solo `127.0.0.1`). Pruébalo con `curl`, no con el navegador:
Chrome y Firefox bloquean ese puerto (`ERR_UNSAFE_PORT`). Desde internet se entra por Caddy, que no usa ese puerto.

Debe verse `mihistorias-web` en la red de Caddy y en `mihistorias_default`, y `mihistorias-api` /
`mihistorias-db-1` solo en `mihistorias_default`. La primera vez la API crea las tablas sola.

> Para no escribir los dos `-f` cada vez, descomenta en `.env`:
> `COMPOSE_FILE=docker-compose.yml:deploy/docker-compose.caddy-externo.yml` y `COMPOSE_PROFILES=prod`.
> Desde entonces basta `docker compose up -d --build`.
>
> El `docker-compose.override.yml` (que publica la API en el `3000` para desarrollo) **no** se carga en el
> servidor, porque ahí siempre se indica `-f` o `COMPOSE_FILE`.

## 5. Agregar MiHistorias al Caddyfile del VPS

Todos los sitios viven en **un solo Caddyfile** (el del Caddy de entrada). Agrega este bloque al final, junto a
`calendar.pulsso.online` y `devotion.pulsso.online`:

```caddy
mihistorias.pulsso.online {
	# MiHistorias tiene login propio (cuentas privadas por usuario), asi que no lleva basic_auth.
	# "mihistorias-web" es su nginx: sirve la app y le pasa /api a la API, que no esta en esta red.
	# Sin "encode" para no retrasar las respuestas en streaming del asistente IA.
	reverse_proxy mihistorias-web:80 {
		flush_interval -1
	}
}
```

Valida y recarga:

```bash
docker exec <contenedor-caddy> caddy validate --config /etc/caddy/Caddyfile
docker exec <contenedor-caddy> caddy reload --config /etc/caddy/Caddyfile
```

**El certificado SSL es automático:** al cargar el bloque, Caddy lo pide a Let's Encrypt (unos segundos) y lo renueva
solo. Para comprobarlo:

```bash
docker logs <contenedor-caddy> 2>&1 | grep -i mihistorias | tail -5   # "certificate obtained successfully"
curl -s https://mihistorias.pulsso.online/api/auth/status             # {"status":"ok","registration":true}
```

## 6. Crear tu cuenta

Abre https://mihistorias.pulsso.online y crea tu cuenta; luego tus compañeras crean las suyas. Cuando ya estén todas,
puedes cerrar el registro con `ALLOW_REGISTRATION=false` en el `.env` y reiniciar
(`docker compose ... up -d mihistorias-api`).

## Actualizar

```bash
git pull
docker compose -f docker-compose.yml -f deploy/docker-compose.caddy-externo.yml --profile prod up -d --build
```

Las tablas nuevas se crean solas al arrancar la API.

## Respaldos

Hay dos cosas que respaldar: la base de datos y los archivos subidos (imágenes de los estudios).

```bash
mkdir -p respaldos
docker compose exec -T db pg_dump -U mihistorias -d mihistorias --clean | gzip > respaldos/mihistorias-$(date +%F).sql.gz
docker run --rm -v mihistorias_uploads:/data -v "$PWD/respaldos":/out alpine tar czf /out/uploads-$(date +%F).tar.gz -C /data .
```

Diario a las 3:15, guardando 14 días (`crontab -e`):

```bash
15 3 * * * cd /ruta/a/mihistorias && docker compose exec -T db pg_dump -U mihistorias -d mihistorias --clean | gzip > respaldos/mihistorias-$(date +\%F).sql.gz && docker run --rm -v mihistorias_uploads:/data -v "$PWD/respaldos":/out alpine tar czf /out/uploads-$(date +\%F).tar.gz -C /data . && find respaldos -name '*.gz' -mtime +14 -delete
```

Restaurar:

```bash
gunzip -c respaldos/mihistorias-AAAA-MM-DD.sql.gz | docker compose exec -T db psql -U mihistorias -d mihistorias
docker run --rm -v mihistorias_uploads:/data -v "$PWD/respaldos":/in alpine tar xzf /in/uploads-AAAA-MM-DD.tar.gz -C /data
```

## Si algo falla

| Síntoma | Revisar |
|---|---|
| `network ... not found` al levantar | `CADDY_NETWORK` no coincide con la red de tu Caddy (paso 2). |
| `port is already allocated` | `WEB_PORT` o `POSTGRES_PORT` ya los usa otro proyecto; pon otro libre en `.env`. |
| 502 en `mihistorias.pulsso.online` | `docker exec <contenedor-caddy> wget -qO- http://mihistorias-web/api/auth/status` debe responder. Si no, `mihistorias-web` no está en la red de Caddy. |
| Error de SSL / sin certificado | Caddy no tiene el bloque cargado (paso 5) o el DNS no apunta al servidor. `docker logs <contenedor-caddy> 2>&1 \| grep -i mihistorias`. |
| La API reinicia con `password authentication failed` | `POSTGRES_PASSWORD` cambió después de crear la base. Usa la original. |
| El asistente IA dice que no está configurado | Falta `ANTHROPIC_API_KEY` en `.env`; agrégala y `up -d mihistorias-api`. |
| La IA responde todo de golpe al final | Falta `flush_interval -1` en el bloque de Caddy (paso 5). |

## Otros escenarios

- **Caddy instalado directo en el servidor (no Docker):** levanta solo con `--profile prod` (sin el segundo `-f`) y
  en el bloque usa `reverse_proxy 127.0.0.1:6000`.
