import React from 'react';
import classes from "../styles/auth.module.css";
import Link from "next/link";

const Signup: React.FC = () => {
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
        <form action="#" method="POST">
            <h2>Sign Up</h2>
            <div className={classes.names}>
                <div className={classes.input_group}>
                    <label htmlFor="first-name">First Name:</label>
                    <input type="text" id="first-name" name="first-name" required />
                </div>
                <div className={classes.input_group}>
                    <label htmlFor="last-name">Last Name:</label>
                    <input type="text" id="last-name" name="last-name" required />
                </div>
            </div>
            <div className={classes.names}>
                <div className={classes.input_group}>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className={classes.input_group}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
            </div>
            <div className={classes.input_group}>
                <label htmlFor="location">Location:</label>
                <input type="text" id="location" name="location" required />
            </div>
            <div className={classes.input_group}>
                <label htmlFor="birthday">Birthday:</label>
                <input type="date" id="birthday" name="birthday" required />
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

export default Signup;