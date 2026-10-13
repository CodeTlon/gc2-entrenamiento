#!/usr/bin/env node
// Convierte un dump de Supabase en SQL valido para un Postgres comun (notas de campo de migracion-supabase.md).
// Uso: node 02-sanear-dump.mjs [entrada.sql] [salida.sql]   (default: out/schema-latest.sql -> out/schema-clean.sql)
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), 'out');
const [inp = resolve(out, 'schema-latest.sql'), dst = resolve(out, 'schema-clean.sql')] = process.argv.slice(2);

export function sanear(sql) {
  const avisos = [];
  let t = sql.replace(/\r\n/g, '\n');
  t = t.replace(/^\\(un)?restrict .*$/gm, '');                         // meta-comandos de psql
  t = t.replace(/^SELECT pg_catalog\.set_config\('search_path'.*$/gm, ''); // se filtra a migraciones siguientes
  t = t.replace(/^create policy [\s\S]*?;[ \t]*(--[^\n]*)?\n/gim, '');                    // RLS -> autorizacion en el servidor
  t = t.replace(/^alter table [^\n]* (enable|force|disable) row level security;[^\n]*\n/gim, '');
  t = t.replace(/\s+references auth\.users\s*\(\w+\)(\s+on delete (set null|cascade))?/gi, () => { avisos.push('FK inline a auth.users'); return ''; });
  t = t.replace(/extensions\.uuid_generate_v4\(\)|uuid_generate_v4\(\)/g, 'gen_random_uuid()');
  // Funciones/triggers que dependen de auth.* : se eliminan y se avisa
  t = t.replace(/^CREATE (OR REPLACE )?FUNCTION [^\n]*\n[\s\S]*?\$\$;\n/gm, (b) => {
    if (/auth\.(uid|role|jwt)\(\)/.test(b)) { avisos.push(b.split('\n')[0]); return ''; }
    return b;
  });
  t = t.replace(/^CREATE TRIGGER [^\n]*\n?[^\n;]*;\n/gm, (b) => {
    if (/auth\./.test(b)) { avisos.push(b.split('\n')[0]); return ''; }
    return b;
  });
  // FKs hacia auth.users (el dump las emite como ALTER TABLE ... ADD CONSTRAINT)
  t = t.replace(/^ALTER TABLE ONLY [^\n]*\n\s+ADD CONSTRAINT [^\n]* REFERENCES auth\.[^\n]*;\n/gm, (b) => {
    avisos.push(b.split('\n')[0] + ' (FK a auth)'); return '';
  });
  t = t.replace(/^GRANT [^\n]* TO (anon|authenticated|service_role)[^\n]*;\n/gm, '');
  t = t.replace(/^[^\n;-]*storage\.(buckets|objects)[\s\S]*?;[ \t]*\n/gim, () => { avisos.push('sentencia sobre storage.* (el bucket pasa a S3)'); return ''; });
  return { sql: t.replace(/\n{3,}/g, '\n\n'), avisos };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { sql, avisos } = sanear(readFileSync(inp, 'utf8'));
  writeFileSync(dst, sql);
  const residuo = sql.replace(/--[^\n]*/g, '').match(/auth\.|storage\.|extensions\.|anon|service_role/g);
  console.log(`Escrito ${dst}`);
  if (avisos.length) console.log('Eliminado (revisar si hay que reemplazar la logica):\n - ' + avisos.join('\n - '));
  if (residuo) { console.error(`ATENCION: quedan referencias a Supabase (${[...new Set(residuo)].join(', ')}). Revisar a mano.`); process.exitCode = 1; }
}
