import request from 'supertest'
import { exec } from 'child_process'
import util from 'util'
const execAsync = util.promisify(exec)
import '../../server.js' // importa el servidor real

const API_URL = 'http://localhost:3001'

describe('Prueba de sistema API completa', () => {
  test('flujo completo: registro → login → crear registro', async () => {
    const email = `test${Date.now()}@mail.com`
    const password = 'abc12345'

    // Registro
    const reg = await request(API_URL)
      .post('/api/auth/register')
      .send({ email, password })
    expect(reg.statusCode).toBe(201)

    const token = reg.body.token
    expect(token).toBeTruthy()

    // Crear entry
    const entry = await request(API_URL)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 80, height: 1.8 })
    expect(entry.statusCode).toBe(201)
  })
})
