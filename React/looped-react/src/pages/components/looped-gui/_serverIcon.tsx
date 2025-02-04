import styles from "../../../styles/channelBox.module.css"

// change any to real type todo:
interface serverIconProps {
    id: string,
    name: string,
    icon: string | null,
    active: boolean,
    icon?: string,
    setActiveServer: (id: string) => void
}

export const ServerIcon:React.FC<serverIconProps> = (props: serverIconProps) => {
    return (
        <div className={props.active?styles.serverIconActive:styles.serverIcon}>
            <button onClick={() => props.setActiveServer(props.id)}>
                <img src={props.icon?props.icon:"/meta_logo.png"} alt="" />
            </button>
        </div>
    );
}