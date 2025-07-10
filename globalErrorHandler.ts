export function initGlobalErrorHandler() {
  // if (process.env.NODE_ENV !== 'production') return;

  window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global JS Error:', {
      message,
      source,
      lineno,
      colno,
      error,
    });
    showGlobalError();
  };

  window.onunhandledrejection = function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    showGlobalError();
  };

//   <img src="/icons/server-down.svg" alt="Error Illustration" class="w-40 h-40 mb-6 animate-bounce-slow" />
  function showGlobalError() {
    document.body.innerHTML = `
        <div class="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4 animate-fade-in">
          <h1 class="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
          <p class="text-sm text-gray-700 mb-4 max-w-md">
            Sorry, the application encountered an unexpected error. Please refresh the page or try again later. 
          </p>
          <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Refresh Page
          </button>
        </div>
  
        <style>
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out both;
          }
  
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
        </style>
      `;
  }
}
