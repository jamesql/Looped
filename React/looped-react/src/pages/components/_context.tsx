import React, { createContext, useState, ReactNode } from 'react';

// AppContextComponent - Provides global context throughout the application and prevents 
// callback drilling

// todo: change any
interface Context {
    serverData: any,
    setServerData: React.Dispatch<any>,
    selectedServer: string,
    setSelectedServer: React.Dispatch<string>,
    selectedServerData: any,
    setSelectedServerData: React.Dispatch<any>,
    selectedChannel: string,
    setSelectedChannel: React.Dispatch<string>,
    selectedChannelData: any
    setSelectedChannelData: React.Dispatch<any>,


};

const AppContext = createContext<Context>(null);

interface ContextComponentProps {
    children?: React.ReactNode
};

const AppContextComponent: React.FC<ContextComponentProps> = (props: ContextComponentProps) => {
    const [serverData, setServerData] = useState(null);
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedServerData, setSelectedServerData] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [selectedChannelData, setSelectedChannelData] = useState(null);


    let ContextObject: Context = {
        serverData: serverData,
        setServerData: setServerData,
        selectedServerData: selectedServerData,
        setSelectedServerData: setSelectedServerData,
        selectedServer: selectedServer,
        setSelectedServer: setSelectedServer,
        selectedChannel: selectedChannel,
        setSelectedChannel: setSelectedChannel,
        selectedChannelData: selectedChannelData,
        setSelectedChannelData: setSelectedChannelData
    };

    return (
       <AppContext.Provider value={ContextObject}>
        {props.children}
       </AppContext.Provider>
    )

};

export { AppContext, AppContextComponent };
export type { Context };
