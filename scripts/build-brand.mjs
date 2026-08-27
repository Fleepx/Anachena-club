import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SRC = path.resolve('../Logos')
const PUB = path.resolve('public')
const BRAND = path.join(PUB, 'brand')

const FULL = path.join(SRC, 'Negro-Transparente.png')
const MARK = path.join(SRC, 'Logo-Negro-Transparente.png')
const MARK_W = path.join(SRC, 'Blanco-Transparente.png')
const WORD = path.join(SRC, 'WhatsApp Image 2026-08-19 at 12.18.08.jpeg')

fs.mkdirSync(BRAND, { recursive: true })

const info = async (f) => {
  const m = await sharp(f).metadata()
  return `${m.width}x${m.height} ${m.format} alpha=${!!m.hasAlpha}`
}

console.log('Originales:')
for (const [n, f] of [['completo', FULL], ['isotipo', MARK], ['isotipo bl', MARK_W], ['wordmark', WORD]]) {
  console.log('  ' + n.padEnd(10), await info(f))
}

await sharp(MARK).trim().resize({ width: 320 }).png({ compressionLevel: 9 }).toFile(
  path.join(BRAND, 'isotipo.png')
)

await sharp(MARK_W).trim().resize({ width: 320 }).png({ compressionLevel: 9 }).toFile(
  path.join(BRAND, 'isotipo-blanco.png')
)

await sharp(FULL).trim().resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(
  path.join(BRAND, 'logo-completo.png')
)

async function wordmark(color, file) {
  const m = await sharp(WORD).metadata()
  const alpha = await sharp(WORD)
    .grayscale()
    .linear(1.3, -30)
    .toColourspace('b-w')
    .raw()
    .toBuffer()

  const buf = await sharp({
    create: { width: m.width, height: m.height, channels: 3, background: color }
  })
    .joinChannel(alpha, { raw: { width: m.width, height: m.height, channels: 1 } })
    .png()
    .toBuffer()

  await sharp(buf).trim().resize({ width: 560 }).png({ compressionLevel: 9 }).toFile(file)
}

await wordmark('#000000', path.join(BRAND, 'wordmark-negro.png'))
await wordmark('#ffffff', path.join(BRAND, 'wordmark-blanco.png'))

await sharp(FULL)
  .trim()
  .resize({ width: 400 })
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toFile(path.join(BRAND, 'logo-pdf.png'))

const icon = async (source, size, background) => {
  const pad = Math.round(size * 0.04)
  const inner = await sharp(source)
    .trim()
    .resize({
      width: size - pad * 2,
      height: size - pad * 2,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const sizes = [
  ['favicon-16.png', 16, null, MARK],
  ['favicon-32.png', 32, null, MARK],
  ['apple-touch-icon.png', 180, '#ffffff', MARK],
  ['icon-192.png', 192, '#ffffff', MARK],
  ['icon-512.png', 512, '#ffffff', MARK]
]
const buffers = {}
for (const [name, size, bg, src] of sizes) {
  const buf = await icon(src, size, bg)
  buffers[size] = buf
  fs.writeFileSync(path.join(PUB, name), buf)
}

{
  const size = 512
  const inner = await sharp(MARK)
    .trim()
    .resize({
      width: Math.round(size * 0.6),
      height: Math.round(size * 0.6),
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer()

  const buf = await sharp({
    create: { width: size, height: size, channels: 4, background: '#ffffff' }
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  fs.writeFileSync(path.join(PUB, 'icon-maskable-512.png'), buf)
}

const b64 = async (source) => (await icon(source, 64, null)).toString('base64')
const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
  '  <style>',
  '    .dark { display: none }',
  '    @media (prefers-color-scheme: dark) {',
  '      .light { display: none }',
  '      .dark { display: block }',
  '    }',
  '  </style>',
  '  <image class="light" width="64" height="64" href="data:image/png;base64,' + (await b64(MARK)) + '"/>',
  '  <image class="dark" width="64" height="64" href="data:image/png;base64,' + (await b64(MARK_W)) + '"/>',
  '</svg>'
].join('\n')
fs.writeFileSync(path.join(PUB, 'favicon.svg'), svg)

const build = (entries) => {
  const dir = Buffer.alloc(6 + entries.length * 16)
  dir.writeUInt16LE(0, 0)
  dir.writeUInt16LE(1, 2)
  dir.writeUInt16LE(entries.length, 4)

  let offset = dir.length
  entries.forEach(({ size, buf }, i) => {
    const p = 6 + i * 16
    dir.writeUInt8(size >= 256 ? 0 : size, p)
    dir.writeUInt8(size >= 256 ? 0 : size, p + 1)
    dir.writeUInt8(0, p + 2)
    dir.writeUInt8(0, p + 3)
    dir.writeUInt16LE(1, p + 4)
    dir.writeUInt16LE(32, p + 6)
    dir.writeUInt32LE(buf.length, p + 8)
    dir.writeUInt32LE(offset, p + 12)
    offset += buf.length
  })

  return Buffer.concat([dir, ...entries.map((e) => e.buf)])
}

fs.writeFileSync(
  path.join(PUB, 'favicon.ico'),
  build([
    { size: 16, buf: buffers[16] },
    { size: 32, buf: buffers[32] }
  ])
)

console.log('\nGenerado:')
for (const f of [...fs.readdirSync(PUB), ...fs.readdirSync(BRAND).map((x) => 'brand/' + x)]) {
  const full = path.join(PUB, f)
  if (fs.statSync(full).isFile()) console.log('  ' + f.padEnd(28), fs.statSync(full).size + ' bytes')
}
