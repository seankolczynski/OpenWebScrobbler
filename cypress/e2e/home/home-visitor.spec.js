describe('Home (visitor)', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v2/user.php', { fixture: 'api/v2/user/visitor.json' });
    cy.visit('/');
  });

  it('shows the visitor version of the home page', () => {
    cy.get('[data-cy="HomeVisitor"]');
  });

  it('is using translations', () => {
    cy.get('[data-cy="HomeVisitor-about"] p').should('not.contain', 'about.description');
  });

  it('shows an error if token was invalid', () => {
    cy.intercept('POST', '/api/v2/callback.php', { statusCode: 503, fixture: 'api/v2/callback/failure.json' });

    cy.visit('/?token=aTestValue-withNumbers1234and_x1');
    cy.get('.alert-danger').should('exist');
  });

  it('supports changing the language when not logged in', () => {
    cy.get('[data-cy="LanguageSelector"]').click();
    cy.get('[data-lang="es"]').click();
    cy.get('[data-cy="LanguageSelector"] a').should('contain', 'Idioma');
  });

  it('remembers the chosen language', () => {
    cy.get('[data-cy="LanguageSelector"]').click();
    cy.get('[data-lang="es"]').click();
    cy.reload();
    cy.get('[data-cy="LanguageSelector"] a').should('contain', 'Idioma');
  });
});
