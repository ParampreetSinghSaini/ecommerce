import React from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function AdminNavbar() {
  return (
    <>
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand>PP</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/auth/admin/all-products">Products</Nav.Link>
          <Nav.Link href="/auth/admin/add-product">Add Product</Nav.Link>
          <Nav.Link href="/auth/admin/category/add">Add Category</Nav.Link>

          {/* <Nav.Link href="#pricing">Pricing</Nav.Link> */}
        </Nav>
      </Container>
    </Navbar>
   
  </>
  )
}

export default AdminNavbar