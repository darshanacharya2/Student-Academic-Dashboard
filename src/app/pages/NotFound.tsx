import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { AlertTriangle } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <Button onClick={() => navigate("/")}>
          Return to Login
        </Button>
      </div>
    </div>
  );
}
