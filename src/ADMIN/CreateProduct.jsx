import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const API_URL= process.env.REACT_APP_API_URL;
// console.log(API_URL)


function CreateProduct() {
  const { productId } = useParams();

  const [product, setProduct] = useState({
    name: '',
    image: '',
    description: '',
    price: '',
    additional_description: '',
    additional_info: '',
    shipping_return: '',
    meta_title: '',
    meta_desc: '',
    is_active: false,
    category_id: [],
    tags: [],
    continue_selling_when_out_of_stock: false,
    variants: [
      {
        sku: '',
        price: '',
        stock: '',
        options: [{ optionName: '', optionValues: [''] }],
      },
    ],
    formattedVariants: [],
    options: [],
  });

  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/category`);
        const data = await response.json();

        if (response.ok) {
          setCategories(data || []); // Assume `categories` is the key in response
        } else {
          console.error('Error fetching categories:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_URL}/api/product/tags`);
        const data = await response.json();
        if (response.ok) {
          // Map your tags to objects with 'value' and 'label' keys
          const options = data.map(tag => ({ value: tag._id, label: tag.name }));
          setAvailableTags(options);
        } else {
          console.error('Error fetching tags:', data.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);


  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`${API_URL}/api/product/${productId}`);
          const data = await response.json();
          // console.log(data);
          if (response.ok) {
            const productData = {
              ...data.product,
              tags: data.product.tags || [],
              category_id: data.product.categories || [],
              options: data.product.variants.length
                ? data.product.variants[0].options.map((opt) => ({
                  optionName: opt.option_name,
                  optionValues: [
                    ...new Set(data.product.variants.map((v) =>
                      v.options.find((o) => o.option_name === opt.option_name)?.option_value
                    )),
                  ],
                }))
                : [],
              formattedVariants: data.product.variants.map((variant) => ({
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                options: variant.options.map((opt) => ({
                  optionName: opt.option_name,
                  optionValues: [opt.option_value],
                })),
              })),
            };

            setProduct(productData);
          } else {
            alert(data.error || 'Failed to fetch product details');
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      };

      fetchProduct();
    }
  }, [productId]);

  // Handle changes to the form fields
  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setProduct({
        ...product,
        [name]: checked,
      });
    } if (type === 'file') {
      const file = files[0];
      // console.log(file);
      // const base64 = await convertToBase64(file);

      setProduct({
        ...product,
        image: file,
      });
    }
    else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };


  // Handle changes to option names or values
  const handleOptionChange = (e, index, type) => {
    const { value } = e.target;
    const updatedOptions = [...product.options];
    if (type === 'name') {
      updatedOptions[index].optionName = value;
    } else if (type === 'value') {
      updatedOptions[index].optionValues = value.split(',').map((v) => v.trim());
    }
    setProduct({
      ...product,
      options: updatedOptions,
    });
  };

  // Add a new option (like color, size)
  const addOption = () => {
    setProduct({
      ...product,
      options: [...product.options, { optionName: '', optionValues: [''] }],
    });
  };

  // Generate all combinations of option values
  const formatVariants = () => {
    let formattedVariants = [];
    let optionsCombinations = [];

    // Generate combinations recursively
    const generateCombinations = (arrays, prefix = []) => {
      if (arrays.length === 0) {
        optionsCombinations.push(prefix);
        return;
      }
      for (let i = 0; i < arrays[0].length; i++) {
        generateCombinations(arrays.slice(1), [...prefix, arrays[0][i]]);
      }
    };

    // Prepare the array of option values for each option name
    const optionValuesArray = product.options.map((opt) => opt.optionValues);
    generateCombinations(optionValuesArray);

    // Generate the variants based on combinations
    optionsCombinations.forEach((combination) => {
      formattedVariants.push({
        sku: `${product.name}-${combination.join('-')}`,
        price: product.price,
        stock: 0,
        options: combination.map((value, index) => ({
          optionName: product.options[index].optionName,
          optionValues: [value],
        })),
      });
    });

    setProduct({
      ...product,
      formattedVariants,
    });
  };

  // console.log(product)
  // const handleTagChange = (selectedOptions) => {
  //   setProduct({ ...product, tags: selectedOptions || [] });
  // };


 

  const handleTagChange = (selectedOptions) => {
    if (!selectedOptions) return; // Prevent errors when it's null/undefined
  
    setProduct({
      ...product,
      tags: selectedOptions.map(tag =>
        typeof tag === 'string' ? { label: tag } : tag // Ensure all tags are objects
      ),
    });
  };
  


  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...product.formattedVariants];
    updatedVariants[index][name] = value;
    setProduct({
      ...product,
      formattedVariants: updatedVariants,
    });
  };

  const submitProduct = async () => {
    const apiUrl = productId
      ? `${API_URL}/api/product/${productId}` // Edit endpoint
      : `${API_URL}/api/product`; // Add endpoint

    const method = productId ? 'PUT' : 'POST';
    const formdata = new FormData();

    formdata.append('image', product.image);
    formdata.append('name', product.name);
    formdata.append('description', product.description);
    formdata.append('price', parseFloat(product.price));
    formdata.append('additional_description', product.additional_description);
    formdata.append('additional_info', product.additional_info);
    formdata.append('shipping_return', product.shipping_return);
    formdata.append('meta_title', product.meta_title);
    formdata.append('meta_desc', product.meta_desc);
    formdata.append('is_active', product.is_active);
    // category_id: product.category_id,
    // formdata.append('category_id', product.category_id);

    formdata.append('category_id', JSON.stringify(product.category_id));
    formdata.append('tags', JSON.stringify(product.tags.map(tag => tag.label)));




    formdata.append('continue_selling_when_out_of_stock', product.continue_selling_when_out_of_stock);
    formdata.append('variants', JSON.stringify(product.formattedVariants));


    try {
      // Send request using FormData

      const response = await fetch(apiUrl, {
        method,


        body: formdata, // Send form data directly here
      });

      const result = await response.json();
      // console.log(result);
      if (response.ok) {
        alert(`Product ${productId ? 'updated' : 'created'} successfully!`);
        // console.log(result);
      } else {
        alert(result.error);
        console.error(result);
      }
    } catch (error) {
      console.error('Error submitting product data:', error);
      alert('There was an error submitting the product.');
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    submitProduct();
  };

  // console.log(product);

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result)
      };
      fileReader.onerror = (error) => {
        reject(error);
      }
    })
  }


  return (
    <div className="container mt-4">
      <Card>
        <Card.Header as="h5">{productId ? "Edit Product" : "Create Product"}</Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="productName">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                </Form.Group>

                <Form.Group controlId="productImage">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) =>
                      handleChange(e)
                    }
                  // onChange={(e) =>
                  //   setProduct({
                  //     ...product,
                  //     image: e.target.files[0], // Store the selected file
                  //   })
                  // }
                  />
                </Form.Group>


                <Form.Group controlId="productDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </Form.Group>

                <Form.Group controlId="productPrice">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="Enter product price"
                  />
                </Form.Group>
                                  <Form.Group controlId="productCategory">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      as="select"
                      multiple // Enable multiple selection
                      name="category_id[]"
                      value={product.category_id}
                      onChange={(e) => {
                        const selectedOptions = [...e.target.selectedOptions].map(opt => opt.value);
                        setProduct({ ...product, category_id: selectedOptions });
                      }}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                 

                  <Form.Group controlId="productTags">
                  <Form.Label>Tags</Form.Label>
                 <Typeahead
  id="tags-typeahead"
  labelKey="label"
  multiple
  allowNew
  name="tags[]"
  newSelectionPrefix="New tag: "
  onChange={handleTagChange}
  options={availableTags}
  placeholder="Enter or select tags..."
  selected={Array.isArray(product.tags) ? product.tags : []} // Ensure it's an array
