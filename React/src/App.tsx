import React from 'react';
import logo from './logo.svg';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <div>

       <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={< Login/>} />
          <Route path="/signup" element={< Signup/>} />
          {/* Add more routes here as needed */}
       </Routes>
      </div>
    </Router>
  );
}

export default App;
