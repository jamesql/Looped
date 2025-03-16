import React from 'react';
import logo from './logo.svg';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div>

       <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes here as needed */}
       </Routes>
      </div>
    </Router>
  );
}

export default App;
