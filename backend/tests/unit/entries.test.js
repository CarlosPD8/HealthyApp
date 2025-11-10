import request from 'supertest'
import app from '../../server.js' // usa la app real (export default app)

describe('POST /api/entries', () => {
  let token

  beforeAll(async () => {
    // crea un usuario y obtén token
    const email = `t${Date.now()}@mail.com`
    const res = await request(app).post('/api/auth/register').send({ email, password: 'abc12345' })
    token = res.body.token
  })

  test('debe crear un registro válido (altura < 3)', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 70, height: 1.75 })
    expect(res.statusCode).toBe(201)
    expect(res.body.weight).toBe(70)
  })

  test('debe fallar si altura >= 3 m', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 70, height: 3.75 })
    expect(res.statusCode).toBe(400)
  })

  test('debe fallar con valores negativos', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: -70, height: 1.75 })
    expect(res.statusCode).toBe(400)
  })

  test('debe fallar con datos faltantes', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({})
    expect(res.statusCode).toBe(400)
  })
})
