
// change any to real type todo:
interface ChatBoxProps {
    selectedServerData: any
    selectedServer: string,
    selectedChannelData: any,
    selectedChannel: string
}

export const ChatBox: React.FC<ChatBoxProps> = (props: ChatBoxProps) => {
    return (<h1>{props.selectedChannel}</h1>);
}