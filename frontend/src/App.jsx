import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function App() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bmi = useMemo(() => {
    const w = Number(weight)
    const h = Number(height)
    if (!w || !h) return ''
    const meters = h >= 3 ? h / 100 : h
    return (w / (meters * meters)).toFixed(1)
  }, [weight, height])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/entries`)
      if (!res.ok) throw new Error('Error al cargar')
      setEntries(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { weight: Number(weight), height: Number(height) }
    if (!payload.weight || !payload.height) {
      setError('Introduce números válidos (> 0).')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'No se pudo guardar')
      }
      setWeight('')
      setHeight('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="h-full text-black">
      <div className="mx-auto max-w-7xl h-full px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Columna izquierda */}
        <div className="space-y-6">

          {/* Tarjeta: título (degradado) */}
          <header className="p-6 rounded-2xl shadow-lg border border-white/40 bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200">
            <h1 className="text-2xl font-semibold tracking-tight">Registro de Peso y Altura</h1>
            <p className="mt-1 text-black/70">
              Introduce tus datos en las tarjetas y guarda.
            </p>
          </header>

          <form onSubmit={onSubmit} className="space-y-6">

            {/* Tarjeta: Peso (degradado) */}
            <div className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200">
              <label className="mb-2 block font-medium">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-black/50 text-black"
                required
              />
            </div>

            {/* Tarjeta: Altura (degradado) */}
            <div className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-r from-pink-200 via-fuchsia-200 to-purple-200">
              <label className="mb-2 block font-medium">Altura (m o cm)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="1.78 o 178"
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-black/50 text-black"
                required
              />
            </div>

            {/* Tarjeta: acciones (degradado) */}
            <div className="p-6 rounded-2xl shadow-xl border border-white/40 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition shadow-lg"
              >
                Guardar
              </button>
              <div className="text-sm text-black/70">
                {bmi
                  ? <>IMC estimado: <span className="font-semibold text-black">{bmi}</span></>
                  : 'Introduce peso y altura para ver tu IMC'}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-100 text-rose-900 font-medium">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Columna derecha: Histórico (tarjeta y tabla en negro) */}
        <aside className="md:sticky md:top-6 h-fit">
          <div className="p-6 rounded-2xl shadow-lg border border-white/40 bg-gradient-to-r from-slate-100 to-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Histórico</h2>
              <button
                onClick={load}
                className="text-sm underline decoration-dotted hover:opacity-80"
              >
                Recargar
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse">Cargando…</div>
            ) : entries.length === 0 ? (
              <div>No hay registros todavía.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <table className="w-full">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                      <th className="text-right px-3 py-2 font-semibold">Peso (kg)</th>
                      <th className="text-right px-3 py-2 font-semibold">Altura</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-white/70 transition">
                        <td className="px-3 py-2">{new Date(e.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{e.weight}</td>
                        <td className="px-3 py-2 text-right">{e.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
