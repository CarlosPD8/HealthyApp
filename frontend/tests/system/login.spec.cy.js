describe('Flujo de login y registro', () => {
  it('permite registrar y luego iniciar sesión', () => {
    cy.visit('http://localhost:5173/register')
    const email = `user${Date.now()}@mail.com`
    cy.get('input[placeholder="tu@email.com"]').type(email)
    cy.get('input[type="password"]').type('abc12345')
    cy.contains('Registrarme').click()
    cy.url().should('include', '/')
    cy.contains('Registro de Peso y Altura')
  })
})
