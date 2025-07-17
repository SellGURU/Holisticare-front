export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Survey Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The survey you're looking for doesn't exist or has been removed.
        </p>
        <a
          href="#"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors inline-block"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
