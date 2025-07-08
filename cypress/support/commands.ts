// cypress/support/commands.ts

// Fix 1: Use ES2015 module syntax for declarations
// Import Chainable and AUTWindow from 'cypress' directly.
import { Chainable, AUTWindow } from 'cypress';

// Fix 2 & 3: Extend the Cypress interface directly with generics
// and correctly use AUTWindow.
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> { // Subject = any makes it generic
      /**
       * Custom command to log in a user through the UI.
       * @example cy.login('testuser', 'password123')
       */
      login(username: string, password: string): Chainable<AUTWindow>;

      /**
       * Custom command to programmatically log in a user via API and set token.
       * @example cy.apiLogin('testuser', 'password123')
       */
      apiLogin(username: string, password: string): Chainable<AUTWindow>;
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.visit('/login'); // Assuming your login page is at /login

    cy.get('input[name="email"]').type(username); // Adjust selectors
    cy.get('input[name="password"]').type(password);
    cy.get('button[id="login-submit"]').click(); // Adjust selector

    cy.url().should('not.include', '/login');
  }, {
    validate() {
      // Ensure the session cookie or token still exists
      cy.getCookie('your-session-cookie-name').should('exist');
    },
  });
});

Cypress.Commands.add('apiLogin', (username: string, password: string) => {
    cy.session([username, password], () => {
      // Corrected cy.request to send form-urlencoded data
      cy.request({
        method: 'POST',
        url: 'https://vercel-backend-one-roan.vercel.app/holisticare_test/auth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Set Content-Type
        },
        body: `username=${username}&password=${password}`, // Send as URL-encoded string
        // Setting form: true will automatically set the Content-Type to application/x-www-form-urlencoded
        // and stringify the body as 'username=foo&password=bar' for you.
        // Alternatively, you could do:
        // form: true,
        // body: { username, password },
      }).then((response) => {
        // Make sure your backend actually returns a 'token' field.
        // Inspect the successful API response in your browser's network tab
        // to confirm the field name for the auth token.
        const authToken = response.body.access_token; // Adjust this if your token field is named differently
        if (!authToken) {
          throw new Error('Authentication token not found in API response.');
        }
        cy.window().then((win) => {
          win.localStorage.setItem('token', authToken); // Adjust 'authToken' if your app uses a different key
        });
      });
    }, {
    validate() {
      cy.window().its('localStorage').invoke('getItem', 'token').should('exist');
    },
  });
});