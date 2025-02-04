import styles from "../../../styles/channelBox.module.css"

// change any to real type todo:
interface joinServerButton {

}

export const joinServerButton:React.FC<joinServerButton> = (props: joinServerButton) => {
    return (
        <div>
            <button onClick={() => console.log("join server")}>
                <img src="" alt="" />
            </button>
        </div>
    );
}