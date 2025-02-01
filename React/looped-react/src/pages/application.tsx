import { AppContextComponent } from "./components/_context";
import ComponentTest from "./componentsTests";
import styles from "../styles/global.module.css";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});


export default function Application() {

    return (
        <AppContextComponent>
            <ComponentTest />
        </AppContextComponent>
    );

};