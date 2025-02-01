import React, { ReactNode, useContext, useEffect } from "react";
import styles from "../../../styles/channelBox.module.css"
import { ServerTitle } from "./_serverTitle";
import { Channel } from "./_channel";

// change any to real type todo:
interface channelBoxProps {
    selectedServer: string,
    selectedServerData: any,
    selectedChannel: string,
    selectedChannelData: any,
    setActiveChannel: (id: string) => void,
    children?: React.ReactNode
}

export const ChannelBox: React.FC<channelBoxProps> = (props: channelBoxProps) => {

    return (
        <div className={styles.channelBox}>
            <ServerTitle selectedServerData={props.selectedServerData} />
            <div className={styles.channelList}>
                {props.selectedServerData.Channel.map((c) => 
                    <Channel key={c.id} channel={c} active={c.id === props.selectedChannel} setActiveChannel={props.setActiveChannel} />
                )}
            </div>
        </div> 
    );
}