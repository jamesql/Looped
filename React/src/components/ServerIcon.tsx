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
        className={[classes.squircle].join(" ")}
        onClick={() => {
          setSelectedServer(server);
          setSelectedChannel(null);
        }}
      >
        <div className={[classes.server_icon].join(" ")}>
          <img className={classes.squircle} src={server.icon?server.icon:"/logo_main.jpg"} alt="" />
          <span className={classes.tooltip}>{server.name}</span>
        </div>

      </li>
      <li className={classes.divider}></li>
    </>
  );
};

export default ServerIcon;
