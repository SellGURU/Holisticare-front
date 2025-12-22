import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

const EmptyQuestion = () => {
  return (
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <Card className="bg-white shadow-xl border-0 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">
              No Questions Available
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              This survey doesn't contain any questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-gray-600 mb-6">
              The survey data structure might not be in the expected format.
              Please check the console for details.
            </p>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>    
  )
};

export default EmptyQuestion;