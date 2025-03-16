import React from 'react';
import "../page-styles/home.css";

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <img className="logo" src="logo_main.jpg" alt="Logo" />
            <div className="buttons">
                <button onClick={() => ""}>Login</button>
                <button onClick={() => ""}>Sign Up</button>
            </div>
        </div>
    );
};

export default Home;