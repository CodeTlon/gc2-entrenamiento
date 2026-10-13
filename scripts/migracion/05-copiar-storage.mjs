#!/usr/bin/env node
// Copia el bucket `media` de Supabase Storage a un bucket S3-compatible (R2/MinIO) conservando las rutas,
// y genera out/reescribir-urls.sql para apuntar las URLs guardadas en la base al bucket nuevo.
// Solo LEE de Supabase (lista via SELECT en storage.objects, descarga por URL publica). Dry-run por defecto.
//
// Env (en .env.migracion): SUPABASE_DB_URL, SUPABASE_URL (https://<ref>.supabase.co), S3_ENDPOINT, S3_BUCKET,
//   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL (base publica de las URLs nuevas), S3_REGION (auto)
// Requiere: npm i -D @aws-sdk/client-s3 (ya viene con la fase de codigo) y psql en el PATH.
// Uso: node 05-copiar-storage.mjs            # lista y calcula, no sube nada
//      node 05-copiar-storage.mjs --yes      # sube
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const out = resolve(dir, 'out'); mkdirSync(out, { recursive: true });
const APPLY = process.argv.includes('--yes');
const BUCKET_ORIGEN = 'media';

const env = { ...process.env };
const envFile = resolve(dir, '.env.migracion');
if (existsSync(envFile)) for (const l of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
for (const k of ['SUPABASE_DB_URL', 'SUPABASE_URL', 'S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_BASE_URL'])
  if (!env[k]) { console.error(`Falta ${k}`); process.exit(1); }

const psql = (sql) => execFileSync('psql', [env.SUPABASE_DB_URL, '-X', '-At', '-F', '\t', '-c', sql], { encoding: 'utf8' });
const objetos = psql(`select name, coalesce(metadata->>'mimetype','application/octet-stream'), coalesce((metadata->>'size')::bigint,0)
  from storage.objects where bucket_id='${BUCKET_ORIGEN}' order by name`)
  .split('\n').filter(Boolean).map((l) => { const [name, type, size] = l.split('\t'); return { name, type, size: Number(size) }; });
const total = objetos.reduce((a, o) => a + o.size, 0);
console.log(`${objetos.length} objetos, ${(total / 1048576).toFixed(1)} MB en ${BUCKET_ORIGEN}`);

const base = (u) => u.replace(/\/$/, '');
const viejo = `${base(env.SUPABASE_URL)}/storage/v1/object/public/${BUCKET_ORIGEN}/`;
const nuevo = `${base(env.S3_PUBLIC_BASE_URL)}/`;
writeFileSync(resolve(out, 'url-map.json'), JSON.stringify({ viejo, nuevo, objetos }, null, 2));

// SQL de reescritura: prefijo viejo -> nuevo en toda columna text/varchar/jsonb de public (cubre cover_image, attachment_url,
// video_url, site_settings, fotos de coaches e imagenes embebidas en posts.content). Se ejecuta contra la base NUEVA.
const cols = psql(`select table_name, column_name, data_type from information_schema.columns
  where table_schema='public' and data_type in ('text','character varying','jsonb') order by 1,2`)
  .split('\n').filter(Boolean).map((l) => l.split('\t'));
const lit = (s) => `'${s.replace(/'/g, "''")}'`;
const sql = ['begin;', ...cols.map(([t, c, ty]) => ty === 'jsonb'
  ? `update public."${t}" set "${c}" = replace("${c}"::text, ${lit(viejo)}, ${lit(nuevo)})::jsonb where "${c}"::text like ${lit('%' + viejo + '%')};`
  : `update public."${t}" set "${c}" = replace("${c}", ${lit(viejo)}, ${lit(nuevo)}) where "${c}" like ${lit('%' + viejo + '%')};`), 'commit;', ''].join('\n');
writeFileSync(resolve(out, 'reescribir-urls.sql'), sql);
console.log(`Escrito out/url-map.json y out/reescribir-urls.sql (${cols.length} columnas candidatas)`);

if (!APPLY) { console.log('Dry-run: no se subio nada. Re-correr con --yes.'); process.exit(0); }

const { S3Client, PutObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3');
const s3 = new S3Client({ region: env.S3_REGION || 'auto', endpoint: env.S3_ENDPOINT, credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY }, forcePathStyle: true });
let ok = 0, salteados = 0; const fallos = [];
for (const o of objetos) {
  try {
    try { await s3.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: o.name })); salteados++; continue; } catch { /* no existe: subir */ }
    const r = await fetch(viejo + o.name.split('/').map(encodeURIComponent).join('/'));
    if (!r.ok) throw new Error(`descarga ${r.status}`);
    const body = Buffer.from(await r.arrayBuffer());
    if (o.size && body.length !== o.size) throw new Error(`tamano ${body.length} != ${o.size}`);
    await s3.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: o.name, Body: body, ContentType: o.type }));
    ok++;
  } catch (e) { fallos.push(`${o.name}: ${e.message}`); }
}
console.log(`Subidos ${ok}, ya existian ${salteados}, fallidos ${fallos.length}`);
if (fallos.length) { writeFileSync(resolve(out, 'storage-fallos.txt'), fallos.join('\n')); console.error('Ver out/storage-fallos.txt'); process.exit(1); }
