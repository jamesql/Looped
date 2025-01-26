import { WebSocketComponent } from "./components/_ws";

export default function Application() {
    return (
        <div>
            <h1>
                Welcome to Looped.
            </h1>
            <WebSocketComponent />
        </div>
    );
}