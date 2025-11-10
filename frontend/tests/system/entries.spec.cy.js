describe('añade un nuevo registro', () => {
  before(() => {
    const email = "admin@mail.com";
    const password = "abc12345";

    // Crear usuario si no existe
    cy.request({
      method: "POST",
      url: "http://localhost:3001/api/auth/register",
      body: { email, password },
      failOnStatusCode: false,
    });
  });

  it('añade un nuevo registro', () => {
    cy.visit('/login');
    cy.get('input[placeholder="tu@email.com"]').type('admin@mail.com');
    cy.get('input[type="password"]').type('abc12345');
    cy.contains('Entrar').click();

    cy.contains('Registro de Peso y Altura'); // espera a que cargue

    cy.get('input[placeholder="75.0"]').type('80');
    cy.get('input[placeholder="1.78 o 178"]').type('1.80');
    cy.contains('Guardar').click();

    cy.contains('IMC');
  });
});
