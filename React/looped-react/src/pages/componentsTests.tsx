import React, { useContext, useEffect, useRef, useState } from "react";
import {ChannelBox} from "./components/looped-gui/_channelBox"
import { AppContext, AppContextComponent, Context } from "./components/_context";



const selectedServerData = {
    id: "TEST-ID",
    createdAt: "",
    updatedAt: "",
    name: "Meta Recruitment",
    descripton: null,
    ownerId: "Owner ID",
    Channel: [
        {
            id: "Test Channel Id",
            name: "test-channel",
            type: "TEXT",
            serverid: "TEST-ID",
            createdAt: "",
            updatedAt: ""
        }
    ],
    Role: [],
    members: [{
        id: "Test Id",
        userId: "Test User Id",
        serverId: "TEST-ID",
        user: {
            firstName: "James",
            lastName: "Ash",
            username: "jamesash01"
        }

    }]

}

export default function ComponentTest() {
    const states: Context = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        states.setSelectedServerData(selectedServerData);

        setLoading(false);
    }, []);

    if (loading) return (<></>);

  return (
  <ChannelBox selectedServerData={selectedServerData} />
  );
}
