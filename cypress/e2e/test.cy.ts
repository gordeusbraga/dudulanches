describe('Dudu Lanches', () => {
  it('mostra a tela de login', () => {
    cy.visit('/');
    cy.contains('ion-content', 'Bem-vindo de volta');
  });

  it('entra e lista as mesas', () => {
    cy.visit('/login');
    cy.get('#usuario').type('carlos.silva');
    cy.get('#senha').type('123456');
    cy.contains('button', 'Entrar').click();
    cy.contains('.dl-brand-header__title', 'Mesas');
    cy.contains('.dl-mesa-card__nome', 'Mesa 01');
  });
});
