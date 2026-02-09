import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './auth'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
console.log("VITE_RECAPTCHA_SITE_KEY =", import.meta.env.VITE_RECAPTCHA_SITE_KEY)
console.log("Todos los env:", import.meta.env)

// ---- Páginas públicas ----
function Login() {
  const { login, isAuth } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { executeRecaptcha } = useGoogleReCaptcha()
  const siteKey = RECAPTCHA_SITE_KEY

  useEffect(() => { if (isAuth) nav('/') }, [isAuth])
  async function onSubmit(e) {
  e.preventDefault(); setError('')
  try {
    if (!executeRecaptcha) throw new Error('reCAPTCHA no está listo. Recarga la página.')

    const captchaToken = await executeRecaptcha('login')

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaToken })
    })

    const j = await res.json()
    if (!res.ok) throw new Error(j.error || 'Error de login')
    login(j); nav('/')
  } catch (err) {
    setError(err.message)
  }
}

  if (!siteKey) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border bg-amber-100 text-amber-900">
        Falta configurar <b>VITE_RECAPTCHA_SITE_KEY</b> en <b>frontend/.env</b>
      </div>
    </div>
  )
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
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [policy, setPolicy] = useState(null)
  const [genLen, setGenLen] = useState(16)
  const [genSets, setGenSets] = useState({ lower: true, upper: true, digits: true, symbols: true })
  const { executeRecaptcha } = useGoogleReCaptcha()
  const siteKey = RECAPTCHA_SITE_KEY

  useEffect(() => { if (isAuth) nav('/') }, [isAuth])

  // Cargar política desde backend (para mostrar requisitos y límites)
  useEffect(() => {
    let alive = true
    fetch(`${API_URL}/api/auth/policy`).then(r => r.ok ? r.json() : null).then(j => {
      if (!alive || !j) return
      setPolicy(j)
      // Ajustar generador dentro de límites razonables
      const min = Number(j.minLength || 12)
      const max = Number(j.maxLength || 128)
      setGenLen(prev => Math.min(max, Math.max(min, prev)))
      setGenSets({
        lower: !!j.allowLower,
        upper: !!j.allowUpper,
        digits: !!j.allowDigits,
        symbols: !!j.allowSymbols,
      })
    }).catch(() => {})
    return () => { alive = false }
  }, [])

    if (!siteKey) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border bg-amber-100 text-amber-900">
        Falta configurar <b>VITE_RECAPTCHA_SITE_KEY</b> en <b>frontend/.env</b>
      </div>
    </div>
  )
}

  function secureRandInt(maxExclusive) {
    // crypto.getRandomValues con rechazo para evitar sesgo
    const a = new Uint32Array(1)
    const limit = Math.floor(0xFFFFFFFF / maxExclusive) * maxExclusive
    let x
    do {
      window.crypto.getRandomValues(a)
      x = a[0]
    } while (x >= limit)
    return x % maxExclusive
  }

  function generatePassword(length, sets) {
    const cs = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      symbols: '!@#$%^&*()-_=+[]{};:,.?/\\|~`"\'<>',
    }
    const enabled = Object.entries(sets).filter(([, v]) => v).map(([k]) => k)
    if (enabled.length === 0) throw new Error('Selecciona al menos un tipo de caracteres para generar la contraseña.')
    if (length < enabled.length) throw new Error('La longitud debe ser >= al número de conjuntos seleccionados.')

    // Asegurar al menos 1 de cada conjunto habilitado
    const out = []
    for (const k of enabled) out.push(cs[k][secureRandInt(cs[k].length)])
    const all = enabled.map(k => cs[k]).join('')
    for (let i = out.length; i < length; i++) out.push(all[secureRandInt(all.length)])

    // Barajar
    for (let i = out.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out.join('')
  }

  function onGenerate() {
    setError('')
    setCopied(false)
    try {
      const min = Number(policy?.minLength || 12)
      const max = Number(policy?.maxLength || 128)
      const len = Math.min(max, Math.max(min, Number(genLen)))
      setGenLen(len)
      setPassword(generatePassword(len, genSets))
    } catch (e) {
      setError(e.message)
    }
  }

  async function onCopyPassword() {
    try {
      if (!password) throw new Error('Primero genera o escribe una contraseña.')
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      // Fallback simple si el navegador bloquea clipboard
      try {
        const ta = document.createElement('textarea')
        ta.value = password
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        setError(e.message || 'No se pudo copiar la contraseña.')
      }
    }
  }

 async function onSubmit(e) {
  e.preventDefault(); setError('')
  try {
    if (!executeRecaptcha) throw new Error('reCAPTCHA no está listo. Recarga la página.')

    const captchaToken = await executeRecaptcha('register')

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaToken })
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

        <div className="mb-4 p-4 rounded-xl bg-white/60 border">
          <div className="font-medium">Generador de contraseña (opcional)</div>
          <div className="text-sm text-black/70 mt-1">
            Elige longitud y tipos de caracteres. El backend validará la política al registrarte.
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm">
              Longitud
              <input
                type="number"
                min={policy?.minLength || 12}
                max={policy?.maxLength || 128}
                value={genLen}
                onChange={e => setGenLen(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/70 border text-black"
              />
            </label>
            <div className="text-sm">
              <div className="mb-1">Tipos</div>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={genSets.lower} disabled={!policy?.allowLower}
                    onChange={e => setGenSets(s => ({ ...s, lower: e.target.checked }))} />
                  minúsculas
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={genSets.upper} disabled={!policy?.allowUpper}
                    onChange={e => setGenSets(s => ({ ...s, upper: e.target.checked }))} />
                  mayúsculas
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={genSets.digits} disabled={!policy?.allowDigits}
                    onChange={e => setGenSets(s => ({ ...s, digits: e.target.checked }))} />
                  números
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={genSets.symbols} disabled={!policy?.allowSymbols}
                    onChange={e => setGenSets(s => ({ ...s, symbols: e.target.checked }))} />
                  símbolos
                </label>
              </div>
            </div>
          </div>

          <button type="button" onClick={onGenerate}
            className="mt-3 w-full px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Generar contraseña segura
          </button>

          {policy && (
            <div className="mt-3 text-xs text-black/70">
              Requisitos: longitud {policy.minLength}–{policy.maxLength}. Debe incluir:
              {' '}{policy.requireLower ? 'minúscula, ' : ''}{policy.requireUpper ? 'mayúscula, ' : ''}{policy.requireDigits ? 'número, ' : ''}{policy.requireSymbols ? 'símbolo, ' : ''}
              y usar solo caracteres permitidos.
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Contraseña</label>
            <div className="flex gap-2 items-stretch">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl bg-white/70 border text-black pr-24"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setCopied(false) }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 rounded-lg bg-white/70 border"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <button
                type="button"
                onClick={onCopyPassword}
                className="px-4 py-2 rounded-xl bg-white/70 border text-sm"
              >
                {copied ? 'Copiada ✓' : 'Copiar'}
              </button>
            </div>
            <div className="mt-1 text-xs text-black/70">
              Puedes mostrarla para guardarla en un gestor y copiarla al portapapeles.
            </div>
          </div>
          {error && <div className="p-3 rounded-lg bg-rose-100 text-rose-900">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          >
            Registrarme
          </button>
        </form>
        <p className="mt-3 text-sm">
          ¿Ya tienes cuenta? <a className="underline" href="/login">Inicia sesión</a>
        </p>
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

    const w = Number(weight)
    const hRaw = Number(height)

    // Bloquea NaN / Infinity
    if (!Number.isFinite(w) || !Number.isFinite(hRaw)) {
      setError('Introduce números válidos.')
      return
    }

    // Permitir altura en metros (1.78) o centímetros (178)
    const h = hRaw >= 3 ? hRaw / 100 : hRaw

    // Reglas alineadas con backend
    if (w <= 2 || w > 300) {
      setError('El peso debe estar entre 2 y 300 kg.')
      return
    }
    if (h <= 0 || h >= 3) {
      setError('La altura debe ser menor de 3 metros (puedes poner 1.78 o 178).')
      return
    }

    // Mantener compatibilidad: enviamos altura como la introduce el usuario
    const payload = { weight: w, height: hRaw }

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
              <input
                type="number"
                step="0.1"
                min="2.1"
                max="300"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="75.0"
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black placeholder-black/50"
              />
            </div>

            <div className="p-6 rounded-2xl shadow-xl border bg-gradient-to-r from-pink-200 via-fuchsia-200 to-purple-200">
              <label className="mb-2 block font-medium">Altura(m)</label>
              <input type="number" step="0.01" min="0" value={height} onChange={e => setHeight(e.target.value)}
                placeholder="1.78m" className="w-full px-4 py-2.5 rounded-xl bg-white/70 border focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black placeholder-black/50" />
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
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{ async: true, defer: true }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GoogleReCaptchaProvider>
  )
}

