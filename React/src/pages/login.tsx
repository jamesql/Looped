import React, { useState } from "react";
import classes from "../styles/auth.module.css";
import Link from "next/link";
import ApiClient from "../util/api";
import Cookie from "js-cookie";

const Login: React.FC = () => {
  // state for username and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // make sure email and password are not null
    if (email && password) {
      // send a request to the server to login

      ApiClient.getInstance()
        .login(email, password)
        .then((response) => {
          console.log(response);

          if (response.status === 200) {
            //save access and refresh token in cookie
            Cookie.set("access_token", response.data.accessToken);
            Cookie.set("refresh_token", response.data.refreshToken);

            // redirect to app page
            window.location.href = "/application";
          } else {
            // handle error here
            console.log("Error logging in");
            alert("Error logging in. Please try again.");
          }
        })
        .catch((error) => {
          console.log(error);
          // handle error here
        });
    }
  };

  return (
    <div className={classes.container}>
      <nav className={classes.nav}>
        <img
          className={classes.nav_image}
          src="/logo_transparent.png"
          alt="Looped"
        />
        <ul className={classes.nav_links}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/signup">Sign Up</Link>
          </li>
        </ul>
      </nav>
      <div className={classes.form_container}>
        <form onSubmit={handleSubmit} method="POST">
          <h2>Login</h2>
          <div className={classes.input_group}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={classes.input_group}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className={classes.login_button} type="submit">
            Login
          </button>
          <p className={classes.pClearFix}>
            Don't have an account?
            <Link href="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
