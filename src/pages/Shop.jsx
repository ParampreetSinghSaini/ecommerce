import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/product')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>All Products</h2>
      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', textAlign: 'center' }}>
              <Link to={`/productdetails?id=${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: 'auto', marginBottom: '1rem' }} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p><strong>Price:</strong> ${product.price}</p>
              </Link>
            </div>
          ))
        ) : (
          !loading && <p>No products found.</p>
        )}
      </div>
    </div>
  );
}

export default Shop;
