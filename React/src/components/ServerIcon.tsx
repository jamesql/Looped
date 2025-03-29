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
}

const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  setSelectedServer,
  setSelectedChannel,
  selectedServer,
  selectedChannel,
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
      <li
        key={server.id}
        className={[classes.squircle, selectedServer?.id===server.id?classes.server_icon_active:""].join(" ")}
        onClick={() => {
          setSelectedServer(server);
          setSelectedChannel(server.channels && server.channels.length > 0 ? server.channels[0] : null); // Set the first channel as selected if available
        }}
      >
        <div className={classes.server_icon}>
          <img className={classes.squircle} src={serverIconUrl} alt="" />
          <span className={classes.tooltip}>{server.name}</span>
        </div>

      </li>
      <li className={classes.divider}></li>
    </>
  );
};

export default ServerIcon;
