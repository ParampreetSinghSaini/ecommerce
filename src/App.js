import logo from './logo.svg';
import './App.css';
import RouteFiles from './RouteFiles/RouteFiles';
import Navbar from './components/navbar/Navbar';
import ShopContextProvider from './context/ShopContext'

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import './index.css'; // Your custom CSS


function App() {
  return (
    <>
      <ShopContextProvider>

        <RouteFiles/>
      </ShopContextProvider>
    </>
  );
}

export default App;
