import bcrypt from 'bcryptjs'

describe('hash de contraseñas', () => {
  test('genera y valida hash correctamente', () => {
    const password = '123456'
    const hash = bcrypt.hashSync(password, 10)
    expect(bcrypt.compareSync(password, hash)).toBe(true)
  })

  test('falla con contraseña incorrecta', () => {
    const hash = bcrypt.hashSync('123456', 10)
    expect(bcrypt.compareSync('000000', hash)).toBe(false)
  })
})
