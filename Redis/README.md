# Redis

## Overview
This directory contains configuration and setup instructions for Redis, which is used for caching and session management.

## Installation
Ensure Redis is installed. Start Redis with:

```bash
redis-server
```

## Configuration
Set up your `.env` file:

```plaintext
REDIS_URL=redis://localhost:6379
```

## Usage
Redis is used for:
- Caching user sessions
- Optimizing real-time features
- Reducing database load
