import React, { useEffect, useRef, useState } from "react";
import LoopedSession from "../../../Types/sessionTypes";
import { Channel, Server, Role } from "../../../Types/serverTypes";
import { User } from "../../../Types/userTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";
import ServerInfo from "@/components/ServerInfo";
import FriendsList from "@/components/FriendsList";
import { Permissions } from "../../../Types/permissionsTypes";
import ServerIcon from "@/components/ServerIcon";
import { checkPermissions } from "@/util/functions";
import UserCard from "@/components/UserCard";
import ServerDiscovery from "@/components/ServerDiscovery";
import DirectChannel from "@/components/DirectChannel";
import ServerChannel from "@/components/ServerChannel";
import { OpCodeHandler, WebSocketClient } from "@/util/ws";
import WebSocketComponent from "@/components/WebSocket";
import { OPCodes } from "../../../Types/socketTypes";
import ApiClient from "@/util/api";
import CreateChannelModal from "@/components/CreateChannelModal";
import CreareServerModal from "@/components/CreateServerModal";
import FriendsModal from "@/components/FriendsModal";
import JoinServerModal from "@/components/JoinServerModal";
import ServerSettingsModal from "@/components/ServerSettingsModal";
import UserSettingsModal from "@/components/UserSettingsModal";

const Application: React.FC = () => {
  // data states
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<LoopedSession | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  // modal states
  const [serverSettings, setServerSettings] = useState(false);
  const [createChannel, setCreateChannel] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [joiningServer, setJoiningServer] = useState(false);
  const [userSettings, setUserSettings] = useState(false);

  // create the map of listeners
  const listeners = new Map<number, OpCodeHandler[]>();

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

  useEffect(() => {
    // change back
    if (authed && session) {
      setLoading(false);
    }
  }, [authed, session]);

  /** WebSocket Handlers  */
  const helloHandler: OpCodeHandler = async (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Received data:", data);
    const token = Cookies.get("access_token");

    if (!token) {
      console.log("No access token found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    await ApiClient.getInstance()
      .getUserData(token)
      .catch((error) => {
        console.log(error);
      })
      .then((response) => {
        if (!response) {
          location.href = "/login";
          return;
        }
        const _s: LoopedSession = response.data as LoopedSession;
        if (response.status === 200) {
          setSession(_s);
        } else {
          location.href = "/login";
          return;
        }

        client.send({
          op: OPCodes.AUTH,
          d: {
            access_token: Cookies.get("access_token"),
          },
        });
      });
  };

  const readyHandler: OpCodeHandler = async (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Ready data:", data);
  };

  const createServerHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Create server data:", data);

    const newServer: Server = data.server;
    // add server to session
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          servers: [...prevSession.servers!, newServer],
        };
      }
      return prevSession;
    });
    setSelectedServer(newServer);
    setSelectedChannel(null);
  };

  const createChannelHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Create channel data:", data);

    const newChannel: Channel = data.channel;
    const server: Server = data.server;

    // add channel in session to server
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === server.id) {
            if (!s.channels) {
              return s;
            }
            return {
              ...s,
              channels: [...s.channels, newChannel],
            };
          }
          return s;
        });

        return {
          ...prevSession,
          servers: updatedServers,
        };
      }
      return prevSession;
    });

    // if server is selected, update the selected server's channels
    setSelectedServer((prev: Server | null) => {
      if (!prev || prev.id !== server.id) {
        return null;
      }
      const updatedChannels: Channel[] = [
        ...(prev?.channels || []),
        newChannel,
      ];
      return {
        ...prev,
        channels: updatedChannels,
      };
    });
  };

  const createMessageHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Create message data:", data);

    const newMessage = data.message;
    const server = data.server;
    const channel = data.channel;
    // add message to session
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === server.id) {
            if (!s.channels) {
              return s;
            }
            const updatedChannels = s.channels.map((c) => {
              if (c.id === channel.id) {
                return {
                  ...c,
                  messages: [...(c.messages ? c.messages : []), newMessage],
                };
              }
              return c;
            });

            return {
              ...s,
              channels: updatedChannels,
            };
          }
          return s;
        });

        return {
          ...prevSession,
          servers: updatedServers,
        };
      }
      return prevSession;
    });

    // if server is selected, update the selected channel's messages
    setSelectedChannel((prev: Channel | null) => {
      if (!prev || prev.id !== channel.id) {
        return null;
      }
      const updatedMessages = [...(prev?.messages || []), newMessage];
      return {
        ...prev,
        messages: updatedMessages,
      };
    });
  };

  const editServerHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Edit server data:", data);

    const updatedServer: Server = data.server;
    // update server in session
    // updated server will only contain the updated fields
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === updatedServer.id) {
            return {
              ...s,
              ...updatedServer,
            };
          }
          return s;
        });

        return {
          ...prevSession,
          servers: updatedServers,
        };
      }
      return prevSession;
    });

    // if server is selected, update the selected server
    setSelectedServer((prev: Server | null) => {
      if (!prev || prev.id !== updatedServer.id) {
        return null;
      }
      return {
        ...prev,
        ...updatedServer,
      };
    });
  };

  const editChannelHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Edit channel data:", data);

    const updatedChannel: Channel = data.channel;
    const server: Server = data.server;
    // update channel in session

    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === server.id) {
            if (!s.channels) return s;
            const updatedChannels = s.channels.map((c) => {
              if (c.id === updatedChannel.id) {
                return {
                  ...c,
                  ...updatedChannel,
                };
              }
              return c;
            });

            return {
              ...s,
              channels: updatedChannels,
            };
          }
          return s;
        });

        return {
          ...prevSession,
          servers: updatedServers,
        };
      }
      return prevSession;
    });

    // if server is selected, update the selected channel
    setSelectedChannel((prev: Channel | null) => {
      if (!prev || prev.id !== updatedChannel.id) {
        return null;
      }
      return {
        ...prev,
        ...updatedChannel,
      };
    });
  };

  const editMessageHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Edit message data:", data);
  };

  const deleteServerHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Delete server data:", data);
  };

  const deleteChannelHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Delete channel data:", data);
  };

  const deleteMessageHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Delete message data:", data);
  };

  const serverMemberAddHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Server member add data:", data);
  };

  const serverMemberUpdateHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Server member update data:", data);
  };

  const serverMemberDelHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {
    console.log("Server member delete data:", data);
  };

  const roleCreateHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {};
  /** End Websocket Handlers  */

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

      {userSettings && (
        <UserSettingsModal
          isOpen={true}
          setClose={setUserSettings}
          user={session as User}
        />
      )}

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className={classes.container}>
            <div className={classes.server_info}>
              {!selectedServer ? (
                <div className={classes.server_card}>
                  <div className={classes.server_card_info}>
                    <h1>Direct Messages</h1>
                  </div>
                </div>
              ) : (
                <div className={classes.server_card}>
                  <ServerInfo selectedServer={selectedServer} />

                  {session?.id === selectedServer?.ownerId && (
                    <button
                      className={classes.settings_icon}
                      onClick={() => setServerSettings(true)}
                    >
                      <img src="/settings.svg" alt="Settings" />
                    </button>
                  )}
                </div>
              )}

              {!selectedServer ? (
                <FriendsList friends={[]} />
              ) : (
                <div className={classes.channel_list}>
                  {(selectedServer.ownerId === session?.id ||
                    checkPermissions(
                      selectedServer,
                      session!.id,
                      session!.roles!,
                      Permissions.ADMIN
                    )) && (
                    <div
                      className={[classes.channel, classes.channel_create].join(
                        " "
                      )}
                      onClick={() => setCreateChannel(true)}
                    >
                      +
                    </div>
                  )}

                  {selectedServer?.channels
                    ? selectedServer.channels.map((channel) => (
                        <div
                          className={[
                            classes.channel,
                            selectedChannel?.id === channel.id
                              ? classes.channel_active
                              : "",
                          ].join(" ")}
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <h2 className={classes.channel_name}>
                            # {channel.name.toLowerCase().split(" ").join("-")}
                          </h2>
                        </div>
                      ))
                    : ""}
                </div>
              )}
            </div>

            <div className={classes.application}>
              <div className={classes.server_nav}>
                <ul className={classes.server_container}>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => {
                      setSelectedServer(null);
                      setSelectedChannel(null);
                      setSelectedFriend(null);
                    }}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Home</h4>
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

                  {session?.servers?.map((s) => (
                    <ServerIcon
                      server={s}
                      setSelectedServer={setSelectedServer}
                      setSelectedChannel={setSelectedChannel}
                      selectedServer={selectedServer}
                      selectedChannel={selectedChannel}
                    />
                  ))}
                </ul>
              </div>

              {/** Server Discovery  */}
              {!selectedServer && !selectedFriend && <ServerDiscovery />}

              {/** Friend DM Channel  */}
              {!selectedServer && selectedFriend && <DirectChannel />}

              {/** Server Channel */}
              {selectedServer && selectedChannel && (
                <ServerChannel
                  selectedServer={selectedServer}
                  selectedChannel={selectedChannel}
                />
              )}
            </div>

            <div className={classes.members_profile}>
              <ul className={classes.members_list}>
                {selectedServer?.members
                  ? selectedServer?.members.map((member) => (
                      <UserCard
                        user={member}
                        is_admin={session?.id === selectedServer?.ownerId}
                      /> // TODO: improve perm checking here.
                    ))
                  : ""}
              </ul>

              <div className={classes.profile_card}>
                <div className={classes.profile_member}>
                  <div className={classes.member_image}>
                    <img
                      className={classes.squircle}
                      src={session?.avatar ? session.avatar : "/logo_main.jpg"}
                      alt=""
                    />
                  </div>
                  <div className={classes.member_info}>
                    <h3>
                      {session?.firstName} {session?.lastName}
                    </h3>
                    <h4>{session?.status}</h4>
                  </div>
                </div>
                <button
                  className={classes.settings_icon}
                  onClick={() => setUserSettings(true)}
                >
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
