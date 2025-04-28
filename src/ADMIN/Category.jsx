import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';


const API_URL= process.env.REACT_APP_API_URL;
// console.log(API_URL)


const Category = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/api/category`, { name, description });
      setSuccess('Category added successfully!');
      setName('');
      setDescription('');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Failed to add category');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded">
      <h3>Add New Category</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group controlId="formCategoryName">
        <Form.Label>Category Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formCategoryDescription" className="mt-3">
        <Form.Label>Category Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter category description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3">
        Add Category
      </Button>
    </Form>
  );
};

export default Category;