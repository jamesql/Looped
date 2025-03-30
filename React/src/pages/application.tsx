import React, { useEffect, useState } from "react";
import LoopedSession from "../../../Types/sessionTypes";
import { Channel, Server } from "../../../Types/serverTypes";
import { User } from "../../../Types/userTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";
import ServerInfo from "@/components/ServerInfo";
import FriendsList from "@/components/FriendsList";
import { Permissions } from "../../../Types/permissionsTypes";
import ServerIcon from "@/components/ServerIcon";
import { checkPermissions, getCdnFileUrl } from "@/util/functions";
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
import JoinServerModal from "@/components/JoinServerModal";
import ServerSettingsModal from "@/components/ServerSettingsModal";
import UserSettingsModal from "@/components/UserSettingsModal";
import { MdAdd, MdGroupAdd, MdHome, MdMessage, MdPersonAdd } from "react-icons/md";
import { createPortal } from "react-dom";
import FriendRequestsList from "@/components/FriendRequestsList";
import RequestsIconNumbered from "@/components/RequestsIconNumbered";

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
  const [friendRequestPanelActive, setFriendRequestPanelActive] = useState(false);

  const [hoveredIconCaption, setHoveredIconCaption] = useState<string | null>(null);
  const [tooltipX, setTooltipX] = useState(0)
  const [tooltipY, setTooltipY] = useState(0)

  const isHome = selectedServer === null && selectedChannel === null && selectedFriend === null;

  const handleDockMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    str: string
  ) => {

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipX(rect.left + rect.width / 2);
    setTooltipY(rect.bottom); // bottom of icon
    setHoveredIconCaption(str);
  }

  const handleMouseLeave = () => {
    setHoveredIconCaption(null);
  }



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
        return prev;
      }
      const updatedMessages = [...(prev?.messages || []), newMessage];
      return {
        ...prev,
        messages: updatedMessages,
      };
    });

    setSelectedServer((prev: Server | null) => {
      // if the server is not selected, return prev
      if (!prev || prev.id !== server.id) {
        return prev;
      }
      // otherwise return the updated server with the new message
      const updatedChannels = prev.channels?.map((c) => {
        if (c.id === channel.id) {
          return {
            ...c,
            messages: [...(c.messages || []), newMessage],
          };
        }
        return c;
      });

      return {
        ...prev,
        channels: updatedChannels,
      };
    }
    ); // Update the selected server to reflect the new message
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

  const [selfAvatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
  useEffect(() => { 
    if (session?.avatar) {
      getCdnFileUrl(session?.avatar).then(url => {
        setAvatarUrl(url);
      });
    } else {
      setAvatarUrl("/logo_main.jpg");
    }
  }
  , [session?.avatar]);
  
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
                    <h1>Direct Messages</h1>
                    <button className={classes.chat_bar_button} onClick={() => {
                      setSelectedFriend(null)
                      setFriendRequestPanelActive(true);
                    }}>
                      <RequestsIconNumbered inviteCount={session?.friendRequestsReceived?.length}/>
                    </button>
                </div>
              ) : (
                <div className={classes.server_card}>
                  <ServerInfo selectedServer={selectedServer} />

                  {checkPermissions(selectedServer, session!.id, session!.roles!, Permissions.ADMIN) && (
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
                <FriendsList friends={session?.friends ? session?.friends : []} clickFunc={(u) => {
                  setSelectedFriend(u);
                  setSelectedServer(null);
                  setSelectedChannel(null);
                  setFriendRequestPanelActive(false);
                }} activeUser={selectedFriend}/>
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
                      <MdAdd/>
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
              <div className={classes.server_dock}>
                <div className={classes.dock_container}>
                    <div className={classes.dock_icon_wrapper}>
                      {isHome && <div className={classes.selected_indicator}></div>}
                      <div
                        className={[
                          classes.dock_icon,
                          isHome ? classes.dock_icon_active : "",
                        ].join(" ")}
                        onMouseEnter={(e) => handleDockMouseEnter(e, "Home")}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                          setSelectedServer(null);
                          setSelectedChannel(null);
                          setSelectedFriend(null);
                          setFriendRequestPanelActive(false);
                        }}
                      >
                        <MdHome/>
                      </div>
                    </div>
                    <div
                          className={classes.dock_icon}
                          onMouseEnter={(e) => handleDockMouseEnter(e, "Create Server")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => setCreatingServer(true)}
                        >
                          <MdAdd/>
                    </div>
                    <div
                          className={classes.dock_icon}
                          onMouseEnter={(e) => handleDockMouseEnter(e, "Join Server")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => setJoiningServer(true)}

                        >
                          <MdGroupAdd/>
                    </div>

                    {session?.servers?.map((server) => (
                        <ServerIcon 
                          server={server}
                          setSelectedServer={setSelectedServer}
                          setSelectedChannel={setSelectedChannel}
                          selectedServer={selectedServer}
                          handleMouseLeave={handleMouseLeave}
                          handleDockMouseEnter={handleDockMouseEnter}
                          selectedChannel={selectedChannel}
                        />
                    ))}
                </div>
              </div>

              {hoveredIconCaption !== null &&
                createPortal(
                  <div
                    className={classes.floating_tooltip}
                    style={{
                      position: "fixed",
                      top: tooltipY + 8, // space below icon
                      left: tooltipX,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {hoveredIconCaption}
                    </div>,
                    document.getElementById("dock-tooltip-root")!
                  )}

              {/** Server Discovery  */}
              {!selectedServer && !selectedFriend && !friendRequestPanelActive && <ServerDiscovery />}

              {/** Friend DM Channel  */}
              {!selectedServer && selectedFriend && <DirectChannel friend={selectedFriend} />}

              {/** Friend Invites  */}
              {!selectedServer && friendRequestPanelActive &&  <FriendRequestsList friends={session?.friendRequestsReceived} />}

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
                        is_self={session?.id === member.id} // Check if the user is the same as the session user
                        is_friend={session?.friends?session?.friends?.some(u => u.id === member.id):false}
                        incoming_request={session?.friendRequestsReceived?session?.friendRequestsReceived.some((request) => request.id === member.id) : false} // Check if the user has sent a friend request to this member
                        outgoing_request={session?.friendRequestsSent?session?.friendRequestsSent.some((request) => request.id === member.id) : false} // Check if this member has sent a friend request to the user
                      />
                    ))
                  : ""}
              </ul>

              <div className={classes.profile_card}>
                <div className={classes.profile_member}>
                  <div className={classes.member_image}>
                    <img
                      className={classes.squircle}
                      src={selfAvatarUrl}
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
