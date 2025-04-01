import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Navbar from '../components/navbar/Navbar'
import Shop from '../pages/Shop'
import ShopCategory from '../pages/ShopCategory'
import Product from '../pages/Product'
import Cart from '../pages/Cart'
import LoginSignup from '../pages/LoginSignup'
import Layout from '../layout/Layout'

import CreateProduct from '../ADMIN/CreateProduct'
import EditUser from '../ADMIN/EditUser'
import List from '../ADMIN/List'
import Register from '../pages/Register'
import AdminRoute from '../ADMIN/AdminRoute'
import AdminLayout from '../ADMIN/layouts/AdminLayout'
import Category from '../ADMIN/Category'
import ProductDetail from '../pages/ProductDetail'
import SuccessPage from '../pages/SuccessPage'
import CancelPage from '../pages/CancelPage'




function RouteFiles() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='/' element={<Shop />} />
          {/* <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kids" />} /> */}


      <Route path="/:category" element={<ShopCategory  />} />
      <Route path="/productdetails" element={<ProductDetail />} />


          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path='/register' element={<Register />} />
          <Route path='/success' element={<SuccessPage />} />
        <Route path='/cancel' element={<CancelPage />} />
        </Route>

        

        <Route path='/product' element={<Product />}>

          <Route path=':productId' element={<Product />} />
        </Route>
 
      
        <Route path="/auth/admin" element={<AdminLayout />}>
     
        <Route
          path="add-product/:productId?"
          element={
            <AdminRoute>
              <CreateProduct />
            </AdminRoute>
          }
        />
        <Route
          path="all-products"
          element={
            <AdminRoute>
              <List />
            </AdminRoute>
          }
        />
        <Route
          path="edit-product/:productId"
          element={
            <AdminRoute>
              <EditUser />
            </AdminRoute>
          }
        />

        <Route
          path="category/add"
          element={
            <AdminRoute>
              <Category />
            </AdminRoute>
          }
        />
      </Route>


      </Routes>
    </div>
  )
}

export default RouteFiles