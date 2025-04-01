import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

function AuthUser() {
    const [cookies] = useCookies(['token']);
     const [, , removeCookie] = useCookies(['token']); 
    const navigate = useNavigate();

    const getToken = () =>{
        return cookies.token || null;
    }
    const getUser = () =>{
        const userString = sessionStorage.getItem('user');
        const user_details = JSON.parse(userString);
        return user_details;
    }
    
    const[token, setToken] =useState(getToken());
    const[user, setUser] =useState(getUser());


    const logout = () => {
        // Remove the 'token' cookie
        removeCookie('token', { path: '/' }); // Set the correct path of the cookie
    
        navigate('/login'); // Redirect to the login page
      };



    const saveToken = (user,token) =>{
        sessionStorage.setItem('token', JSON.stringify(token));
        sessionStorage.setItem('user', JSON.stringify(user));


            setToken(token); 
            setUser(user);
            navigate('/');
    }


    const http = axios.create({
        baseURL:"http://localhost:8000/api",
        headers:{
            "content-type" : "application/json"
        }
    });
  return {
    setToken:saveToken,
    token,
    user,
    getToken,
    http, 
    logout
  }
}

export default AuthUser