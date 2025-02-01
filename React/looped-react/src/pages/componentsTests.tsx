import React, { useContext, useEffect, useRef, useState } from "react";
import { ChannelBox } from "./components/looped-gui/_channelBox";
import {
  AppContext,
  AppContextComponent,
  Context,
} from "./components/_context";
import styles from "../styles/channelBox.module.css"
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});


const selectedServerData = {
  id: "TEST-ID",
  createdAt: "",
  updatedAt: "",
  name: "Meta Recruitment",
  descripton: null,
  ownerId: "Owner ID",
  Channel: [
    {
      id: "Test Channel Id 1",
      name: "test-channel-1",
      type: "TEXT",
      serverid: "TEST-ID",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "Test Channel Id 2",
      name: "test-channel-2",
      type: "TEXT",
      serverid: "TEST-ID",
      createdAt: "",
      updatedAt: "",
    },
  ],
  Role: [],
  members: [
    {
      id: "Test Id",
      userId: "Test User Id",
      serverId: "TEST-ID",
      user: {
        firstName: "James",
        lastName: "Ash",
        username: "jamesash01",
      },
    },
  ],
};

export default function ComponentTest() {
  const states: Context = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    states.setSelectedServer(selectedServerData.id);
    states.setSelectedServerData(selectedServerData);
    states.setSelectedChannel(selectedServerData.Channel[0].id);
    states.setSelectedChannelData(selectedServerData.Channel[0]);

    console.log(selectedServerData.Channel[0]);

    setLoading(false);
  }, []);

  const setActiveChannel = (id: string) => {
    states.setSelectedChannel(id);
    const channelData = states.selectedServerData.Channel.find(c => c.id === id);
    states.setSelectedChannelData(channelData);
    console.log(id);
};  

  if (loading) return <></>;

  return (
    <div className={notoSans.className}>
    <ChannelBox
      selectedServer={states.selectedServer}
      selectedServerData={states.selectedServerData}
      selectedChannel={states.selectedChannel}
      selectedChannelData={states.selectedChannelData}
      setActiveChannel={setActiveChannel}
    />
\    </div>
  );
}
