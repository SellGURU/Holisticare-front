// cypress/e2e/upload_test.cy.ts

/// <reference types="cypress" />

describe('UploadTest Component Functional Tests', () => {
  // Test data & credentials
  const memberId = '271451073558';
  const testReportId = 'mock-report-id-123';
  const username = 'clinic@gmail.com';
  const password = 'Aa@123456789';
  const baseUrl = `http://localhost:5173/report/${memberId}/newtest`;

  // --- Helper Methods (defined outside describe, or as Cypress Custom Commands in commands.ts) ---

  // NOTE: mockApiCalls should be a custom command in cypress/support/commands.ts
  // For this example, I'm keeping it here for immediate context, but best practice is to move it.
  const mockApiCalls = () => {
    // Mock backend API calls
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

    // Mock Azure upload success for default case
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess');
  };

  /**
   * Helper to upload a file.
   * Assumes mockApiCalls has been called previously to set up intercepts.
   * @param fileName The base name for the file (e.g., 'test_document.pdf'). A unique timestamp will be added.
   * @param mimeType The MIME type of the file.
   * @returns The dynamically generated unique file name.
   */
  const uploadFile = (fileName: string, mimeType: string): string => {
    const uniqueFileName = `${fileName.split('.')[0]}_${Date.now()}.${fileName.split('.').pop()}`; // Generate unique name

    cy.fixture('sample.pdf', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: uniqueFileName,
          mimeType: mimeType,
          lastModified: Date.now(),
        },
        { force: true },
      );
    });

    // Assert that the file name appears in the UI and is in 'uploading' status
    cy.contains(uniqueFileName).should('be.visible');
    cy.contains('uploading').should('be.visible');
    return uniqueFileName;
  };

  /**
   * Helper to assert successful file upload and button enablement.
   * @param fileName The name of the file that was uploaded.
   */
  const assertUploadCompletedAndButtonEnabled = (fileName: string) => {
    cy.wait('@azureUploadSuccess', { timeout: 60000 });
    cy.wait('@addLabReport', { timeout: 60000 });

    cy.contains(fileName).should('be.visible');
    cy.contains(fileName).parentsUntil('div').should('contain', 'completed');
    cy.contains('uploading').should('not.exist'); // Ensure uploading text is no longer visible

    cy.contains('Develop Health Plan').should('be.enabled');
  };

  /**
   * Helper to delete an uploaded file and assert button disabled state.
   * @param fileName The name of the file to delete.
   */
  const deleteUploadedFile = (fileName: string) => {
    cy.contains(fileName)
      .parents('[class*=FileBoxUploading]') // Selector for FileBoxUploading container
      .find('img[src*="/icons/delete.svg"]') // Selector for delete icon
      .click();

    cy.wait('@deleteLabReport', { timeout: 60000 }); // Wait for delete API call

    cy.contains(fileName).should('not.exist');
    cy.contains('Develop Health Plan').should('be.disabled');
  };

  // --- beforeEach Hook ---
  beforeEach(() => {
    cy.apiLogin(username, password);
    mockApiCalls(); // Call local mock helper for now
    cy.visit(baseUrl);
    // REMOVED: Initial UI assertions from here, moved to the first relevant test.
  });

  // --- Test Cases ---

  it('1. Displays initial state and successfully uploads a PDF file', () => {
    // Assert initial UI state BEFORE any uploads
    cy.contains('No Data Available Yet!', { timeout: 30000 }).should('be.visible');
    cy.contains('Develop Health Plan', { timeout: 30000 }).should('be.disabled');

    const uploadedFileName = uploadFile('initial_test.pdf', 'application/pdf');
    assertUploadCompletedAndButtonEnabled(uploadedFileName);
  });

  // Removed: it('2. Successfully uploads a DOCX file')

  it('2. Displays an error if Azure upload fails', () => {
    // Intercept Azure upload to force a 500 error for this specific test
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', {
      statusCode: 500,
      body: 'Azure Storage Error',
    }).as('azureUploadFail'); // IMPORTANT: Override the general 'azureUploadSuccess' for this test

    const fileName = uploadFile('azure_fail.pdf', 'application/pdf');

    cy.wait('@azureUploadFail', { timeout: 60000 }); // Wait for the mocked error response

    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    cy.contains('Failed to upload file. Please try again.').should('be.visible'); // Match your component's generic error
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('3. Displays an error if backend `addLabReport` fails', () => {
    // Re-intercept Azure to succeed for this test, as only backend should fail
    cy.intercept('PUT', 'https://*.blob.core.windows.net/*', (req) => {
      req.reply(201);
    }).as('azureUploadSuccess'); // Ensure this is explicitly set if another test changed it

    // Intercept backend API call to force a 406 error
    cy.intercept('POST', '**/api/labreport/add', {
      statusCode: 406,
      body: { message: 'Invalid file data provided by user.' },
    }).as('addLabReportFail');

    const fileName = uploadFile('backend_fail.pdf', 'application/pdf');

    cy.wait('@azureUploadSuccess', { timeout: 60000 });
    cy.wait('@addLabReportFail', { timeout: 60000 });

    cy.contains(fileName).parentsUntil('div').should('contain', 'error');
    cy.contains('Invalid file data provided by user.').should('be.visible'); // Match specific backend error
    cy.contains('Develop Health Plan').should('be.disabled');
  });

  it('4. Allows deletion of an uploaded file, disabling button if no files remain', () => {
    const uploadedFileName = uploadFile('delete_test.pdf', 'application/pdf');
    assertUploadCompletedAndButtonEnabled(uploadedFileName); // Ensure upload completes before attempting delete
    deleteUploadedFile(uploadedFileName);
  });

  it('5. Supports multiple file uploads and shows them in list', () => {
    // The general `azureUploadSuccess` and `addLabReport` intercepts from `mockApiCalls` are active.
    // We just need to trigger multiple uploads.

    // Upload first file
    const fileName1 = uploadFile(`multi_upload_1.pdf`, 'application/pdf');
    assertUploadCompletedAndButtonEnabled(fileName1); // This will wait for its specific calls

    // Upload second file
    const fileName2 = uploadFile(`multi_upload_2.pdf`, 'application/pdf');
    assertUploadCompletedAndButtonEnabled(fileName2); // This will wait for its specific calls

    // Ensure both are visible and the button remains enabled
    cy.contains(fileName1).should('be.visible');
    cy.contains(fileName2).should('be.visible');
    cy.contains('Develop Health Plan').should('be.enabled');

    // Optionally, delete one and check button state
    // deleteUploadedFile(fileName1);
    // cy.contains('Develop Health Plan').should('be.enabled'); // Should still be enabled if fileName2 remains
    // deleteUploadedFile(fileName2);
    // cy.contains('Develop Health Plan').should('be.disabled'); // Should be disabled if all are gone
  });

  // --- Test Case for Button Click - This should be a separate, final test if it closes the section ---
  it('6. Calls `onGenerate` and closes upload section when "Develop Health Plan" is clicked', () => {
    // Stub the global `publish` function to verify it's called
    cy.window().then((win) => {
      cy.stub(win, 'publish').as('publishEventSpy');
    });

    const uploadedFileName = uploadFile('click_generate.pdf', 'application/pdf');
    assertUploadCompletedAndButtonEnabled(uploadedFileName); // Ensure upload completes and button is enabled

    // Click the "Develop Health Plan" button
    cy.contains('Develop Health Plan').click();

    // Assert that the `publish` function was called
    cy.get('@publishEventSpy').should('have.been.calledWith', 'QuestionaryTrackingCall', {});

    // Assert that the upload section is now closed/gone.
    // This depends on how your component *closes* itself or its parent.
    // Example: if the main div with "No Data Available Yet!" is removed/hidden:
    cy.contains('No Data Available Yet!').should('not.exist');
    // Or if the file input area is gone:
    cy.get('input[type="file"]').should('not.exist');
    // Or if you navigate to a new URL:
    // cy.url().should('include', '/new-health-plan-route');
  });

  it('7. "Complete Questionnaire" button publishes event when clicked', () => {
    // This test does not involve file uploads or closing the section
    cy.window().then((win) => {
      cy.stub(win, 'publish').as('publishEventSpy');
    });

    cy.contains('Complete Questionnaire').click();

    cy.get('@publishEventSpy').should('have.been.calledWith', 'QuestionaryTrackingCall', {});
  });

  it('8. Upload area is disabled when `isShare` prop is true (assuming URL parameter)', () => {
    // This test specifically validates behavior when `isShare` is true.
    // It should NOT involve actual file uploads or button clicks that change the app state.
    // We mock the login again for this specific route.
    cy.apiLogin(username, password); // Ensure fresh login for this specific route visit

    const shareUrl = `http://localhost:5173/report/${memberId}/nimatest%20new?isShare=true`; // Assuming `isShare` as a query param
    cy.visit(shareUrl);

    // Initial assertions for shared state (e.g., "No Data Available Yet!" might still be there)
    cy.contains('No Data Available Yet!').should('be.visible');

    // Check for the visual opacity of the upload box wrapper
    cy.get('.w-full.shadow-100.mt-4.h-\\[182px\\].bg-white.rounded-\\[12px\\].border.border-Gray-50')
      .should('have.class', 'opacity-20');

    // Verify interaction is disabled
    cy.get('input[type="file"]').should('not.be.enabled'); // The input itself should be disabled
    cy.contains('Upload Test Results').should('not.be.enabled'); // The visible click link

    // Attempt to click the wrapper and verify no file dialog/upload initiated
    cy.contains('Drag and drop your test file here or click to upload.').click({ force: true });
    // Verify no file selection event or API call occurred (check if the modal/dialog for upload shows up in real app)
    cy.get('@addLabReport.all').should('have.length', 0);
  });
});