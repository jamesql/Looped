import React, { useEffect, useState } from 'react';
import { Server } from '../../../Types/serverTypes';
import discoveryClasses from "../styles/serverdiscovery.module.css";
import ServerCard from './ServerCard';
import ApiClient from '@/util/api';
import Cookies from "js-cookie";

const ServerDiscovery: React.FC = () => {
    const [discoverable, setDiscoverable] = useState<Server[]>([]);

    useEffect(() => {
        const fetchDiscoveryServers = async () => {
            try {
                const response = await ApiClient.getInstance().getDiscoveryServers(Cookies.get("access_token") || "");
                setDiscoverable(response.data);
            } catch (error) {
                console.error("Error fetching discovery servers:", error);
            }
        };

        fetchDiscoveryServers();
    }, []);

    return (
        <div className={discoveryClasses.server_discovery_container}>
            <h1>Server Discovery</h1>
            <div className={discoveryClasses.server_discovery_grid}>
                {discoverable.map((server, index) => (
                    <ServerCard key={index} server={server} />
                ))}
            </div>
        </div>
    );
};

export default ServerDiscovery;