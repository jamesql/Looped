import React, { useState } from 'react';
import classes from "../styles/auth.module.css";
import Link from "next/link";
import ApiClient from '@/util/api';
import Cookie from 'js-cookie';


const Signup: React.FC = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("");
    const [birthday, setBirthday] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (firstName && lastName && email && password && location && birthday) {
            ApiClient.getInstance()
                .signup(email, password, firstName, lastName, birthday, location)
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
                        console.log("Error signing up");
                        alert("Error signing up. Please try again.");
                    }
                }
                )
                .catch((error) => {
                    console.log(error);
                    // handle error here
                }
                );
        }
    };

    return (
        <div className={classes.container}>   
        <nav className={classes.nav}>
        <img className={classes.nav_image} src="/logo_transparent.png" />
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
            <h2>Sign Up</h2>
            <div className={classes.names}>
                <div className={classes.input_group}>
                    <label htmlFor="first-name">First Name:</label>
                    <input type="text" id="first-name" name="first-name" onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className={classes.input_group}>
                    <label htmlFor="last-name">Last Name:</label>
                    <input type="text" id="last-name" name="last-name" onChange={(e) => setLastName(e.target.value)} required />
                </div>
            </div>
            <div className={classes.names}>
                <div className={classes.input_group}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={classes.input_group}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} required />
                </div>
            </div>
            <div className={classes.input_group}>
                <label htmlFor="location">Location:</label>
                <input type="text" id="location" name="location" onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className={classes.input_group}>
                <label htmlFor="birthday">Birthday:</label>
                <input type="date" id="birthday" name="birthday" onChange={(e) => setBirthday(e.target.value)} required />
            </div>

            <div className={classes.input_group}>
                <label htmlFor="terms">
                    <input type="checkbox" id="terms" name="terms" required />
                    I agree to the terms and conditions
                </label>
            </div>

            <button className={classes.login_button} type="submit">Sign Up</button>
            <p className={classes.pClearFix}>Already have an account? 
                <Link href="/login">Login</Link>
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
  

export default Signup;