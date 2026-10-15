// Verifica src/lib/transcode.ts contra un servidor falso, sin ffmpeg ni red: node --import tsx tests/storage/verificar-transcode.mts
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

const { transcodeWithService } = await import('../../src/lib/transcode')

let n = 0
const ok = (nombre: string) => console.log(`ok   ${++n} ${nombre}`)

let modo: 'ok' | 'grande' | '500' = 'ok'
let ultimaAuth = ''
let ultimaUrl = ''
const server = createServer((req, res) => {
  ultimaAuth = req.headers.authorization ?? ''
  ultimaUrl = req.url ?? ''
  req.resume()
  req.on('end', () => {
    if (modo === '500') { res.statusCode = 500; res.end('x'); return }
    res.setHeader('content-type', 'video/mp4')
    res.end(Buffer.alloc(modo === 'grande' ? 5000 : 10, 1))
  })
})
await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
const original = Buffer.alloc(1000, 7)

delete process.env.TRANSCODE_SERVICE_URL
delete process.env.TRANSCODE_API_KEY
assert.equal(await transcodeWithService(original), null); ok('sin configurar devuelve null (no llama a nadie)')

process.env.TRANSCODE_SERVICE_URL = `${base}/`
process.env.TRANSCODE_API_KEY = 'clave-de-prueba'
const salida = await transcodeWithService(original, 'web')
assert.equal(salida?.length, 10); ok('devuelve el MP4 comprimido')
assert.equal(ultimaAuth, 'Bearer clave-de-prueba'); ok('manda la API key como Bearer')
assert.equal(ultimaUrl, '/v1/transcode?preset=web'); ok('quita la barra final y pide el preset')

modo = 'grande'
assert.equal(await transcodeWithService(original), null); ok('si el resultado pesa más que el original, descarta (null)')

modo = '500'
assert.equal(await transcodeWithService(original), null); ok('si el servicio responde error, soft-fail (null)')

server.close()
process.env.TRANSCODE_SERVICE_URL = 'http://127.0.0.1:1'
assert.equal(await transcodeWithService(original), null); ok('si el servicio no se alcanza, soft-fail (null)')
console.log(`\n${n} verificaciones OK`)
