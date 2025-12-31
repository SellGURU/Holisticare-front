import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-9xl font-extrabold text-gray-800">404</h1>

      <h2 className="mt-6 text-2xl font-semibold text-gray-700">
        Page Not Found
      </h2>

      <p className="mt-4 max-w-md text-gray-500">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-xl bg-Primary-EmeraldGreen px-6 py-3 text-white transition hover:bg-blue-700"
        >
          Go Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="rounded-xl  bg-white px-6 py-1 text-Primary-EmeraldGreen transition hover:bg-gray-100 border-Primary-EmeraldGreen border-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
