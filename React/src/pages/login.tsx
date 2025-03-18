import React from 'react';
import classes from "../styles/auth.module.css";
import Link from "next/link";

const Login: React.FC = () => {

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle login logic here

    }

    return (
        <div className={classes.container}>
            <nav className={classes.nav}>
                <img className={classes.nav_image} src="/logo_transparent.png" alt="Looped" />
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
                <label htmlFor='email'>Email:</label>
                <input type="email" id="email" name="email" required />
            </div>
            <div className={classes.input_group}>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
            </div>
            <button className={classes.login_button} type="submit">Login</button>
            <p className={classes.pClearFix}>Don't have an account? 
                <Link href="/signup">Sign Up</Link>
            </p>
        </form>
    </div>
        </div>
    );
};

export default Login;