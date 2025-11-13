import request from 'supertest'
import app from '../../server.js' 

describe('POST /api/entries', () => {
  let token

  beforeAll(async () => {
    
    const email = `t${Date.now()}@mail.com`
    const res = await request(app).post('/api/auth/register').send({ email, password: 'abc12345' })
    token = res.body.token
  })

  test('debe crear un registro válido (altura < 3 y peso mayor a 2)', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 2.1, height: 2.9 })
    expect(res.statusCode).toBe(201)
    expect(res.body.weight).toBe(2.1)
  })

 test('debe crear un registro válido (altura mayor de 0 )', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 2.1, height: 0.1 })
    expect(res.statusCode).toBe(201)
    expect(res.body.weight).toBe(2.1)
  })

  test('debe fallar si altura >= 3 m y peso menor a 2', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 1.9, height: 3.1 })
    expect(res.statusCode).toBe(400)
  })

  test('debe fallar con valores negativos', async () => {
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: -70, height: -1.75 })
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
