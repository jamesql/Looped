import React from "react";
import "../styles/loader.css";

const Loader: React.FC = () => {
  return (
    <div className="loader">
      <div className="circle"></div>
      <div className="circle"></div>
    </div>
  );
};

export default Loader;
