import React, { useEffect, useState } from "react";
import WebSocketComponent from "@/components/WebSocket";
import { OpCodeHandler, WebSocketClient } from "@/util/ws";
import { OPCodes } from "../../../Types/socketTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";
import LoopedSession from "../../../Types/sessionTypes";
import { Channel, Server } from "../../../Types/serverTypes";
import JoinServerModal from "@/components/JoinServerModal";
import CreareServerModal from "@/components/CreateServerModal";
import FriendsModal from "@/components/FriendsModal";
import ApiClient from "@/util/api";
import ServerSettingsModal from "@/components/ServerSettingsModal";
import UserCard from "@/components/UserCard";
import MessageComponent from "@/components/MessageComponent";
import CreateChannelModal from "@/components/CreateChannelModal";
import ServerInfo from "@/components/ServerInfo";

const Application: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<LoopedSession | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [joiningServer, setJoiningServer] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [friendsPage, setFriendsPage] = useState(false);
  const [serverSettings, setServerSettings] = useState(false);
  const [createChannel, setCreateChannel] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // create the map of listeners
  const listeners = new Map<number, OpCodeHandler[]>();

  // check if access and refresh token are in cookie
  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (!accessToken || !refreshToken) {
      // redirect to login page
      window.location.href = "/login";
    } else {
      setAuthed(true);
      // here we also want to add some api client logic
      // to validate token and then try and refresh before sending back to login
    }
  }, []);

  // done loading after accessToken, refreshToken and authed is true
  useEffect(() => {
    if (authed && session) {
      setLoading(false);
    }
  }, [authed, session]);

  // Send message function
  const sendMessage = (): void => {
    if (currentMessage.trim() !== "") {
      console.log("Sending message:", currentMessage);
      ApiClient.getInstance()
        .createMessage(
          selectedChannel?.id || "",
          currentMessage,
          Cookies.get("access_token") || ""
        )
        .then((response) => {
          console.log(response);
        });

      setCurrentMessage("");
      // clear input box with class message_input
      (
        document.querySelector("." + classes.message_input) as HTMLInputElement
      ).value = "";
    }
  };

  /* WebSocket Hooks */
  const helloHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Received data:", data);

    if (!Cookies.get("access_token")) {
      console.log("No access token found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    client.send({
      op: OPCodes.AUTH,
      d: {
        access_token: Cookies.get("access_token"),
      },
    });
  };

  const readyHandler: OpCodeHandler = async (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Ready data:", data);
    const token = Cookies.get("access_token");
    if (token) {
      const rawData = await ApiClient.getInstance().getUserData(token);
      const _s: LoopedSession = rawData.data as LoopedSession;
      if (rawData.status === 200) {
        setSession(_s);
      } else {
        location.href = "/login";
      }
    }
  };

  const createServerHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Create server data:", data);

    const newServer: Server = data.server;
    // add server to session
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          servers: [...prevSession.servers, newServer],
        };
      }
      return prevSession;
    });
    setSelectedServer(newServer);  
    setSelectedChannel(null);  
  };

  const createChannelHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Create channel data:", data);
  };

  const createMessageHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Create message data:", data);
  };

  const editServerHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Edit server data:", data);
  };

  const editChannelHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Edit channel data:", data);
  };

  const editMessageHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Edit message data:", data);
  };

  const deleteServerHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Delete server data:", data);
  };

  const deleteChannelHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Delete channel data:", data);
  };

  const deleteMessageHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Delete message data:", data);
  };

  const serverMemberAddHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Server member add data:", data);
  };

  const serverMemberUpdateHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Server member update data:", data);
  };

  const serverMemberDelHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Server member delete data:", data);
  };
  /* WebSocket Hooks */

  // Add hooks to WebSocket listeners
  listeners.set(OPCodes.HELLO, [helloHandler]);
  listeners.set(OPCodes.READY, [readyHandler]);
  listeners.set(OPCodes.SERVER_CREATE, [createServerHandler]);
  listeners.set(OPCodes.CHANNEL_CREATE, [createChannelHandler]);
  listeners.set(OPCodes.MESSAGE_CREATE, [createMessageHandler]);
  listeners.set(OPCodes.SERVER_UPDATED, [editServerHandler]);
  listeners.set(OPCodes.CHANNEL_MODIFY, [editChannelHandler]);
  listeners.set(OPCodes.MESSAGE_UPDATE, [editMessageHandler]);
  listeners.set(OPCodes.SERVER_DELETE, [deleteServerHandler]);
  listeners.set(OPCodes.CHANNEL_DELETE, [deleteChannelHandler]);
  listeners.set(OPCodes.MESSAGE_DELETE, [deleteMessageHandler]);
  listeners.set(OPCodes.SERVER_MEMBER_ADD, [serverMemberAddHandler]);
  listeners.set(OPCodes.SERVER_MEMBER_UPDATE, [serverMemberUpdateHandler]);
  listeners.set(OPCodes.SERVER_MEMBER_DEL, [serverMemberDelHandler]);

  return (
    <div>
      <WebSocketComponent url={"ws://127.0.0.1:444"} listeners={listeners} />

      {joiningServer && (
        <JoinServerModal isOpen={true} setClose={setJoiningServer} />
      )}

      {creatingServer && (
        <CreareServerModal isOpen={true} setClose={setCreatingServer} />
      )}

      {friendsPage && <FriendsModal isOpen={true} setClose={setFriendsPage} />}

      {serverSettings && (
        <ServerSettingsModal
          isOpen={true}
          setClose={setServerSettings}
          server={selectedServer!}
        />
      )}

      {createChannel && (
        <CreateChannelModal
          isOpen={true}
          setClose={setCreateChannel}
          server={selectedServer!}
        />
      )}

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className={classes.container}>
            <div className={classes.server_info}>
              <div className={classes.server_card}>
                <ServerInfo selectedServer={selectedServer} />

                {session?.user.id === selectedServer?.ownerId && (
                  <button
                    className={classes.settings_icon}
                    onClick={() => setServerSettings(true)}
                  >
                    <img src="/settings.svg" alt="Settings" />
                  </button>
                )}
              </div>

              <div className={classes.channel_list}>
                <div className={classes.channels_header}>
                  <h4>Channels: </h4>
                  {session?.user.id === selectedServer?.ownerId && (
                    <button onClick={() => setCreateChannel(true)}>+</button>
                  )}
                </div>

                {selectedServer?.channels.map((channel) => (
                  <div
                    className={[
                      classes.channel,
                      selectedChannel?.id === channel.id
                        ? classes.channel_active
                        : "",
                    ].join(" ")}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <h2 className={classes.channel_name}># {channel.name}</h2>
                  </div>
                ))}
              </div>
            </div>

            <div className={classes.application}>
              <div className={classes.server_nav}>
                <ul className={classes.server_container}>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => setFriendsPage(true)}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Friends</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => setJoiningServer(true)}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Join Server</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => setCreatingServer(true)}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Create Server</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>

                  {session?.servers.map((s) => (
                    <>
                      <li
                        key={s.id}
                        className={[
                          classes.squircle,
                          classes.server_icon,
                          s.id === selectedServer?.id
                            ? classes.server_icon_active
                            : "",
                        ].join(" ")}
                        onClick={() => {
                          setSelectedServer(s);
                          setSelectedChannel(null);
                        }}
                      >
                        <div className={classes.popper}>
                          <h4 className={classes.popped}>{s.name}</h4>
                        </div>
                      </li>
                      <li className={classes.divider}></li>
                    </>
                  ))}
                </ul>
              </div>

              <div className={classes.messages}>
                {[...(selectedChannel?.messages || [])]
                  .reverse()
                  .map((message) => (
                    <MessageComponent message={message} />
                  ))}
              </div>

              <div className={classes.chat_input}>
                <button className={classes.attach_button}>
                  <img src="/paperclip.svg" alt="Add File" />
                </button>
                <input
                  className={classes.message_input}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  type="text"
                  placeholder="Type a message..."
                />
                <button
                  className={classes.send_button}
                  onClick={() => sendMessage()}
                >
                  <img src="/send.svg" alt="Send Message" />
                </button>
              </div>
            </div>

            <div className={classes.members_profile}>
              <ul className={classes.members_list}>
                {selectedServer?.members.map((member) => (
                  <UserCard user={member} />
                ))}
              </ul>
              <div className={classes.profile_card}>
                <div className={classes.profile_member}>
                  <div className={classes.member_image}>
                    <img
                      className={classes.squircle}
                      src="https://as1.ftcdn.net/v2/jpg/05/56/29/36/1000_F_556293653_e9P80XtK4yyDd8WU1vRtdqSU1Vym7zoX.jpg"
                      alt=""
                    />
                  </div>
                  <div className={classes.member_info}>
                    <h3>
                      {session?.user.firstName} {session?.user.lastName}
                    </h3>
                    <h4>Software Engineer @ Meta</h4>
                  </div>
                </div>
                <button className={classes.settings_icon}>
                  <img src="/settings.svg" alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;
