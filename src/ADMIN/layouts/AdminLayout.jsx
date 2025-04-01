import React from 'react'
import AdminNavbar from '../components/AdminNavbar'
import AdminFooter from '../components/AdminFooter'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div>
        <AdminNavbar/>
        <Outlet/>
        <AdminFooter/>
    </div>
  )
}

export default AdminLayout