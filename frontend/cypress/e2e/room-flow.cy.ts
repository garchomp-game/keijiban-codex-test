describe('Room message flow', () => {
  it('selects room and performs message CRUD', () => {
    cy.visit('/rooms');
    cy.get('[data-cy=room-item]').first().click();
    cy.url().should('include', '/rooms/1');
    cy.get('[data-cy=new-message]').type('Hello');
    cy.get('[data-cy=add-message]').click();
    cy.get('[data-cy=message-item]').should('contain', 'Hello');
    cy.get('[data-cy=edit-btn]').click();
    cy.get('[data-cy=edit-input]').clear().type('Hello Edited');
    cy.get('[data-cy=save-btn]').click();
    cy.get('[data-cy=message-item]').should('contain', 'Hello Edited');
    cy.get('[data-cy=delete-btn]').click();
    cy.get('[data-cy=message-item]').should('not.exist');
  });
});
