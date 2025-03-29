import React, { useEffect, useState } from "react";
import { Server, Channel } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";
import {getCdnFileUrl} from "../util/functions";
interface ServerIconProps {
  server: Server;
  setSelectedServer: (server: Server | null) => void;
  setSelectedChannel: (channel: Channel | null) => void;
  selectedServer: Server | null;
  selectedChannel: Channel | null;
  handleDockMouseEnter: (e: React.MouseEvent<HTMLDivElement>, str: string) => void;
  handleMouseLeave: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  setSelectedServer,
  setSelectedChannel,
  selectedServer,
  handleDockMouseEnter,
  handleMouseLeave
}) => {
  const [serverIconUrl, setServerIconUrl] = useState<string>("");
  useEffect(() => { 
    if (server.icon) {
      getCdnFileUrl(server.icon).then(url => {
        setServerIconUrl(url);
      });
    } else {
      setServerIconUrl("/logo_main.jpg");
    }
  }
  , [server.icon]);
  return (
    <>
        <div
                              key={server.id}
                              className={classes.dock_icon}
                              onMouseEnter={(e) => handleDockMouseEnter(e, server.name)}
                              onMouseLeave={handleMouseLeave}
                              onClick={() => {
                                setSelectedServer(server);
                                setSelectedChannel(server.channels && server.channels.length > 0 ? server.channels[0] : null); // Set the first channel as selected if available
          }}
        />
    </>
  );
};

export default ServerIcon;
