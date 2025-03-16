import Image from "next/image";
import Link from "next/link";
import { Open_Sans } from "next/font/google";
import classes from "../styles/home.module.css";

export default function Home() {
  return (
    <div className={classes.container}>
    <img className={classes.logo} src={"/logo_main.jpg"} alt="Looped Logo" />
    
    <h1 className={classes.title_text}>Looped</h1>

    <div className={classes.buttons}>
      <Link href="/login">
        <button className={classes.button}>Login</button>
      </Link>
      <Link href="/signup">
        <button className={classes.button}>Sign Up</button>
      </Link>
    </div>
    </div>
  );
}