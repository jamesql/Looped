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

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen,  setClose, server}) => {
    const [name, setServerName] = React.useState('');
    const [desc, setDescription] = React.useState('');

    const handleCreate = async () => {

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
                <label>
                    Enter Channel name:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Enter Channel Name"
                />
                </label>
                <label>
                    Enter Channel Description
                <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Channel Description"
                />
                </label>
                <span className={classes.button} onClick={() => handleCreate()}>Create</span>
            </div>
        </div>
    );
};

export default CreateChannelModal;