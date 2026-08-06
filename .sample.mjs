import { readFileSync } from "node:fs"
import { PNG } from "pngjs"
const [a, b] = process.argv.slice(2)
const A = PNG.sync.read(readFileSync(a)), B = PNG.sync.read(readFileSync(b))
const hist = new Map(); const samples = []
for (let y = 0; y < Math.min(A.height, B.height); y++) for (let x = 0; x < Math.min(A.width, B.width); x++) {
  const i = (y * A.width + x) * 4, j = (y * B.width + x) * 4
  let d = 0; for (let c = 0; c < 4; c++) d = Math.max(d, Math.abs(A.data[i+c] - B.data[j+c]))
  if (d > 0) { hist.set(d, (hist.get(d) ?? 0) + 1); if (samples.length < 8) samples.push(`@${x},${y} Δ${d} ref=${[...A.data.slice(i,i+4)]} mui=${[...B.data.slice(j,j+4)]}`) }
}
console.log(`${A.width}x${A.height}`, "hist:", JSON.stringify(Object.fromEntries([...hist].sort((p,q)=>q[0]-p[0]).slice(0,8))))
samples.forEach(s => console.log("  " + s))
