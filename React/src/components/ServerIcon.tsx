import React from "react";
import { Server, Channel } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";

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
          <img className={classes.squircle} src={server.icon?server.icon:"/logo_main.jpg"} alt="" />
          <span className={classes.tooltip}>{server.name}</span>
        </div>

      </li>
      <li className={classes.divider}></li>
    </>
  );
};

export default ServerIcon;
