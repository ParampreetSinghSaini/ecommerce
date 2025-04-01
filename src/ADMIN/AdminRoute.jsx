// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import { useCookies } from 'react-cookie';

function AdminRoute({ children }) {
  const [cookies] = useCookies(['token']);
  const token = cookies.token;

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    // console.log(decoded);
    if (decoded.role === 'admin') {
      return children;
    } else {
        console.log('you are not a admin');
      return <Navigate to="/" />;
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
    return <Navigate to="/login" />;
  }
}

export default AdminRoute;
