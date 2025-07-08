describe('UploadTest Component Functional Tests', () => {
  // Test data & credentials
  const memberId = '912184018999';
  const testReportId = 'mock-report-id-123';
  const username = 'clinic@gmail.com';
  const password = 'Aa@123456789';

  const baseUrl = `http://localhost:5173/report/${memberId}/cypress%20test`;

  // --- Test Setup: Runs before each test in this suite ---
  beforeEach(() => {
    // Programmatically log in
    cy.apiLogin(username, password);

    // Mock the API calls
    cy.mockApiCalls();

    // Visit the page to initialize the component
    cy.visit(baseUrl);

    // Initial UI Assertions
    cy.contains('No Data Available Yet!').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  // --- Helper Methods ---
  Cypress.Commands.add('mockApiCalls', () => {
    // Mock backend API calls
    cy.intercept('POST', '**/api/labreport/add', (req) => {
      expect(req.body.member_id).to.equal(memberId);
      req.reply({ statusCode: 200, body: { message: 'File uploaded successfully', report_id: testReportId } });
    }).as('addLabReport');

    cy.intercept('DELETE', `**/api/lapreport/${testReportId}`, (req) => {
      req.reply({ statusCode: 200, body: { message: 'File deleted successfully' } });
    }).as('deleteLabReport');
  });

  const uploadFile = () => {
    // Generate a unique file name
    const uniqueFileName = `a_${Date.now()}.pdf`; // Example: a_1627834900000.pdf

    // Upload the actual file located in the cypress/fixtures folder (using pdf now)
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Content for upload test'),
      fileName: uniqueFileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    }, { force: true });

    cy.contains(uniqueFileName).should('be.visible');
    cy.wait('@addLabReport', { timeout: 30000 });
  };

  const assertFileUploadSuccess = () => {
    // Assert that the file upload completed successfully and the button is enabled
    cy.contains('a.pdf').parentsUntil('div').should('contain', 'completed');
    cy.contains('uploading').should('not.exist');
    cy.contains('Develop Health Plan').should('be.enabled');
  };

  const deleteUploadedFile = () => {
    // Find and click the delete button for the uploaded file
    cy.contains('a.pdf').parents('div[class*="FileBoxUploading"]')
      .find('img[src*="/icons/delete.svg"]')
      .click();
    cy.wait('@deleteLabReport', { timeout: 30000 });
    cy.contains('a.pdf').should('not.exist');
    cy.contains('Develop Health Plan').should('be.disabled');
  };

  // --- Test Cases ---

  it('1. Successfully uploads an actual PDF file and enables the "Develop Health Plan" button', () => {
    uploadFile();
    assertFileUploadSuccess();
  });

  it('2. Displays an error if backend `addLabReport` fails when uploading PDF file', () => {
    // Simulate a failure in backend API
    cy.intercept('POST', '**/api/labreport/add', (req) => {
      req.reply({ statusCode: 400, body: { message: 'Invalid file data provided by user.' } });
    }).as('addLabReportFail');

    uploadFile();
    cy.wait('@addLabReportFail', { timeout: 30000 });
    cy.contains('a.pdf').parentsUntil('div').should('contain', 'error');
    cy.contains('Invalid file data provided by user.').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('3. Allows deletion of an uploaded PDF file, disabling the "Develop Health Plan" button if no files remain', () => {
    uploadFile();
    deleteUploadedFile();
  });

  it('4. Calls the `onGenerate` prop when "Develop Health Plan" is clicked after uploading PDF file', () => {
    cy.window().then((win) => {
      cy.stub(win, 'publish').as('publishEventSpy');
    });

    uploadFile();
    cy.contains('Develop Health Plan').click();
    cy.get('@publishEventSpy').should('have.been.calledWith', 'QuestionaryTrackingCall', {});
  });
});
