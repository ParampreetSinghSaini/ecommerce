import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';


function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [message, setMessage] = useState(null);

  const query = new URLSearchParams(useLocation().search);
  const productId = query.get('id');

  useEffect(() => {
    if (!productId) {
      setError('Product ID is missing');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/product/${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Product not found');
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);
  // console.log(product)
  const handleAddToCart = async () => {
    if (!product) return;
  
    const cartItem = {
      productId: product._id,
      variantId: selectedVariant || null,
      quantity: parseInt(quantity),
    };
  
    const token = Cookies.get('token');
    
    if(!productId || !selectedVariant){
      setMessage({ type: 'warning', text: '*Please select the variant!!!' });
      clearMessageAfterDelay();
      return;
    }

    // If no token, user is not logged in
    if (!token) {
      // Retrieve any existing local cart, or start with an empty array
      const localCart = JSON.parse(localStorage.getItem('localCart')) || [];
      // Add the current item to the local cart
      localCart.push(cartItem);
      localStorage.setItem('localCart', JSON.stringify(localCart));
      setMessage({ type: 'success', text: 'Item added to local cart. Please log in to sync your cart.' });
      clearMessageAfterDelay();

      return;
    }
  
    // If token exists, make the API call
    try {
      const response = await fetch('http://localhost:3001/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItem),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Added to cart successfully!' });
      clearMessageAfterDelay();

      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add to cart' });
      clearMessageAfterDelay();

      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error, please try again later' });
      clearMessageAfterDelay();

    }
  };
  

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} style={{ width: '300px', height: 'auto', marginBottom: '1rem' }} />
      <p>{product.description}</p>
      <p><strong>Price:</strong> ${product.price}</p>

      {/* Variant Selection */}
    {/* Variant Selection */}
{product.variants && product.variants.length > 0 && (
  <div>
    <label>
      <strong>Select Variant:</strong>
    </label>
    <select
      onChange={(e) => setSelectedVariant(e.target.value || null)}
      value={selectedVariant || ''}
    >
      <option value="">Default (No Variant)</option>
      {product.variants.map((variant) => (
        <option key={variant.id} value={variant.id}>
          {variant.sku} - ${variant.price}
        </option>
      ))}
    </select>
  </div>
)}


      {/* Quantity Selection */}
      <div>
        <label><strong>Quantity:</strong></label>
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(e.target.value)}
          style={{ width: '50px', marginLeft: '10px' }}
        />
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        style={{
          display: 'block',
          marginTop: '10px',
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Add to Cart
      </button>

      {/* Success/Error Message */}
      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</p>
      )}
    </div>
  );
}

export default ProductDetail;
