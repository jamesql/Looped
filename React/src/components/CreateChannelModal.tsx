import React from 'react';
import classes from "../styles/createservermodal.module.css"
import ApiClient from '@/util/api';
import Cookie from 'js-cookie';
import { Server } from '../../../Types/serverTypes';

interface CreateChannelModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server;
}

const CreareChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen,  setClose, server}) => {
    const [name, setServerName] = React.useState('');
    const [desc, setDescription] = React.useState('');
    const [type, setType] = React.useState('');

    const handleCreate = async (e: any) => {

        await ApiClient.getInstance().createChannel(
            server.id,
            name,
            desc,
            Cookie.get("access_token") || "",
        ).then((response) => {
            console.log(response);
        }
        );

        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Create Channel</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Enter Channel Name"
                />
                <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Channel Description"
                />
                <button onClick={(e) => handleCreate(e)}>Create</button>
            </div>
        </div>
    );
};

export default CreareChannelModal;