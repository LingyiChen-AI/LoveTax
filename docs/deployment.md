# Deployment

## One-time setup

1. Provision a VPS (Ubuntu 22.04+) with Docker + Docker Compose.
2. Point DNS A record to the server.
3. Create `.env` in this directory (do not commit):

   ```
   POSTGRES_PASSWORD=<strong random>
   AUTH_SECRET=<openssl rand -base64 32>
   AUTH_URL=https://lovetax.example.com
   APP_URL=https://lovetax.example.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-account@gmail.com
   SMTP_PASS=<app password>
   SMTP_FROM=LoveTax <no-reply@example.com>
   SEED_ADMIN_EMAIL=admin@example.com
   SEED_ADMIN_PASSWORD=<temp; change immediately>
   TRUST_PROXY=true
   ```

4. Start the stack:

   ```bash
   docker compose up -d
   ```

5. After first start, log in as the seed admin and change the password.

## Reverse proxy (Caddy)

`/etc/caddy/Caddyfile`:

```
lovetax.example.com {
    reverse_proxy localhost:30001 {
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Run: `sudo systemctl reload caddy`

## Backups

Cron entry (`crontab -e`):

```
15 3 * * * docker exec lovetax-db-1 pg_dump -U lovetax lovetax | gzip > /var/backups/lovetax-$(date +\%F).sql.gz
```

Sync to remote storage (rclone / restic / etc.) on the same schedule.

## Upgrades

```bash
git pull
docker compose build
docker compose up -d
```

Migrations run automatically at container start.

## Troubleshooting

- **`x-forwarded-for` empty:** set `TRUST_PROXY=true` and ensure your reverse proxy sets the header.
- **Email failures:** check `/admin/email-failures` for retryable rows.
- **Forgotten admin password:** use `docker exec` to run `npm run seed:admin` after manually deleting the admin row (or extend the seed script to support a "reset" flag).
