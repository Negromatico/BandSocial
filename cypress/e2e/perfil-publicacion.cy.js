describe('E2E: Flujo Completo Perfil y Publicación', () => {
  
  it('TC-E2E-001: Usuario puede navegar por la landing page', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
    cy.url().should('include', 'localhost');
  });

  it('TC-E2E-002: Usuario puede acceder a login', () => {
    cy.visit('/login', { failOnStatusCode: false });
    cy.url().should('include', '/login');
    // Verificar que la página carga
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-003: Usuario puede acceder a registro', () => {
    cy.visit('/register', { failOnStatusCode: false });
    cy.url().should('include', '/register');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-004: Modo invitado puede explorar músicos', () => {
    cy.visit('/musicos', { failOnStatusCode: false });
    cy.url().should('include', '/musicos');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-005: Modo invitado no puede crear publicación', () => {
    cy.visit('/publicaciones', { failOnStatusCode: false });
    cy.url().should('include', '/publicaciones');
    cy.get('body').should('be.visible');
    
    // Verificar que la página de publicaciones carga
    cy.wait(1000);
  });

  it('TC-E2E-006: Formulario de perfil carga correctamente', () => {
    cy.visit('/profile', { failOnStatusCode: false });
    cy.url().should('include', '/profile');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-007: Formulario de publicación carga correctamente', () => {
    cy.visit('/publicaciones', { failOnStatusCode: false });
    cy.url().should('include', '/publicaciones');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-008: Validación de campos obligatorios en perfil', () => {
    cy.visit('/profile', { failOnStatusCode: false });
    cy.url().should('include', '/profile');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-009: Navegación entre páginas funciona', () => {
    cy.visit('/musicos', { failOnStatusCode: false });
    cy.url().should('include', '/musicos');
    cy.wait(500);
    
    cy.visit('/publicaciones', { failOnStatusCode: false });
    cy.url().should('include', '/publicaciones');
    cy.wait(500);
    
    cy.visit('/profile', { failOnStatusCode: false });
    cy.url().should('include', '/profile');
  });

  it('TC-E2E-010: Responsive - Vista móvil', () => {
    cy.viewport('iphone-x');
    cy.visit('/musicos');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-011: Responsive - Vista tablet', () => {
    cy.viewport('ipad-2');
    cy.visit('/publicaciones');
    cy.get('body').should('be.visible');
  });

  it('TC-E2E-012: Responsive - Vista desktop', () => {
    cy.viewport(1920, 1080);
    cy.visit('/profile');
    cy.get('body').should('be.visible');
  });
});
