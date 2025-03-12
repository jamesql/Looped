import { Channel, Role, Server } from "./serverTypes";
import { User } from "./userTypes";

export default interface LoopedSession {
    user: User;
    servers: Server[];
    channels: Channel[];
    roles: Role[];
}