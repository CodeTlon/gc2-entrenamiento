# Usuarios del dashboard (Supabase Auth -> Better Auth)

Opcion elegida: **conservar la contrasena** (hash bcrypt de Supabase). Son pocos usuarios (hoy 2, ambos con email y contrasena). Verificado: `src/lib/auth.ts` acepta hashes `$2a$/$2b$/$2y$` con `bcryptjs` y las contrasenas nuevas usan scrypt; al restablecer una contrasena el usuario pasa a scrypt.

1. Listar (solo lectura): `psql "$SUPABASE_DB_URL" -c "select email, created_at, last_sign_in_at from auth.users order by 1"` (ya lo cuenta `03-inventario.sh`).
2. `node 09-exportar-usuarios.mjs` (o `snapshot-completo.sh`) genera `import-usuarios.sql`: mismo id (se conserva la relacion con `posts.author_id`), email, rol admin, `email_verified` y el **mismo hash**. Se aplica con psql en la base nueva.
3. `10-verificar-paridad.mjs` comprueba que id, email, rol, verificado y hash sean identicos al origen (sin imprimir nada sensible).
4. Los usuarios sin hash bcrypt (login social o magic link) usan "Olvide mi contrasena"; hoy no hay ninguno.
5. En test el correo sale siempre al buzon sandbox: no se prueba el mail con usuarios reales ahi.
5. Las sesiones y links de invite/recovery vigentes de Supabase dejan de funcionar al corte: avisar a los usuarios.
