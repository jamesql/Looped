import React, { ReactNode, useContext } from "react";
import { AppContext, Context } from "../_context";
import styles from "../../../styles/channelBox.module.css"
import { ServerTitle } from "./_serverTitle";

// change any to real type todo:
interface channelBoxProps {
    selectedServerData: any,
    children?: React.ReactNode
}

export const ChannelBox: React.FC<channelBoxProps> = (props: channelBoxProps) => {

    return (
        <div className={styles.channelBox}>
            <ServerTitle selectedServerData={props.selectedServerData} />
        </div> 
    );
}