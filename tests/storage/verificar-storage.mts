// Verifica src/lib/storage.ts (archivos en disco) sin base ni servidor: node --import tsx tests/storage/verificar-storage.mts
import assert from 'node:assert/strict'
import { mkdtempSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.STORAGE_DIR = mkdtempSync(join(tmpdir(), 'gc2-storage-'))
const { putObject, deleteObject, keyFromUrl, fileInfo, publicUrl, TIPOS_POR_EXT } = await import('../../src/lib/storage')

let n = 0
const ok = (nombre: string) => console.log(`ok   ${nombre}`, ++n && '')

const key = 'coaches/11111111-1111-1111-1111-111111111111.webp'
const url = await putObject(key, Buffer.from('datos'))
assert.equal(url, `/media/${key}`); ok('putObject devuelve la URL pública /media/...')
assert.equal(publicUrl(key), url)
assert.equal((await fileInfo(key))?.size, 5); ok('fileInfo encuentra el archivo y su tamaño')
await assert.rejects(putObject(key, Buffer.from('otro'))); ok('no pisa un archivo existente (flag wx)')
assert.equal(keyFromUrl(url), key); ok('keyFromUrl reconoce un archivo propio')
assert.equal(keyFromUrl('https://ajeno.com/media/' + key), null); ok('keyFromUrl ignora URLs ajenas')
assert.equal(keyFromUrl('/media/../etc/passwd'), null); ok('keyFromUrl rechaza ..')
await deleteObject(key)
assert.equal(await fileInfo(key), null); ok('deleteObject borra el archivo')
await deleteObject(key); ok('borrar uno inexistente no falla')

for (const mala of ['../x/a.png', 'a/../b/c.png', '/abs/a.png', 'a//b.png', 'a/b/c/d/e.png', 'a/.oculto/x.png', 'a/b/c d.png']) {
  await assert.rejects(putObject(mala, Buffer.from('x')), /inválida/, mala)
}
ok('rechaza rutas con .., absolutas, vacías, demasiado profundas o con caracteres raros')
const raiz = await putObject('equipo.jpg', Buffer.from('r'))
assert.equal(raiz, '/media/equipo.jpg'); assert.equal(keyFromUrl(raiz), 'equipo.jpg'); await deleteObject('equipo.jpg'); ok('acepta archivos en la raíz (migrados de Supabase)')
assert.equal(TIPOS_POR_EXT.svg, undefined); assert.equal(TIPOS_POR_EXT.html, undefined); ok('SVG y HTML no son servibles')

const { portadaParaStory } = await import('../../src/lib/story-cover')
const sharp = (await import('sharp')).default
const webp = await sharp({ create: { width: 40, height: 40, channels: 3, background: '#38BDF8' } }).webp().toBuffer()
const urlWebp = await putObject('blog/22222222-2222-2222-2222-222222222222.webp', webp)
assert.match((await portadaParaStory(urlWebp)) ?? '', /^data:image\/jpeg;base64,/); ok('portada propia (webp) se entrega embebida para el Story')
assert.equal(await portadaParaStory('https://ajeno.com/a.jpg'), 'https://ajeno.com/a.jpg'); ok('portada externa pasa tal cual')
assert.equal(await portadaParaStory('/media/blog/no-existe.webp'), null); assert.equal(await portadaParaStory(null), null); ok('portada inexistente o vacía da null')

rmSync(process.env.STORAGE_DIR!, { recursive: true, force: true })
assert.equal(existsSync(process.env.STORAGE_DIR!), false)
console.log(`\n${n} verificaciones OK`)
