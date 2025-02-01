import { useContext } from "react";
import { AppContext, Context } from "../_context";
import { ServerSelector } from "./_serverSelector"
import { ChatBox } from "./_chatbox";
import styles from "../../../styles/channelBox.module.css"

interface ServerBoxProps {

}

export const ServerBox: React.FC<ServerBoxProps> = (props: ServerBoxProps) => {
    const states: Context = useContext(AppContext);

    const setActiveServer = (id: string) => {
        let server = states.serverData.find((s) => s.id === id);
        states.setSelectedServer(id);
        states.setSelectedServerData(server);
    };

    return (
        <div className={styles.serverBox}>
            <ServerSelector
            serverData={states.serverData} 
            selectedServerData={states.selectedServerData} 
            selectedServer={states.selectedServer} 
            setActiveServer={setActiveServer}  />

            <ChatBox 
            selectedServerData={states.selectedServerData}
            selectedServer={states.selectedServer}
            selectedChannelData={states.selectedChannelData}
            selectedChannel={states.selectedChannel}
            />

        </div>
    )
}   