// src/App.jsx
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
    const meters = h >= 3 ? h / 100 : h // admite cm o m
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
    <div className="h-full">
      {/* Layout: izquierda (form) + derecha (histórico) */}
      <div className="mx-auto max-w-7xl h-full px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <header className="glass p-6">
            <h1 className="text-2xl font-semibold tracking-tight">Registro de Peso y Altura</h1>
            <p className="text-slate-300 mt-1">Introduce tus datos en las tarjetas y guarda.</p>
          </header>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Tarjeta flotante: Peso */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-400/30 to-cyan-400/30 blur-xl"></div>
              <div className="relative glass p-6">
                <label className="label mb-2">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.0"
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Tarjeta flotante: Altura */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-fuchsia-400/30 to-indigo-400/30 blur-xl"></div>
              <div className="relative glass p-6">
                <label className="label mb-2">Altura (m o cm)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="1.78 o 178"
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Acciones + IMC */}
            <div className="glass p-6 flex items-center justify-between gap-3">
              <button type="submit" className="btn-primary">Guardar</button>
              <div className="text-sm text-slate-300">
                {bmi ? <>IMC estimado: <span className="font-semibold text-white">{bmi}</span></> : 'Introduce peso y altura para ver tu IMC'}
              </div>
            </div>

            {error && (
              <div className="glass-soft p-4 text-rose-200">{error}</div>
            )}
          </form>
        </div>

        {/* Columna derecha: Histórico */}
        <aside className="md:sticky md:top-6 h-fit">
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Histórico</h2>
              <button onClick={load} className="text-sm underline decoration-dotted hover:opacity-80">Recargar</button>
            </div>

            {loading ? (
              <div className="animate-pulse">Cargando…</div>
            ) : entries.length === 0 ? (
              <div className="text-slate-300">No hay registros todavía.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th className="text-right">Peso (kg)</th>
                      <th className="text-right">Altura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-white/5">
                        <td>{new Date(e.created_at).toLocaleString()}</td>
                        <td className="text-right">{e.weight}</td>
                        <td className="text-right">{e.height}</td>
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
