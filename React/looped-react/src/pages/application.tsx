import { useEffect, useState } from "react";
import APIClient from "./api/APIClient";
import { WebSocketComponent } from "./components/_ws";
import WebSocketService from "./ws/WebSocketService";
import Cookie from 'js-cookie';


export default function Application() {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [serverData, setServerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [creatingServer, setCreatingServer] = useState(false);
    const [creatingChannel, setCreatingChannel] = useState(false);
    const [newServerName, setNewServerName] = useState("");
    const [newChannelData, setNewChannelData] = useState({ name: "", type: "TEXT" });
    const [selectedServerData, setSelectedServerData] = useState(null);
    const [isServerOwner, setIsServerOwner] = useState(false);

    // get token
    useEffect(() => {
            const fetchedToken = Cookie.get("accessToken");
            const fetchedUserId = Cookie.get("userId");

            if (!fetchedToken) window.location.href="http://localhost:3000";
            else setToken(fetchedToken);

            setUserId(fetchedUserId);

    },[]);

    // get server data
    useEffect(() => {
        if (!token) return;

        const getData = async () => {
            const data = await APIClient.getServerData(token);
            setServerData(data);
            setLoading(false);
        }

        getData();

    }, [token, userId]);

    // Handle server selection
    const handleServerSelect = (serverId) => {
        const server = serverData.find(server => server.id === serverId);
        setSelectedServer(serverId);
        setSelectedChannel(null);  // Reset channel selection when server changes

        if (server) {
            setSelectedServerData(server);
            setIsServerOwner(server.ownerId === userId);  // Update isServerOwner based on selected server
        }
    };
    
        // Handle channel selection
        const handleChannelSelect = (channelId) => {
            setSelectedChannel(channelId);
        };
    
        // Send message
        const handleMessageSend = async () => {
            if (!selectedChannel || !messageContent) return;
    
            const channel = serverData.find(server => server.id === selectedServer)
                                       .channels.find(channel => channel.id === selectedChannel);
    
            // Send message to the selected channel (this could be via WebSocket or API)
            await APIClient.sendMessage(selectedServer, selectedChannel, messageContent, token);  // APIClient.sendMessage should handle sending the message
    
            // Clear the message input after sending
            setMessageContent("");
        };

            // Handle create server
    const handleCreateServer = async () => {
        if (!newServerName) return;

        try {
            const newServer = await APIClient.createServer(newServerName, token);
            setServerData([...serverData, newServer]);  // Add the new server to the state
            setCreatingServer(false);  // Close the create server modal
            setSelectedServer(newServer.id);
            setIsServerOwner(newServer.ownerId === userId);
    
        } catch (error) {
            console.error('Error creating server:', error);
        }
    };

    // Handle create channel
    const handleCreateChannel = async () => {
        if (!newChannelData.name) return;

        try {
            const newChannel = await APIClient.createChannel(selectedServer, newChannelData.name, newChannelData.type, token);
            const updatedServerData = serverData.map((server) => {
                if (server.id === selectedServer) {
                    return {
                        ...server,
                        channels: [...server.channels, newChannel]
                    };
                }
                return server;
            });

            setServerData(updatedServerData);  // Update server data with the new channel
            setCreatingChannel(false);  // Close the create channel modal
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };

    const handleHello = async () => {

    };

    const handleReady = async () => {

    };

    if (loading)
    return <div>Loading...</div>; 

    return (
        <div>
            <h1>Welcome to Looped.</h1>
            <h2>User ID: {userId}</h2>
            <WebSocketComponent 
            onHelloCallback={handleHello} 
            onReadyCallback={handleReady} 
            /> {/* WebSocket component */}

            {/* Server selection dropdown */}
            <div>
                <label htmlFor="serverSelect">Select Server:</label>
                <select
                    id="serverSelect"
                    onChange={(e) => handleServerSelect(e.target.value)}
                    value={selectedServer || ""}
                >
                    <option value="">Select a server</option>
                    {serverData.map((server) => (
                        <option key={server.id} value={server.id}>
                            {server.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Channel selection dropdown */}
            {selectedServer && selectedServerData && (
                <div>
                    <label htmlFor="channelSelect">Select Channel:</label>
                    <select
                        id="channelSelect"
                        onChange={(e) => handleChannelSelect(e.target.value)}
                        value={selectedChannel || ""}
                    >
                        <option value="">Select a channel</option>
                        {selectedServerData.channels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Message input */}
            {selectedChannel && (
                <div>
                    <label htmlFor="messageInput">Message:</label>
                    <textarea
                        id="messageInput"
                        rows={4}
                        placeholder="Type your message"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                    />
                    <button onClick={handleMessageSend}>Send Message</button>
                </div>
            )}

            {/* Online users list */}
            {selectedServer && (
                <div>
                    <h3>Online Users:</h3>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user.id}>
                                {user.firstName} {user.lastName}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Create Server Button (Available to all users) */}
            {!creatingServer && (
                <div>
                    <button onClick={() => setCreatingServer(true)}>Create Server</button>
                </div>
            )}

            {/* Create Server Modal (Available to all users) */}
            {creatingServer && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter new server name"
                        value={newServerName}
                        onChange={(e) => setNewServerName(e.target.value)}
                    />
                    <button onClick={handleCreateServer}>Create Server</button>
                    <button onClick={() => setCreatingServer(false)}>Cancel</button>
                </div>
            )}

            {/* Create Channel Button (Only for the server owner) */}
            {isServerOwner && !creatingChannel && (
                <div>
                    <button onClick={() => setCreatingChannel(true)}>Create Channel</button>
                </div>
            )}

            {/* Create Channel Modal (Only for the server owner) */}
            {creatingChannel && isServerOwner && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter channel name"
                        value={newChannelData.name}
                        onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
                    />
                    <select
                        value={newChannelData.type}
                        onChange={(e) => setNewChannelData({ ...newChannelData, type: e.target.value })}
                    >
                        <option value="TEXT">Text</option>
                        <option value="VOICE">Voice</option>
                    </select>
                    <button onClick={handleCreateChannel}>Create Channel</button>
                    <button onClick={() => setCreatingChannel(false)}>Cancel</button>
                </div>
            )}

            <h1>DEBUG OUTPUT</h1>
            {JSON.stringify(serverData)}
        </div>
    );
}