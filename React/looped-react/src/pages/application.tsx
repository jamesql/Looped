import { AppContextComponent } from "./components/_context";
import ComponentTest from "./componentsTests";


export default function Application() {

    return (
        <AppContextComponent>
            <ComponentTest />
        </AppContextComponent>
    );

};