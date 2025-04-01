import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditUser() {
  const navigate = useNavigate();

  const { productId } = useParams();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [new_Price, setNew_Price] = useState(0);
  const [old_price, setOld_price] = useState(0);
  const [validationError, setValidationError] = useState({});


  const changeHandler = (event) => {
		setImage(event.target.files[0]);
	};



    useEffect(() => {
        fetchProduct(productId);
      }, [productId]);
    
      const fetchProduct = async (productId) => {
        try {
          
           
          const response = await axios.get(`http://localhost:3001/api/product/${productId}`);
         
          const { name, category, image, new_Price, old_price } = response.data; // Assuming the fetched data is structured this way
          setName(name);
          setCategory(category);
          setImage(image);
          setNew_Price(new_Price);
          setOld_price(old_price);
        } catch (error) {
          // Handle error
        }
      };



    const updateProduct = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('new_Price', new_Price);
        formData.append('old_price', old_price);
        if (image !== null) {
          formData.append('image', image);
        }
        formData.append('_method', 'PATCH');
    
        try {
           
          const response = await axios.put(`http://localhost:3001/api/product/${productId}`, formData, {
            
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          Swal.fire({
            icon: "success",
            text: response.data.message
          });
          navigate("/auth/admin/all-products");
        } catch (error) {
          if (error.response && error.response.status === 422) {
            setValidationError(error.response.data.errors);
          } else {
            Swal.fire({
              text: error.response.data.message,
              icon: "error"
            });
          }
        }
      };

  return (
    <div className="container">
    <div className="row justify-content-center">
      <div className="col-12 col-sm-12 col-md-6">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Update Product</h4>
            <hr />
            <div className="form-wrapper">
              {/* Validation Errors */}
              {/* Display validation errors if any */}
              {/* Form */}
              <Form onSubmit={updateProduct}>
                {/* Name Input */}
                <Row> 
                  <Col>
                    <Form.Group controlId="Name">
                      <Form.Label>Name</Form.Label>
                      <Form.Control type="text" value={name} onChange={(event) => setName(event.target.value)} />
                    </Form.Group>
                  </Col>  
                </Row>
                {/* Category Input */}
                <Row className="my-3">
                  <Col>
                    <Form.Group controlId="Category">
                      <Form.Label>Category</Form.Label>
                      <Form.Control type="text" value={category} onChange={(event) => setCategory(event.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                {/* New Price Input */}
                <Row className="my-3">
                  <Col>
                    <Form.Group controlId="NewPrice">
                      <Form.Label>New Price</Form.Label>
                      <Form.Control type="text" value={new_Price} onChange={(event) => setNew_Price(event.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Old Price Input */}
                <Row className="my-3">
                  <Col>
                    <Form.Group controlId="OldPrice">
                      <Form.Label>Old Price</Form.Label>
                      <Form.Control type="text" value={old_price} onChange={(event) => setOld_price(event.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Image Input */}
                <Row>
                  <Col>
                    <Form.Group controlId="Image" className="mb-3">
                      <Form.Label>Image</Form.Label>
                      <Form.Control type="file" onChange={changeHandler} />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Submit Button */}
                <Button variant="primary" className="mt-2" size="lg" block="block" type="submit">
                  Update
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  )
}