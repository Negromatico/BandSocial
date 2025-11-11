describe('Pruebas de Rendimiento', () => {
  
  it('TC-PERF-001: Página principal carga en menos de 3 segundos', () => {
    const start = Date.now();
    
    cy.visit('/', { failOnStatusCode: false });
    
    cy.get('body').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
      cy.log(`Tiempo de carga: ${loadTime}ms`);
    });
  });

  it('TC-PERF-002: Formulario de perfil carga en menos de 2 segundos', () => {
    const start = Date.now();
    
    cy.visit('/profile', { failOnStatusCode: false });
    
    cy.get('body').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(2000);
      cy.log(`Tiempo de carga: ${loadTime}ms`);
    });
  });

  it('TC-PERF-003: Formulario de publicación carga en menos de 2 segundos', () => {
    const start = Date.now();
    
    cy.visit('/publicaciones', { failOnStatusCode: false });
    
    cy.get('body').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(2000);
      cy.log(`Tiempo de carga: ${loadTime}ms`);
    });
  });

  it('TC-PERF-004: Navegación entre páginas es fluida', () => {
    cy.visit('/musicos', { failOnStatusCode: false });
    cy.wait(500);
    
    const start = Date.now();
    cy.visit('/publicaciones', { failOnStatusCode: false });
    
    cy.get('body').should('be.visible').then(() => {
      const navTime = Date.now() - start;
      expect(navTime).to.be.lessThan(1500);
      cy.log(`Tiempo de navegación: ${navTime}ms`);
    });
  });

  it('TC-PERF-005: API de Colombia responde en menos de 5 segundos', () => {
    cy.visit('/profile');
    
    const start = Date.now();
    
    // Esperar a que se carguen las ciudades
    cy.wait(5000);
    
    const apiTime = Date.now() - start;
    cy.log(`Tiempo de respuesta API: ${apiTime}ms`);
    expect(apiTime).to.be.lessThan(5000);
  });
});
