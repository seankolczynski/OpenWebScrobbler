describe('Scrobble song (form)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.intercept('GET', '/api/v2/user.php', { fixture: 'api/v2/user/authenticated.json' }).as('userData');
    cy.intercept('POST', '/api/v2/scrobble.php', { fixture: 'api/v2/scrobble/success.json' }).as('scrobbleData');

    cy.visit('/scrobble/song');
    cy.location('pathname').should('equal', '/scrobble/song');
  });

  it('should display the page', () => {
    cy.get('[data-cy="ScrobbleSong"]');
  });

  it('should have the song form', () => {
    cy.get('[data-cy="SongForm"]');
  });

  it('should disable the Scrobble button when the form is incomplete', () => {
    cy.get('[data-cy="scrobble-button"]').should('be.disabled');

    // Add only the artist name
    cy.get('[data-cy="SongForm-artist"]').type('Arctic Monkeys');
    cy.get('[data-cy="scrobble-button"]').should('be.disabled');
    cy.get('[data-cy="SongForm-artist"]').clear();

    // Add only the title
    cy.get('[data-cy="SongForm-title"]').type('Arabella');
    cy.get('[data-cy="scrobble-button"]').should('be.disabled');
    cy.get('[data-cy="SongForm-title"]').clear();

    // Add both Album and album artist
    cy.get('[data-cy="SongForm-album"]').type('AM');
    cy.get('[data-cy="SongForm-albumArtist"]').type('Arctic Monkeys');
    cy.get('[data-cy="scrobble-button"]').should('be.disabled');
  });

  it('should enable the Scrobble button when the form is complete', () => {
    cy.get('[data-cy="SongForm-artist"]').type('Arctic Monkeys');
    cy.get('[data-cy="SongForm-title"]').type('Arabella');
    cy.get('[data-cy="scrobble-button"]').should('not.be.disabled');
  });

  it('should swap artist and title when the user clicks the swap button', () => {
    cy.get('[data-cy="SongForm-artist"]').type('Arctic Monkeys', { delay: 0 });
    cy.get('[data-cy="SongForm-title"]').type('Arabella', { delay: 0 });

    cy.get('[data-cy="SongForm-swap"]').click();

    cy.get('[data-cy="SongForm-artist"]').should('have.value', 'Arabella');
    cy.get('[data-cy="SongForm-title"]').should('have.value', 'Arctic Monkeys');
  });

  describe('after scrobbling', () => {
    beforeEach(() => {
      cy.get('[data-cy="SongForm-artist"]').type('Arctic Monkeys', { delay: 0 });
      cy.get('[data-cy="SongForm-title"]').type('Arabella', { delay: 0 });
      cy.get('[data-cy="SongForm-album"]').type('AM', { delay: 0 });
      cy.get('[data-cy="SongForm-albumArtist"]').type('Other', { delay: 0 });
    });

    it('should clear the form after submission', () => {
      cy.get('[data-cy="scrobble-button"]').click();

      cy.wait('@scrobbleData').then(() => {
        cy.get('[data-cy="SongForm-artist"]').should('have.value', '');
        cy.get('[data-cy="SongForm-title"]').should('have.value', '');
        cy.get('[data-cy="SongForm-album"]').should('have.value', '');
        cy.get('[data-cy="SongForm-albumArtist"]').should('have.value', '');
      });
    });

    it('should keep pinned artist', () => {
      cy.get('[data-cy="SongForm-artist-lock"]').click();

      cy.get('[data-cy="scrobble-button"]').click();

      cy.wait('@scrobbleData').then(() => {
        cy.get('[data-cy="SongForm-artist"]').should('have.value', 'Arctic Monkeys');
        cy.get('[data-cy="SongForm-title"]').should('have.value', '');
      });
    });

    it('should keep pinned album', () => {
      cy.get('[data-cy="SongForm-album-lock"]').click();

      cy.get('[data-cy="scrobble-button"]').click();

      cy.wait('@scrobbleData').then(() => {
        cy.get('[data-cy="SongForm-album"]').should('have.value', 'AM');
        cy.get('[data-cy="SongForm-albumArtist"]').should('have.value', 'Other');
      });
    });
  });
});
