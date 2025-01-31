import styles from "../../../styles/channelBox.module.css"

// change any to real type todo:
interface serverTitleProps {
    selectedServerData: any,
    children?: React.ReactNode
}

export const ServerTitle: React.FC<serverTitleProps> = (props: serverTitleProps) => {
    return (
       <div className={styles.serverInfoBox}>
            <div className={styles.serverInfoTitleAndSite}>
                <h3>{props.selectedServerData.name}</h3>
                <a href="test">https://meta.com</a>
            </div>
            <div className={styles.serverSettings}>
                <button onClick={() => console.log("Server Settings Click.")}>
                <img src="/settings.png" />
                </button>
            </div>
       </div>
    );
}