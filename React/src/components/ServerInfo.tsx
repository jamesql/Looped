import React from 'react';
import classes from "../styles/application.module.css";
import { Server } from '../../../Types/serverTypes';

interface ServerInfoProps {
    selectedServer: Server | null;
}

const ServerInfo: React.FC<ServerInfoProps> = ({selectedServer}) => {
    return (
        <div className={classes.server_card_info}>
        <h1>{selectedServer?selectedServer.name:"No Server Selected"}</h1>
        <a href="https://meta.com">https://meta.com</a>
      </div>
    );
};

export default ServerInfo;