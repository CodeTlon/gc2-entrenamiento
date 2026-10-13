# Usuarios del dashboard (Supabase Auth -> Better Auth)

Opcion A del modulo `migracion-supabase.md`: **reset de contrasena obligatorio**. Son pocos usuarios (coaches/admins).

1. Listar (solo lectura): `psql "$SUPABASE_DB_URL" -c "select email, created_at, last_sign_in_at from auth.users order by 1"` (ya lo cuenta `03-inventario.sh`).
2. Crear los usuarios en la base nueva con el mismo email y `role` de admin, sin contrasena utilizable (script de seed en la fase de codigo).
3. Enviar a cada uno el mail de "restablecer contrasena" (Resend; en test sale al buzon sandbox, ver `docs/environments.md`).
4. Los hashes bcrypt de `auth.users.encrypted_password` solo se importan si Better Auth los acepta: probarlo en test con un usuario real antes de prometerlo.
5. Las sesiones y links de invite/recovery vigentes de Supabase dejan de funcionar al corte: avisar a los usuarios.
