import React, { useEffect, useState } from 'react';
import './css/loginSignup.css';
import AuthUser from '../auth/AuthUser';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';

function LoginSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { http, setToken, getToken } = AuthUser();
  const [validationError, setValidationError] = useState({});
  const [cookies, setCookie] = useCookies(['token']); 
  
  useEffect(() => {
    const checkAuthentication = () => {
      if (cookies.token) {
        // If the 'token' cookie exists, the user is authenticated
        navigate('/');
      }
    };

    checkAuthentication();
  }, [cookies.token, navigate]);
  
  // Rest of your component code

  const submitHandler = async (e) => {

    e.preventDefault();
    const localCart = JSON.parse(localStorage.getItem('localCart')) || [];
    
   
    try {
  
      const response = await axios.post('http://localhost:3001/api/user/login', {
        email,
        password,
        cartItems: localCart, 
      });
   
      // Assuming the API response sends back a token
      Swal.fire({
        icon: "success",
        text: response.data.message
      });
      console.log(response.data.token)
      setCookie('token', response.data.token, { maxAge: 3600 });

      localStorage.removeItem('localCart');

      // Cookies.set('token', JSON.stringify( response.data.token), { expires: 1 / 24 }); 
      // sessionStorage.setItem('token', JSON.stringify( response.data.token));
      navigate("/");

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
      <form className="was-validated">
        <div className="form-group">
          <label htmlFor="uname">Username:</label>
          <input
            type="text"
            className="form-control"
            id="uname"
            placeholder="Enter username"
            onChange={(e) => setEmail(e.target.value)}
            name="uname"
            required
          />
          <div className="valid-feedback">Valid.</div>
          <div className="invalid-feedback">Please fill out this field.</div>
        </div>
        <div className="form-group">
          <label htmlFor="pwd">Password:</label>
          <input
            type="password"
            className="form-control"
            id="pwd"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            name="pswd"
            required
          />
          <div className="valid-feedback">Valid.</div>
          <div className="invalid-feedback">Please fill out this field.</div>
        </div>

        <button type="button" onClick={submitHandler} className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

export default LoginSignup;
