import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie';

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState({});
    const[cookies, setCookies] = useCookies(['token']);



  const handleSubmit = async (e) => {
    e.preventDefault();
    const localCart = JSON.parse(localStorage.getItem('localCart')) || [];
    const formData = new FormData()

    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    const data ={ name, email,password,  cartItems: localCart,}

    try {
      
      const response = await axios.post('http://localhost:3001/api/user/register', data);
        Swal.fire({
            icon: "success",
            text: response.data.message
          });
          setCookies('token', JSON.stringify( response.data.token), { maxAge: 3600 });
          localStorage.removeItem('localCart');
          navigate("/");

    } catch (error) {
      
        if (error.response && error.response.status === 422) {
          setValidationError(error);
          
        } else {
          
          Swal.fire({
            text: error.response.data.message,
            icon: "error"
          });
          setValidationError(error.response.data.message);
        
        }
      }
  };
  

  return (
    <div>
      <h2>Register</h2>

      {typeof validationError === 'string' && validationError && (
  <div className="alert alert-danger" role="alert">
    {validationError.split('\n').map((line, index) => (
      <span key={index} style={{ color: 'red' }}>{line}<br /></span>
    ))}
  </div>
)}


      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={name}
            onChange={(event)=>setName(event.target.value)}
            
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={email}
            onChange={(event)=>setEmail(event.target.value)}
            
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={password}
            onChange={(event)=>setPassword(event.target.value)}
            
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Register</button>
        
      </form>
    </div>
  );
}

export default Register;
