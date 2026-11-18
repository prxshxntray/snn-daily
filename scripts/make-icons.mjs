import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public/icons')
mkdirSync(dir, { recursive: true })

const full = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#10130e"/>
  <path d="M56 300 H150 L196 300 L236 148 L292 400 L338 300 H456" fill="none" stroke="#f3efe4" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="236" cy="148" r="14" fill="#c9d7a6"/>
</svg>`

const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#10130e"/>
  <g transform="translate(64 64) scale(0.75)">
    <path d="M56 300 H150 L196 300 L236 148 L292 400 L338 300 H456" fill="none" stroke="#f3efe4" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="236" cy="148" r="16" fill="#c9d7a6"/>
  </g>
</svg>`

async function png(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(dir, file))
}

await png(full, 192, 'icon-192.png')
await png(full, 512, 'icon-512.png')
await png(maskable, 512, 'icon-maskable-512.png')
await png(full, 180, 'apple-touch-icon.png')
