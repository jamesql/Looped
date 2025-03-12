# WebSocket Server

## Overview
This directory contains the WebSocket server responsible for real-time messaging and notifications.

## Features
- Real-time text, voice, and video communication
- Live notifications for messages and job updates
- Secure connection handling

## Setup
Run the WebSocket server:

```bash
npm install
npm start
```

## Configuration
Modify `.env` for WebSocket settings:

```plaintext
SOCKET_PORT=5001
```

## Connection Example
Frontend connection:

```javascript
const socket = new WebSocket(process.env.REACT_APP_SOCKET_URL);
socket.onopen = () => console.log("Connected to WebSocket");
```
