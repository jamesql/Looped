# React Frontend

## Overview
This directory contains the frontend application built with React and Express.

## Features
- User authentication and profile management
- Server and channel navigation
- Real-time messaging and video chat
- Job application system

## Setup
Ensure Node.js is installed. Then run:

```bash
npm install
npm start
```

## Environment Variables
Configure `.env` for API and WebSocket URLs:

```plaintext
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=ws://localhost:5001
```

## Build
For production:
```bash
npm run build
```
