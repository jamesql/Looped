import React, { createContext, useState, ReactNode } from 'react';

// AppContextComponent - Provides global context throughout the application and prevents 
// callback drilling

// todo: change any
interface Context {
    selectedServerData: any,
    setSelectedServerData: React.Dispatch<any>
};

const AppContext = createContext<Context>(null);

interface ContextComponentProps {
    children?: React.ReactNode
};

const AppContextComponent: React.FC<ContextComponentProps> = (props: ContextComponentProps) => {
    const [selectedServerData, setSelectedServerData] = useState(null);

    let ContextObject: Context = {
        selectedServerData: selectedServerData,
        setSelectedServerData: setSelectedServerData
    };

    return (
       <AppContext.Provider value={ContextObject}>
        {props.children}
       </AppContext.Provider>
    )

};

export { AppContext, AppContextComponent };
export type { Context };
