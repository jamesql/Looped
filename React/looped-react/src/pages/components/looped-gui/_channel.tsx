import React, { useEffect, useRef, useState } from "react";
import styles from "../../../styles/channelBox.module.css"

// change any to real type todo:
interface channelProps {
    channel: {
        id: string,
        name: string,
        type: string,
        serverid: string,
        createdAt: string,
        updatedAt: string
    },
    active: boolean,
    setActiveChannel: (id: string) => void,
    children?: React.ReactNode
    
}

export const Channel: React.FC<channelProps> = (props: channelProps) => {

    return (
        <button className={props.active?styles.channelActiveButton:""} onClick={() => props.setActiveChannel(props.channel.id)}> # {props.channel.name}</button>
    );
}

