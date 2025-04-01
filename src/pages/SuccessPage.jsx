import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
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
      <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold">Thank You for Your Purchase!</h1>
      <p className="text-gray-700 mt-2">Your order has been successfully placed.</p>
      <button 
        onClick={() => navigate("/")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default SuccessPage;
