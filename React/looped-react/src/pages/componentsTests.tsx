import React, { useContext, useEffect, useRef, useState } from "react";
import { ChannelBox } from "./components/looped-gui/_channelBox";
import {
  AppContext,
  AppContextComponent,
  Context,
} from "./components/_context";
import styles from "../styles/channelBox.module.css"
import { Noto_Sans } from "next/font/google";
import { ServerBox } from "./components/looped-gui/_serverBox";

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
  icon: "/meta_logo.png",
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

const server2 = {
    id: "tiktok",
    createdAt: "",
    updatedAt: "",
    name: "TikTok Recruitment",
    descripton: null,
    ownerId: "Owner ID",
    icon: "/logo3.png",
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

  const server3 = {
    id: "x",
    createdAt: "",
    updatedAt: "",
    name: "X Recruitment",
    descripton: null,
    ownerId: "Owner ID",
    icon: "/logo4.png",
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

  const server4 = {
    id: "insta",
    createdAt: "",
    updatedAt: "",
    name: "Instagram Recruitment",
    descripton: null,
    ownerId: "Owner ID",
    icon: "/logo2.png",
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

  const server5 = {
    id: "random server",
    createdAt: "",
    updatedAt: "",
    name: "Hangout Server",
    descripton: null,
    ownerId: "Owner ID",
    icon: "/logo1.png",
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

const serverData = [selectedServerData, server2, server3, server4, server5, server5, server5, server5, server5, server5, server5];

export default function ComponentTest() {
  const states: Context = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    states.setSelectedServer(selectedServerData.id);
    states.setSelectedServerData(selectedServerData);
    states.setSelectedChannel(selectedServerData.Channel[0].id);
    states.setSelectedChannelData(selectedServerData.Channel[0]);

    states.setServerData(serverData);

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
    <div className={[notoSans.className, styles.application].join(' ')}>
    <ChannelBox
      selectedServer={states.selectedServer}
      selectedServerData={states.selectedServerData}
      selectedChannel={states.selectedChannel}
      selectedChannelData={states.selectedChannelData}
      setActiveChannel={setActiveChannel}
    />
    <ServerBox />
    </div>
  );
}
