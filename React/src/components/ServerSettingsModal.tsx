import React from 'react';
import classes from "../styles/friendsmodal.module.css"
import { Server } from '../../../Types/serverTypes';

interface ServerSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen,  setClose, server}) => {
    const [serverId, setServerId] = React.useState('');

    const handleJoin = (e: any) => {
        console.log(serverId);
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Friends Modal</h2>
                <button onClick={(e) => handleJoin(e)}>Button</button>
            </div>
        </div>
    );
};

export default ServerSettingsModal;