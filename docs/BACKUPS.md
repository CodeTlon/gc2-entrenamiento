# Backups de la base (Postgres en Coolify)

Estandar de CodeTlon (`codetlon-cloud/docs/BACKUPS.md`): un backup que nunca se restauro no es un backup.

1. `scripts/backup/backup-coolify.sh` corre en el VPS de Coolify (cron 03:30): `pg_dump -Fc`, `.sha256` y subida con `rclone` a `b2:backups-codetlon/prod/gc2/postgres/<fecha>/`. Parametros y claves: ver el encabezado del script. La clave de B2 va en `/etc/backup/gc2-entrenamiento.env` (chmod 600), nunca en el repo.
2. Los archivos subidos viven en el volumen `storage` del servidor, no en la base: el backup los incluye con `FILES_MODE=volume` (tar.gz del volumen a B2, mismo cron que el dump).
3. Prueba de restauracion: `scripts/backup/restore-test.sh <archivo.dump>` (o `FROM_REMOTE=b2:...`) antes del corte y cada trimestre. Anotar la fecha del ultimo simulacro en `.claude/CLAUDE.md`.
4. `backup-check.yml` (GitHub Actions, una vez por dia) verifica en B2 que haya un dump de las ultimas 24 h con su `.sha256` y avisa por mail si no. El cron de gc2 en el VPS **todavia no esta programado** (hoy solo corre el de recoveryparts): se programa al crear `gc2-prod`.

Estado: scripts copiados de codetlon-cloud, **sin ejecutar** para este proyecto.
