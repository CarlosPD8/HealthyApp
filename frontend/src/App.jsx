import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ---- Páginas públicas ----
function Login() {
  const { login, isAuth } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (isAuth) nav('/') }, [isAuth])
  async function onSubmit(e) {
    e.preventDefault(); setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Error de login')
      login(j); nav('/')
    } catch (err) { setError(err.message) }
  }
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 text-black">
        <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block mb-1">Contraseña</label>
            <input type="password" className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="p-3 rounded-lg bg-rose-100 text-rose-900">{error}</div>}
          <button type="submit" className="w-full px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Entrar</button>
        </form>
        <p className="mt-3 text-sm">¿No tienes cuenta? <a className="underline" href="/register">Regístrate</a></p>
      </div>
    </div>
  )
}

function Register() {
  const { login, isAuth } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (isAuth) nav('/') }, [isAuth])

  async function onSubmit(e) {
    e.preventDefault(); setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Error de registro')
      login(j); nav('/')
    } catch (err) { setError(err.message) }
  }
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-pink-200 via-fuchsia-200 to-purple-200 text-black">
        <h1 className="text-2xl font-semibold mb-4">Crear cuenta</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Contraseña</label>
            <input type="password" className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="p-3 rounded-lg bg-rose-100 text-rose-900">{error}</div>}
          <button type="submit" className="w-full px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Registrarme</button>
        </form>
        <p className="mt-3 text-sm">¿Ya tienes cuenta? <a className="underline" href="/login">Inicia sesión</a></p>
      </div>
    </div>
  )
}

// ---- Página privada (tu dashboard existente) ----
function Dashboard() {
  const { token, user, logout } = useAuth()
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bmi = useMemo(() => {
    const w = Number(weight), h = Number(height)
    if (!w || !h) return ''
    const m = h >= 3 ? h / 100 : h
    return (w / (m * m)).toFixed(1)
  }, [weight, height])

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      setEntries(await res.json())
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault(); setError('')
    const payload = { weight: Number(weight), height: Number(height) }
    if (!payload.weight || !payload.height) { setError('Introduce números válidos (>0).'); return }
    try {
      const res = await fetch(`${API_URL}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'No se pudo guardar')
      }
      setWeight(''); setHeight(''); load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="h-full text-black">
      <div className="mx-auto max-w-7xl h-full px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <header className="p-6 rounded-2xl shadow-lg border bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold">Registro de Peso y Altura</h1>
                <p className="mt-1 text-black/70">Sesión: <b>{user?.email}</b></p>
              </div>
              <button onClick={logout} className="text-sm underline">Salir</button>
            </div>
          </header>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200">
              <label className="mb-2 block font-medium">Peso (kg)</label>
              <input type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="75.0" className="w-full px-4 py-2.5 rounded-xl bg-white/70 border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black placeholder-black/50" />
            </div>

            <div className="p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-pink-200 via-fuchsia-200 to-purple-200">
              <label className="mb-2 block font-medium">Altura (m o cm)</label>
              <input type="number" step="0.01" min="0" value={height} onChange={e => setHeight(e.target.value)}
                placeholder="1.78 o 178" className="w-full px-4 py-2.5 rounded-xl bg-white/70 border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black placeholder-black/50" />
            </div>

            <div className="p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-lg">
                Guardar
              </button>
              <div className="text-sm text-black/70">
                {bmi ? <>IMC: <span className="font-semibold text-black">{bmi}</span></> : 'Introduce peso y altura para ver tu IMC'}
              </div>
            </div>

            {error && <div className="p-4 rounded-xl border border-rose-200 bg-rose-100 text-rose-900">{error}</div>}
          </form>
        </div>

        <aside className="md:sticky md:top-6 h-fit">
          <div className="p-6 rounded-2xl shadow-lg border bg-gradient-to-r from-slate-100 to-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Histórico</h2>
              <button onClick={load} className="text-sm underline decoration-dotted">Recargar</button>
            </div>
            {loading ? (
              <div>Cargando…</div>
            ) : entries.length === 0 ? (
              <div>No hay registros todavía.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <table className="w-full">
                  <thead className="bg-slate-200 text-black">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Fecha</th>
                      <th className="text-right px-3 py-2 font-semibold">Peso (kg)</th>
                      <th className="text-right px-3 py-2 font-semibold">Altura</th>
                      <th className="text-right px-3 py-2 font-semibold">IMC</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {entries.map(e => {
                      const h = e.height >= 3 ? e.height / 100 : e.height
                      const imc = h > 0 ? (e.weight / (h * h)).toFixed(1) : '—'
                      return (
                        <tr key={e.id} className="hover:bg-white/70">
                          <td className="px-3 py-2">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{e.weight}</td>
                          <td className="px-3 py-2 text-right">{e.height}</td>
                          <td className="px-3 py-2 text-right font-medium">{imc}</td>
                        </tr>
                      )
                    })}
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

// ---- Protege rutas privadas ----
function PrivateRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
