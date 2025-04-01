import React, { useState, useEffect } from 'react';
import './newCollections.css';
import Item from '../item/Item';





function NewCollections() {
  const [products, setProducts] = useState([]);
 
  const imagePath = '../../assets/product_12.png';
 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/getProducts');
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  
  return (
    <div className='new-collections'>
      <h1>New Collections</h1>
      <hr />

      <div className="collections">
        {products.map((product, index) => (
          <Item
            key={index}
            id={product._id} // Assuming your product object has an _id field
            name={product.name}
            image={imagePath}
            new_price={product.new_Price}
            old_price={product.old_price}
          />
        ))}
      </div>
    </div>
  );
}

export default NewCollections;
