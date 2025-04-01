import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";

const CancelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fromCheckout = location.state?.fromCheckout;
    if (!fromCheckout) {
      navigate("/"); // Redirect if accessed directly
    }
  }, [navigate, location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <XCircle className="text-red-500 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold">Payment Canceled</h1>
      <p className="text-gray-700 mt-2">Your payment was not completed.</p>
      
    </div>
  );
};

export default CancelPage;
