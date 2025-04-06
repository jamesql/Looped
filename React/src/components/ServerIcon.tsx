import React, { useEffect, useState } from "react";
import { Server, Channel } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "../util/functions";
interface ServerIconProps {
  server: Server;
  setSelectedServer: (server: Server | null) => void;
  setSelectedChannel: (channel: Channel | null) => void;
  selectedServer: Server | null;
  selectedChannel: Channel | null;
  handleDockMouseEnter: (
    e: React.MouseEvent<HTMLDivElement>,
    str: string
  ) => void;
  handleMouseLeave: () => void;
  key : string;
}

const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  setSelectedServer,
  setSelectedChannel,
  selectedServer,
  handleDockMouseEnter,
  handleMouseLeave,
}) => {
  const [serverIconUrl, setServerIconUrl] = useState<string>("");
  useEffect(() => {
    if (server.icon) {
      getCdnFileUrl(server.icon).then((url) => {
        setServerIconUrl(url);
      });
    } else {
      setServerIconUrl("/logo_main.jpg");
    }
  }, [server.icon]);

  const isActive = selectedServer && selectedServer.id === server.id;
  return (
    <>
      <div className={classes.dock_icon_wrapper}>
        {isActive && <div className={classes.selected_indicator}></div>}
        <div
          className={[
            classes.dock_icon,
            isActive ? classes.dock_icon_active : "",
          ].join(" ")}
          onMouseEnter={(e) => handleDockMouseEnter(e, server.name)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            setSelectedServer(server);
            setSelectedChannel(
              server.channels && server.channels.length > 0
                ? server.channels[0]
                : null
            );
          }}
        >
          <img
            src={serverIconUrl}
            className={classes.dock_icon_img}
            alt={server.name}
          />
        </div>
      </div>
    </>
  );
};

export default ServerIcon;
