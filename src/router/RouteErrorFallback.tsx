import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

/**
 * Replaces React Router's default "Unexpected Application Error" screen with
 * an in-app message that matches the portal UI.
 */
export default function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = 'Something went wrong while loading this page.';
  if (isRouteErrorResponse(error)) {
    message = error.statusText || error.data?.message || message;
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#F8FAFB] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-Gray-50 bg-white p-8 text-center shadow-sm">
        <img
          src="/icons/info-circle-red.svg"
          alt=""
          className="mx-auto mb-4 h-10 w-10"
        />
        <h1 className="text-lg font-semibold text-Text-Primary">
          Unable to load this section
        </h1>
        <p className="mt-2 text-sm text-Text-Secondary">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-xl bg-Primary-DeepTeal px-4 py-2 text-sm text-white"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <button
            type="button"
            className="rounded-xl border border-Gray-50 px-4 py-2 text-sm text-Text-Primary"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
