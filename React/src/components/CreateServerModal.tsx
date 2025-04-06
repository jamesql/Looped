import React from 'react';
import classes from "../styles/createservermodal.module.css"
import ApiClient from '@/util/api';
import Cookie from 'js-cookie';

interface CreateServerModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
}

const CreareServerModal: React.FC<CreateServerModalProps> = ({ isOpen,  setClose}) => {
    const [name, setServerName] = React.useState('');
    const [desc, setDescription] = React.useState('');

    const handleJoin = async () => {

        await ApiClient.getInstance().createServer(
            name, 
            desc,
            Cookie.get("access_token") || ""
        ).then((response) => {
            console.log(response);
        });

        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Create Server</h2>
                <label>
                    Add Server Name:  
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Enter Server Name"
                />
                </label>
                <label>
                    Add Server Description:
                <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Server Description"
                />
                </label>
                < span className={classes.button}onClick={() => handleJoin()}>Create</ span>
            </div>
        </div>
    );
};

export default CreareServerModal;