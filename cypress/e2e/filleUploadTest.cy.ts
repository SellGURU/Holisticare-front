/// <reference types="cypress" />

describe('UploadTest Component Functional Tests', () => {
  const memberId = '912184018999';
  const testReportId = 'mock-report-id-123';
  const username = 'clinic@gmail.com';
  const password = 'Aa@123456789';

  const baseUrl = `http://localhost:5173/report/${memberId}/cypress%20test`;

  // Setup reusable mocks
  const mockApiCalls = () => {
    cy.intercept('POST', '**/api/labreport/add', (req) => {
      expect(req.body.member_id).to.equal(memberId);
      req.reply({
        statusCode: 200,
        body: {
          message: 'File uploaded successfully',
          report_id: testReportId,
        },
      });
    }).as('addLabReport');

    cy.intercept('DELETE', `**/api/lapreport/${testReportId}`, {
      statusCode: 200,
      body: { message: 'File deleted successfully' },
    }).as('deleteLabReport');
  };

  beforeEach(() => {
    cy.apiLogin(username, password);
    mockApiCalls();
    cy.visit(baseUrl);

    cy.contains('No Data Available Yet!', { timeout: 30000 }).should('be.visible');
    cy.contains('Develop Health Plan', { timeout: 30000 }).should('be.disabled');
  });

  const uploadFile = (fileName = `test_upload_${Date.now()}.pdf`) => {
    cy.fixture('sample.pdf', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName,
        mimeType: 'application/pdf',
        lastModified: Date.now(),
      }, { force: true });
    });
    return fileName;
  };

  it('1. Successfully uploads a PDF file (Azure + backend) and enables Develop Health Plan', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201); // Simulate Azure upload success
    }).as('azureUploadSuccess');

    const fileName = uploadFile();

    cy.wait('@azureUploadSuccess', { timeout: 60000 });
    cy.wait('@addLabReport', { timeout: 60000 });

    cy.contains(fileName).should('be.visible');
    cy.contains('completed').should('be.visible');
    cy.contains('uploading').should('not.exist');
    cy.contains('Develop Health Plan').should('be.enabled');
  });

  it('2. Displays error if Azure upload fails', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', {
      statusCode: 500,
      body: 'Azure Storage Error',
    }).as('azureUploadFail');

    const fileName = uploadFile();

    cy.wait('@azureUploadFail', { timeout: 60000 });

    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    cy.contains('Failed to upload file').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('3. Displays error if backend upload fails', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess');

    cy.intercept('POST', '**/api/labreport/add', {
      statusCode: 406,
      body: { message: 'Invalid file data provided by user.' },
    }).as('addLabReportFail');

    const fileName = uploadFile();

    cy.wait('@azureUploadSuccess', { timeout: 30000 });
    cy.wait('@addLabReportFail', { timeout: 30000 });

    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    cy.contains('Invalid file data provided by user.').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('4. Allows deletion of uploaded file and disables button if no files remain', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess');

    const fileName = uploadFile();

    cy.wait('@azureUploadSuccess');
    cy.wait('@addLabReport');

    cy.contains(fileName).should('be.visible');
    cy.contains('Develop Health Plan').should('be.enabled');

    cy.contains(fileName)
      .parents('[class*=FileBoxUploading]')
      .find('img[src*="/icons/delete.svg"]')
      .click();

    cy.wait('@deleteLabReport');

    cy.contains(fileName).should('not.exist');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('5. Calls onGenerate when Develop Health Plan is clicked after upload', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess');

    const fileName = uploadFile();

    cy.wait('@azureUploadSuccess');
    cy.wait('@addLabReport');

    cy.window().then((win) => {
      cy.stub(win, 'publish').as('publishEvent');
    });

    cy.contains('Develop Health Plan').click();

    cy.get('@publishEvent').should('have.been.calledWith', 'QuestionaryTrackingCall', {});
  });

  it('6. Supports multiple file uploads and shows them in list', () => {
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess');

    const fileName1 = uploadFile(`multi_upload_1_${Date.now()}.pdf`);
    const fileName2 = uploadFile(`multi_upload_2_${Date.now()}.pdf`);

    cy.wait('@azureUploadSuccess');
    cy.wait('@azureUploadSuccess');
    cy.wait('@addLabReport');
    cy.wait('@addLabReport');

    cy.contains(fileName1).should('be.visible');
    cy.contains(fileName2).should('be.visible');

    cy.contains('Develop Health Plan').should('be.enabled');
  });
});
