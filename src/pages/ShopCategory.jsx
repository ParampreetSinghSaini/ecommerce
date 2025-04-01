import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';



function ShopCategory({ banner }) {
  const { category } = useParams(); // Extract the category from the URL, if available
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Construct the URL based on whether a category is provided.
    let url = 'http://localhost:3001/api/product';
    if (category) {
      url += `?category=${category}`;
    }
    console.log(category)
    // Fetch products from the API.
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Assuming the API returns an object with a 'products' array
        setProducts(data.products);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {banner && <div className="banner">Banner Section</div>}
      <h1>{category ? category.toUpperCase() : 'All Products'}</h1>
      <div className="products-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.length ? (
          products.map(product => (
            <div key={product._id} className="product-card" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', width: '200px' }}>
                <Link to={`/productdetails?id=${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%' }} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Price: ${product.price}</p>
                </Link>
            </div>
          ))
        ) : (
          <div>No products found for this category.</div>
        )}
      </div>
    </div>
  );
}

export default ShopCategory;
