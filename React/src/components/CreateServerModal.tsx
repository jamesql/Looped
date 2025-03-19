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

    const handleJoin = async (e: any) => {

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
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Enter Server Name"
                />
                <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Server Description"
                />
                <button onClick={(e) => handleJoin(e)}>Create</button>
            </div>
        </div>
    );
};

export default CreareServerModal;