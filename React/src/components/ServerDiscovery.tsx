import React from 'react';
import { Server } from '../../../Types/serverTypes';
import discoveryClasses from "../styles/serverdiscovery.module.css"
import ServerCard from './ServerCard';
interface ServerDiscoveryProps {
    discoverable? : Server[];
}

const ServerDiscovery: React.FC<ServerDiscoveryProps> = ({ discoverable }) => {
    return (
        <div className={discoveryClasses.server_discovery_container}>
            <h1>Server Discovery</h1>
            <h2>Discoverable Servers:</h2>
            <ul>
                {discoverable && discoverable.map((server, index) => (
                    <ServerCard key={index} server={server}/>
                ))}
            </ul>
            
        </div>
    );
};

export default ServerDiscovery;