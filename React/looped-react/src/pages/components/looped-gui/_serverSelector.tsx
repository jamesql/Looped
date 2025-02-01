import styles from "../../../styles/channelBox.module.css"
import { ServerIcon } from "./_serverIcon";

// change any to real type todo:
interface serverSelectorProps {
    serverData: any,
    selectedServerData: any,
    selectedServer: string,
    setActiveServer: (id: string) => void
}

export const ServerSelector: React.FC<serverSelectorProps> = (props: serverSelectorProps) => {
    return (
        <div className={styles.serverSelectorContainer}>
        <div className={styles.serverSelector}>
            {props.serverData.map((s) => 
                <ServerIcon 
                id={s.id} 
                name={s.name} 
                icon={s.icon} 
                active={s.id===props.selectedServer} 
                setActiveServer={props.setActiveServer}               
                />
            )}
        </div>
        </div>
    );
}