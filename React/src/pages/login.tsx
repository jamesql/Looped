import React, { useState } from "react";
import classes from "../styles/auth.module.css";
import Link from "next/link";
import ApiClient from "../util/api";
import Cookie from "js-cookie";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email && password) {
      ApiClient.getInstance()
        .login(email, password)
        .then((response) => {
          if (response.status === 200) {
            // Save access and refresh token in cookies
            Cookie.set("access_token", response.data.accessToken);
            Cookie.set("refresh_token", response.data.refreshToken);

            // Redirect to app page
            window.location.href = "/application";
          } else {
            console.log("Error logging in");
            alert("Error logging in. Please try again.");
          }
        })
        .catch((error) => {
          console.log(error);
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

export const getServerSideProps = async (context: any) => {
  const { req, res } = context;
  const cookies = req.headers.cookie || "";

  // Check for access_token or refresh_token in cookies
  const hasAccessToken = cookies.includes("access_token");
  const hasRefreshToken = cookies.includes("refresh_token");

  if (hasAccessToken || hasRefreshToken) {
    // Redirect to /application if tokens are present
    return {
      redirect: {
        destination: "/application",
        permanent: false,
      },
    };
  }

  // If no tokens are found, render the login page
  return {
    props: {}, // No additional props needed
  };
};

export default Login;