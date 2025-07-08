// cypress/e2e/upload_test.cy.ts

describe('UploadTest Component Functionality', () => {
  const memberId = '912184018999'; // From your URL
  const testReportId = 'some-generated-report-id-123'; // Simulate backend ID
  const azureMockUrl = 'https://mocked.azure.blob.core.windows.net/test-file.pdf';
  const username = 'clinic@gmail.com';
  const password = 'Aa@123456789';

  beforeEach(() => {
    // Programmatically log in before each test
    cy.apiLogin(username, password);
    cy.visit(`http://localhost:5173/report/${memberId}/cypress%20test`);

    // --- Mock API calls ---

    // Mock Azure upload
    // This intercepts the POST request to the Azure upload endpoint.
    // We simulate a successful response immediately.
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      // Simulate progress updates if needed, but for now, just success.
      req.reply({
        statusCode: 201, // Created
        body: '', // Azure blob upload usually returns an empty body on success
        headers: {
          'x-ms-request-id': 'mock-azure-request',
          'x-ms-version': '2020-08-04',
          'ETag': 'mock-etag',
          'Content-MD5': 'mock-md5',
          'Last-Modified': new Date().toUTCString(),
          'x-ms-blob-type': 'BlockBlob',
          'Content-Length': '0',
        },
      });
    }).as('azureUpload');

    // Mock backend addLabReport
    cy.intercept('POST', '**/api/labreport/add', (req) => {
      // Respond with a success message and a generated ID
      req.reply({
        statusCode: 200,
        body: {
          message: 'File uploaded successfully to backend',
          report_id: testReportId, // This is important for deletion later
        },
      });
    }).as('addLabReport');

    // Mock backend deleteLapReport
    cy.intercept('DELETE', `**/api/lapreport/${testReportId}`, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          message: 'File deleted successfully',
        },
      });
    }).as('deleteLabReport');

    // Ensure the initial "No Data Available Yet!" message is visible
    cy.contains('No Data Available Yet!').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('allows a user to upload a PDF file successfully', () => {
    const fileName = 'test_document.pdf';
    const filePath = 'example.pdf'; // Path to a dummy PDF in your cypress/fixtures folder

    // Simulate selecting a file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is a test pdf'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });

    // Verify the file starts uploading
    cy.contains(fileName).should('be.visible');
    cy.contains('uploading').should('be.visible'); // This text might be inside FileBoxUploading

    // Wait for the Azure upload and backend calls to complete
    cy.wait('@azureUpload');
    cy.wait('@addLabReport');

    // Verify the file transitions to completed status
    cy.contains(fileName).parentsUntil('div').should('contain', 'completed');

    // Verify the "Develop Health Plan" button becomes enabled
    cy.contains('Develop Health Plan').should('be.enabled');
  });

  it('allows a user to upload a DOCX file successfully', () => {
    const fileName = 'report.docx';
    const filePath = 'example.docx'; // Path to a dummy DOCX in your cypress/fixtures folder

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is a test docx'),
      fileName: fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastModified: Date.now(),
    });

    cy.contains(fileName).should('be.visible');
    cy.contains('uploading').should('be.visible');

    cy.wait('@azureUpload');
    cy.wait('@addLabReport');

    cy.contains(fileName).parentsUntil('div').should('contain', 'completed');
    cy.contains('Develop Health Plan').should('be.enabled');
  });

  it('allows a user to delete an uploaded file', () => {
    const fileName = 'to_be_deleted.pdf';

    // First, upload a file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is a test pdf for deletion'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });

    // Wait for the upload to complete
    cy.wait('@azureUpload');
    cy.wait('@addLabReport');

    cy.contains(fileName).parentsUntil('div').should('contain', 'completed');
    cy.contains('Develop Health Plan').should('be.enabled');

    // Find the delete button for the uploaded file and click it
    // Assuming FileBoxUploading has a delete button (e.g., an icon with alt text or a specific class)
    // You might need to adjust this selector based on your FileBoxUploading component's implementation.
    // For example, if it uses an image with alt="delete", you'd use cy.get(`img[alt="delete"]`).
    // Or if it has a specific class like 'delete-button'.
    cy.contains(fileName) // Find the row containing the file name
      .parents('div') // Go up to the parent element that contains the delete button
      .find('img[src*="/icons/delete.svg"]') // Find the delete icon within that parent
      .click();

    // Wait for the delete API call
    cy.wait('@deleteLabReport');

    // Verify the file is no longer in the list
    cy.contains(fileName).should('not.exist');

    // Verify the "Develop Health Plan" button becomes disabled again if no files are left
    // This depends on your component's logic: if `uploadedFiles` becomes empty, it should disable.
    cy.contains('Develop Health Plan').should('be.disabled');
  });


  it('shows an error message if Azure upload fails', () => {
    const fileName = 'azure_fail.pdf';

    // Intercept Azure upload to simulate a failure
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply({
        statusCode: 500, // Internal Server Error
        body: 'Azure upload failed',
      });
    }).as('azureUploadFail');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is a test pdf for azure failure'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });

    cy.contains(fileName).should('be.visible');

    cy.wait('@azureUploadFail');

    // Verify the status changes to error and an error message is displayed
    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    // Assuming the error message from the component is displayed somewhere in FileBoxUploading
    cy.contains('Failed to upload file. Please try again.').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });


  it('shows an error message if backend upload fails', () => {
    const fileName = 'backend_fail.pdf';

    // Intercept backend addLabReport to simulate a failure
    cy.intercept('POST', '**/api/labreport/add', (req) => {
      req.reply({
        statusCode: 400, // Bad Request
        body: { message: 'Backend validation failed' },
      });
    }).as('addLabReportFail');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is a test pdf for backend failure'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });

    cy.contains(fileName).should('be.visible');

    // Wait for Azure to succeed first
    cy.wait('@azureUpload');
    // Then wait for backend to fail
    cy.wait('@addLabReportFail');

    // Verify the status changes to error and an error message is displayed
    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    cy.contains('Backend validation failed').should('be.visible');
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('calls onGenderate when "Develop Health Plan" button is clicked and files are uploaded', () => {
    const fileName = 'health_plan_test.pdf';

    // Spy on window.alert if it's used for onGenderate, or if you have a way to mock the prop.
    // For a React prop, you'd typically pass a spy into the component's mount.
    // Since we are doing E2E, we'll assume `onGenderate` triggers some observable effect like a navigation or a message.
    // If `onGenderate` is just a function call, Cypress can't directly spy on it in an E2E context unless it causes a visible side effect or triggers a network call.
    // For simplicity, let's assume it triggers a publish event, and we can check that.
    // Alternatively, if it navigates, we can check the URL.

    // Mock the `publish` function if you want to assert its call
    cy.window().then((win) => {
      cy.stub(win, 'publish').as('publishEvent');
    });


    // Upload a file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('this is for health plan test'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });

    cy.wait('@azureUpload');
    cy.wait('@addLabReport');

    cy.contains(fileName).parentsUntil('div').should('contain', 'completed');
    cy.contains('Develop Health Plan').should('be.enabled').click();

    // Verify that the onGenderate function (or its side effect) was called.
    // If onGenderate navigates, you'd assert the URL:
    // cy.url().should('include', '/some-health-plan-page');
    // If it publishes an event, check the stub:
    // cy.get('@publishEvent').should('have.been.calledWith', 'HealthPlanGenerated'); // Adjust event name if different
  });

});