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
import { MdAdd, MdGroupAdd, MdHome, MdInfoOutline, MdLogout, MdSettings } from "react-icons/md";
import { createPortal } from "react-dom";
import FriendRequestsList from "@/components/FriendRequestsList";
import RequestsIconNumbered from "@/components/RequestsIconNumbered";
import MembersList from "@/components/MembersList";
import UserProfileModal from "@/components/UserProfileModal";
import ServerDiscoveryModal from "@/components/ServerDiscoveryModal";

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
  const [serverInfoModal, setServerInfoModal] = useState(false);

  const [hoveredIconCaption, setHoveredIconCaption] = useState<string | null>(null);
  const [tooltipX, setTooltipX] = useState(0)
  const [tooltipY, setTooltipY] = useState(0)

  const isHome = selectedServer === null && selectedChannel === null && selectedFriend === null;

  const [cardVisible, setCardVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardUser, setCardUser] = useState<User | null>(null);
  const handleProfileCard = (e: React.MouseEvent, u: User) => {
    e.stopPropagation(); // Stop the event from bubbling up to the document
    e.preventDefault(); // Prevent the default click

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 250; // Approximate width of the dropdown
    const dropdownHeight = 500; // Approximate height of the dropdown

    let x = e.pageX;
    let y = e.pageY;

    if (x + dropdownWidth > viewportWidth) {
      x = viewportWidth - dropdownWidth - 10; // Add some padding
    }
    if (y + dropdownHeight > viewportHeight) {
      y = viewportHeight - dropdownHeight - 10; // Add some padding
    }
    setCardPosition({ x, y });
    setCardUser(u);
    setCardVisible(true);
  };

  const handleClickOutsideCard = () => {
    setCardVisible(false);
  };

  useEffect(() => {
    if (cardVisible) {
      document.addEventListener("click", handleClickOutsideCard);
    } else {
      document.removeEventListener("click", handleClickOutsideCard);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideCard);
    };
  }, [cardVisible]);


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
    data,
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
    data
  ) => {
    console.log("Ready data:", data);
  };

  const createServerHandler: OpCodeHandler = (
    data
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
    data
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
    data
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
    data
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
    data
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
    data
  ) => {
    console.log("Edit message data:", data);
  };

  const deleteServerHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Delete server data:", data);
  };

  const deleteChannelHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Delete channel data:", data);
  };

  const deleteMessageHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Delete message data:", data);
  };

  const serverMemberAddHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Server member add data:", data);

    const newMember: User = data.user;
    const server: Server = data.server;

    // add member to session
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === server.id) {
            if (!s.members) {
              return s;
            }
            return {
              ...s,
              members: [...s.members, newMember],
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
    }
    ); // Update the session with the new member
    // if server is selected, update the selected server's members
    setSelectedServer((prev: Server | null) => {
      if (!prev || prev.id !== server.id) {
        return null;
      }
      const updatedMembers = [
        ...(prev?.members ? prev?.members : []),
        newMember,
      ];
      return {
        ...prev,
        members: updatedMembers,
      };
    }
    ); // Update the selected server to reflect the new member

  };

  const serverMemberUpdateHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Server member update data:", data);

    const updatedMember: User = data.user;
    const serverId = data.serverId;

    // update member in session
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === serverId) {
            if (!s.members) return s;
            const updatedMembers = s.members.map((m) => {
              if (m.id === updatedMember.id) {
                return {
                  ...m,
                  ...updatedMember,
                };
              }
              return m;
            });

            return {
              ...s,
              members: updatedMembers,
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
    }
    ); // Update the session with the updated member
    // if server is selected, update the selected server's members
    setSelectedServer((prev: Server | null) => {
      if (!prev || prev.id !== serverId) {
        return prev;
      }
      const updatedMembers = prev?.members?.map((m) => {
        if (m.id === updatedMember.id) {
          return {
            ...m,
            ...updatedMember,
          };
        }
        return m;
      });

      return {
        ...prev,
        members: updatedMembers,
      };
    }
    ); // Update the selected server to reflect the updated member
  };

  const serverMemberDelHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Server member delete data:", data);

    const deletedMember: User = data.user;
    const server: Server = data.server;

    // remove member from session
    setSession((prevSession) => {
      if (prevSession) {
        const updatedServers = prevSession.servers!.map((s) => {
          if (s.id === server.id) {
            if (!s.members) return s;
            const updatedMembers = s.members.filter((m) => m.id !== deletedMember.id);

            return {
              ...s,
              members: updatedMembers,
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
    }
    ); // Update the session with the deleted member
    // if server is selected, update the selected server's members
    setSelectedServer((prev: Server | null) => {
      if (!prev || prev.id !== server.id) {
        return null;
      }
      const updatedMembers = [
        ...(prev?.members ? prev?.members : []),
        deletedMember,
      ];
      return {
        ...prev,
        members: updatedMembers,
      };
    }
    ); // Update the selected server to reflect the deleted member
  };

  /** Friend Handlers */
  const friendRequestSentHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Friend request sent data:", data);

    const fr: User = data.friend;
    // add friend request to session
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          friendRequestsSent: [...prevSession.friendRequestsSent!, fr],
        };
      }
      return prevSession;
    });
  }
  const friendRequestReceivedHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Friend request received data:", data);

    const fr: User = data.user;
    // add friend request to session
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          friendRequestsReceived: [
            ...(prevSession.friendRequestsReceived ? prevSession.friendRequestsReceived : []),
            fr,
          ],
        };
      }
      return prevSession;
    }
    ); // Update the session with the new friend request
  }
  const friendRequestAcceptedHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Friend request accepted data:", data);

    const user: User = data.user;
    const friend: User = data.friend;

    if (!user && friend) {
      // add friend to session and remove from friend request received
      setSession((prevSession) => {
        if (prevSession) {
          return {
            ...prevSession,
            friends: [...prevSession.friends!, friend],
            friendRequestsReceived: prevSession.friendRequestsReceived!.filter((f) => f.id !== friend.id),
          };
        }
        return prevSession;
      }
    );
    } else if (user && !friend) {
      // add friend to session and remove from friend request sent
      setSession((prevSession) => {
        if (prevSession) {
          return {
            ...prevSession,
            friends: [...prevSession.friends!, user],
            friendRequestsSent: prevSession.friendRequestsSent!.filter((f) => f.id !== user.id),
          };
        }
        return prevSession;
      }
    );
    }
      

  }
  const friendRequestDeclinedHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Friend request declined data:", data);

    const user: User = data.user;
    const friend: User = data.friend;
    if (!user && friend) {
      // remove friend from session and remove from friend request received
      setSession((prevSession) => {
        if (prevSession) {
          return {
            ...prevSession,
            friendRequestsReceived: prevSession.friendRequestsReceived!.filter((f) => f.id !== friend.id),
          };
        }
        return prevSession;
      }
    );
    }
    else if (user && !friend) {
      // remove friend from session and remove from friend request sent
      setSession((prevSession) => {
        if (prevSession) {
          return {
            ...prevSession,
            friendRequestsSent: prevSession.friendRequestsSent!.filter((f) => f.id !== user.id),
          };
        }
        return prevSession;
      }
    );
    }
  }

  const friendRemoveHandler: OpCodeHandler = (
    data
  ) => {
    console.log("Friend removed data:", data);

    let user: User = data.user;
    const friend: User = data.friend;
    user = user ? user : friend;

    // remove user as a friend
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          friends: prevSession.friends!.filter((f) => f.id !== user.id),
        };
      }
      return prevSession;
    }
    ); // Update the session with the new friend request

  }

  const userUpdateHandler: OpCodeHandler = (
    data) => {
    console.log("User update data:", data);

    const updatedUser: User = data.user;

    // update user in session
    setSession((prevSession) => {
      if (prevSession) {
        return {
          ...prevSession,
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          status: updatedUser.status,
          location: updatedUser.location,
          birthday: updatedUser.birthday,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          skills: updatedUser.skills,
        };
      }
      return prevSession;
    }
    ); // Update the session with the new user data
  }

  /*const roleCreateHandler: OpCodeHandler = (
    data: any,
    client: WebSocketClient
  ) => {};*/ // Uncomment once in use TODO
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
  listeners.set(OPCodes.FRIEND_REQUEST_SENT, [friendRequestSentHandler]);
  listeners.set(OPCodes.FRIEND_REQUEST_CREATE, [friendRequestReceivedHandler]);
  listeners.set(OPCodes.FRIEND_REQUEST_ACCEPT, [friendRequestAcceptedHandler]);
  listeners.set(OPCodes.FRIEND_REQUEST_REJECT, [friendRequestDeclinedHandler]);
  listeners.set(OPCodes.FRIEND_REMOVED, [friendRemoveHandler]);
  listeners.set(OPCodes.USER_UPDATE, [userUpdateHandler]);


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
            {/* Profile Card */}
            {cardVisible && (
              <UserProfileModal
                user={cardUser}
                x={cardPosition.x}
                y={cardPosition.y}
                session={session}
                handleSetDirectMessage={
                  (friend: User) => {
                    setSelectedFriend(friend);
                    setSelectedServer(null);
                    setSelectedChannel(null);
                    setCardVisible(false);
                  }
                }
              ></UserProfileModal>
            )}

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
                  <div className={classes.self_buttons}>
                    {checkPermissions(selectedServer, session!.id, session!.roles!, Permissions.ADMIN) && (
                      <button
                      className={classes.chat_bar_button}
                      onClick={() => setServerSettings(true)}
                      >
                        <MdSettings className={classes.chat_bar_icon}/>
                      </button>
                    )}

                    <button
                    className={classes.chat_bar_button}
                    onClick={() => setServerInfoModal(true)}
                    >
                      <MdInfoOutline className={classes.chat_bar_icon}/>
                    </button>
                  </div>
                </div>
              )}

              {!selectedServer ? (
                <FriendsList friends={session?.friends ? session?.friends : []} clickFunc={(u) => {
                  setSelectedFriend(u);
                  setSelectedServer(null);
                  setSelectedChannel(null);
                  setFriendRequestPanelActive(false);
                }} activeUser={selectedFriend} handleProfileCard={handleProfileCard}/>
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
                          key={channel.id}
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
                        <MdHome className={classes.dock_icon_lib}/>
                      </div>
                    </div>
                    <div
                          className={classes.dock_icon}
                          onMouseEnter={(e) => handleDockMouseEnter(e, "Create Server")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => setCreatingServer(true)}
                        >
                          <MdAdd className={classes.dock_icon_lib}/>
                    </div>
                    <div
                          className={classes.dock_icon}
                          onMouseEnter={(e) => handleDockMouseEnter(e, "Join Server")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => setJoiningServer(true)}

                        >
                          <MdGroupAdd className={classes.dock_icon_lib}/>
                    </div>

                    {session?.servers?.map((server) => (
                        <ServerIcon 
                          key={server.id}
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
                  session={session}
                  selectedChannel={selectedChannel}
                  handleProfileCard={handleProfileCard}
                  selectedServer={selectedServer}
                />
              )}

              {serverInfoModal && selectedServer && (
                <ServerDiscoveryModal
                  server={selectedServer}
                  isOpen={serverInfoModal}
                  setClose={(arg0: boolean) => (setServerInfoModal(arg0))}
                />
              )}
            </div>

            <div className={classes.members_profile}>
              <MembersList session={session} selectedServer={selectedServer} handleProfileCard={handleProfileCard}/>
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
                    <h5>
                      {session?.firstName} {session?.lastName}
                    </h5>
                    <h6>{session?.status}</h6>
                  </div>
                </div>
                <div className={classes.self_buttons}>
                    <button
                        onClick={async () => {
                            Cookies.remove("refresh_token");
                            Cookies.remove("access_token");
                            window.location.href = "/login";
                        }}
                        className={classes.chat_bar_button}
                    >
                        <MdLogout className={classes.chat_bar_icon}/>
                    </button>
                    <button
                      className={classes.chat_bar_button}
                      onClick={() => setUserSettings(true)}
                    >
                      <MdSettings className={classes.chat_bar_icon}/>
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;
