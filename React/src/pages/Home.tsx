import React from 'react';
import "../page-styles/home.css";
import "../page-styles/default.css";

import { useNavigate } from 'react-router';

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="home-container">
            <img className="logo" src="logo_main.jpg" alt="Logo" />
            <div className="buttons">
                
                <button className="button" onClick={() => navigate("/login")}>Login</button>
                <button className="button" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
        </div>
    );
};

export default Home;