// Gera os ícones do PWA (prompt.md §4, §9): fundo --fundo sólido com um
// triângulo --acento centralizado, o mesmo motivo do chevron "letra
// disponível" que é o único ícone recorrente do produto. Sem dependência
// nativa (pngjs é puro JS) — rode com: node scripts/gerar-icones.mjs
import { PNG } from 'pngjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(DIR, '..', 'public', 'icons')
mkdirSync(OUT_DIR, { recursive: true })

const FUNDO = [0x16, 0x18, 0x1c] // --fundo #16181C
const ACENTO = [0xe0, 0xa4, 0x58] // --acento #E0A458

function sinal(px, py, ax, ay, bx, by) {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by)
}

function dentroTriangulo(px, py, p0, p1, p2) {
  const d1 = sinal(px, py, p0[0], p0[1], p1[0], p1[1])
  const d2 = sinal(px, py, p1[0], p1[1], p2[0], p2[1])
  const d3 = sinal(px, py, p2[0], p2[1], p0[0], p0[1])
  const temNegativo = d1 < 0 || d2 < 0 || d3 < 0
  const temPositivo = d1 > 0 || d2 > 0 || d3 > 0
  return !(temNegativo && temPositivo)
}

function desenharIcone(tamanho, escalaTriangulo) {
  const png = new PNG({ width: tamanho, height: tamanho })

  const cx = tamanho / 2
  const cy = tamanho / 2
  const metade = (tamanho * escalaTriangulo) / 2
  const p0 = [cx + metade, cy]
  const p1 = [cx - metade * 0.6, cy - metade]
  const p2 = [cx - metade * 0.6, cy + metade]

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const idx = (tamanho * y + x) << 2
      const cor = dentroTriangulo(x + 0.5, y + 0.5, p0, p1, p2) ? ACENTO : FUNDO
      png.data[idx] = cor[0]
      png.data[idx + 1] = cor[1]
      png.data[idx + 2] = cor[2]
      png.data[idx + 3] = 255
    }
  }

  return png
}

function salvar(png, nome) {
  writeFileSync(join(OUT_DIR, nome), PNG.sync.write(png))
}

salvar(desenharIcone(192, 0.45), 'icon-192.png')
salvar(desenharIcone(512, 0.45), 'icon-512.png')
// Margem de segurança maior pro ícone maskable (o SO recorta as bordas).
salvar(desenharIcone(512, 0.32), 'icon-maskable-512.png')
salvar(desenharIcone(180, 0.45), 'apple-touch-icon.png')

console.log('Ícones gerados em', OUT_DIR)
