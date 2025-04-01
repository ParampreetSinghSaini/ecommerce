import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const navigate = useNavigate();
  const token = Cookies.get("token");
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
   
    if (!token) {
      const storedCart = localStorage.getItem("cart");
     
      Swal.fire({ icon: "warning", text: "Please log in to view your cart" });
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:3001/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data || { items: [] });
    } catch (error) {
      console.error("Error fetching cart:", error);
      Swal.fire({ icon: "error", text: "Failed to load cart" });
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
  
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `http://localhost:3001/api/cart/${itemId}`, // ✅ Corrected API route
        { quantity: newQuantity }, // ✅ Send only quantity as API expects
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
    } catch (error) {
      Swal.fire({ icon: "error", text: "Failed to update quantity" });
    }
  };
  

  const removeFromCart = async (itemId) => {
    try {
      
      const token = Cookies.get("token");
      await axios.delete(`http://localhost:3001/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      Swal.fire({ icon: "success", text: "Item removed from cart" });
      fetchCart(); // Refresh cart
    } catch (error) {
      Swal.fire({ icon: "error", text: "Failed to remove item" });
    }
  };
  

  const calculateTotalPrice = () => {
    return cart.items.reduce((total, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };


  const proceedToCheckout = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch('http://localhost:3001/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ cart }),
      });
      const data = await response.json();
      if (data.sessionId) {
        // Redirect the user to the Stripe Checkout URL
        window.location.href = data.sessionId;
      } else {
        Swal.fire({ icon: "error", text: "Checkout session not created." });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      Swal.fire({ icon: "error", text: "Failed to proceed to checkout." });
    }
  };
  

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} className="cart-image" />
              <div className="cart-details">
                <h4>{item.product.name}</h4>
                <p>{item.product.description}</p>
                {item.variant && <p>Variant: {item.variant.sku}</p>}
                <p>Price: ${item.variant ? item.variant.price : item.product.price}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item?._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item?._id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item?._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <h3>Total: ${calculateTotalPrice()}</h3>
          <button className="checkout-btn" onClick={proceedToCheckout}>Proceed to Checkout</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
