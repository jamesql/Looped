import React from "react";
import classes from "../styles/loader.module.css";

const Loader: React.FC = () => {
  return (
    <div className={classes.container}>
    <div className={classes.loader}>
      <div className={classes.circle}></div>
      <div className={classes.circle}></div>
    </div>
    </div>
  );
};

export default Loader;