/>

                </Form.Group>


                <Form.Group controlId="additionalInfo">
                  <Form.Label>Additional Info</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additional_info"
                    value={product.additional_info}
                    onChange={handleChange}
                    placeholder="Enter additional product info"
                  />
                </Form.Group>

                <Form.Group controlId="shippingReturn">
                  <Form.Label>Shipping & Return</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="shipping_return"
                    value={product.shipping_return}
                    onChange={handleChange}
                    placeholder="Enter shipping and return information"
                  />
                </Form.Group>

                <Form.Group controlId="metaTitle">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="meta_title"
                    value={product.meta_title}
                    onChange={handleChange}
                    placeholder="Enter meta title"
                  />
                </Form.Group>

                <Form.Group controlId="metaDesc">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="meta_desc"
                    value={product.meta_desc}
                    onChange={handleChange}
                    placeholder="Enter meta description"
                  />
                </Form.Group>

              </Col>

              {/* Options Section */}
              <Col md={6}>
                {product.options.map((option, index) => (
                  <div key={index} className="mb-3">
                    <Form.Group controlId={`optionName-${index}`}>
                      <Form.Label>Option Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={option.optionName}
                        onChange={(e) => handleOptionChange(e, index, 'name')}
                        placeholder="Enter option name (e.g., color, size)"
                      />
                    </Form.Group>

                    <Form.Group controlId={`optionValues-${index}`}>
                      <Form.Label>Option Values</Form.Label>
                      <Form.Control
                        type="text"
                        value={option.optionValues.join(', ')}
                        onChange={(e) => handleOptionChange(e, index, 'value')}
                        placeholder="Enter option values separated by commas (e.g., red, blue, pink)"
                      />
                    </Form.Group>
                  </div>
                ))}

                <Button variant="secondary" onClick={addOption}>
                  Add Option
                </Button>

                <Button variant="primary" onClick={formatVariants} className="ml-2">
                  Format Variants
                </Button>
              </Col>
            </Row>

            {/* Variants Table */}
            <Card className="mt-4">
              <Card.Header as="h5">Product Variants</Card.Header>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.formattedVariants?.map((variant, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Control
                            type="text"
                            name="sku"
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, e)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            name="price"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, e)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            name="stock"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, e)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Button variant="primary" type="submit" className="mt-3">
              {productId ? 'Edit Product' : 'Add Product'}
            </Button>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CreateProduct;
