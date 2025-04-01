import React, { useContext, useEffect, useState } from "react";
import "./navbar.css";
import logo from "../../assets/logo.png";
import cart_icon from "../../assets/cart_icon.png";
import { Link } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import AuthUser from "../../auth/AuthUser";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const { getToken, logout, user } = AuthUser(); // Assuming getToken function from AuthUser returns the token
  const [token, setToken] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userr, setUser] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const userToken = await getToken();
      setToken(userToken);

      if (userToken) {
        // Fetch user information here using a function that returns a promise (e.g., getUserInfo())
        try {
          // const userData = await user();

          // Replace with your function to get user data
          const decoded = jwtDecode(token);
          setUser(decoded.name);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchToken();
  }, [getToken]);

  const handleLogout = () => {
    if (token !== null) {
      logout();
    }
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="navbar-top">
      <div className="navbar">
        <div className="nav-logo">
          <img src={logo} alt="Logo" />
          <p>SHOPPER</p>
        </div>
        <ul className="nav-menu">
          <li
            onClick={() => {
              setMenu("shop");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/">
              Shop
            </Link>
            {menu === "shop" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("mens");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/men">
              Men
            </Link>
            {menu === "mens" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("women");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/women">
              Women
            </Link>
            {menu === "women" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("kids");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/kids">
              Kids
            </Link>
            {menu === "kids" ? <hr /> : <></>}
          </li>
          <li
            onClick={() => {
              setMenu("Carts");
            }}
          >
            <Link style={{ textDecoration: "none" }} to="/cart">
              Carts
            </Link>
            {menu === "Carts" ? <hr /> : <></>}
          </li>
        </ul>
        <div className="nav-login-cart">
          {!token ? (
            <button>
              <Link style={{ textDecoration: "none" }} to="/login">
                Login
              </Link>
            </button>
          ) : (
            <div className="dropdown">
              <button onClick={handleUserClick} className="dropbtn">
                {user && user.name}
                <i
                  className={`fa ${
                    showDropdown ? "fa-caret-up" : "fa-caret-down"
                  }`}
                >
                  {userr}
                </i>
              </button>
              {showDropdown && (
                <div className="dropdown-content">
                  <span onClick={handleLogout} className="nav-link">
                    Logout
                  </span>
                </div>
              )}
            </div>
          )}
          {/* ... (remaining JSX code for the cart icon and count) */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
