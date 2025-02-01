import React, { useEffect, useRef, useState } from "react";

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
        <button onClick={() => props.setActiveChannel(props.channel.id)}> #{props.channel.name}</button>
    );
}