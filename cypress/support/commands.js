// ***********************************************
// Custom commands for Cypress
// ***********************************************

// Comando para login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Comando para activar modo invitado
Cypress.Commands.add('activarModoInvitado', () => {
  cy.visit('/');
  cy.contains('Explorar como invitado').click();
});

// Comando para llenar formulario de perfil
Cypress.Commands.add('llenarPerfilMusico', (datos) => {
  cy.get('input[name="nombre"]').clear().type(datos.nombre);
  if (datos.ciudad) {
    // Interactuar con react-select requiere comandos especiales
    cy.get('[class*="ciudad"]').click();
    cy.contains(datos.ciudad).click();
  }
});

// Comando para llenar formulario de publicación
Cypress.Commands.add('llenarPublicacion', (datos) => {
  cy.get('input[name="titulo"]').type(datos.titulo);
  cy.get('textarea[name="descripcion"]').type(datos.descripcion);
  if (datos.tipo) {
    cy.get('select[name="tipo"]').select(datos.tipo);
  }
});
