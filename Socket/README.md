# Looped - Socket Server


## File Structure
```
├── README.md
├── index.ts
├── package-lock.json // ignore package-validation
├── package.json // NPM Package List
└── src // Main directory
    ├── index.ts // ignore
    ├── server
    │   ├── WSValues.ts // OPCodes & Structs to also be used on client side.
    │   ├── connection.ts // Handles inital connection of WebSocket.
    │   ├── index.ts // Main file
    │   ├── message.ts // Handles incoming messages from clients on WebSocket.
    │   └── redis.ts // Redis Singleton file for API communication/scalability.
    ├── tsconfig.json // TypeScript config
    └── utils
        └── @types
            └── global.d.ts // Global types
```

## Inital Setup

```npm install```