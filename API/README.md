# API

## Overview
This directory contains the backend API for Looped, responsible for authentication, data management, and business logic.

## Features
- User authentication (OAuth, JWT, 2FA)
- CRUD operations for users, profiles, and job postings
- Role-based access control and permissions
- RESTful API with documentation

## Installation
Ensure Node.js and PostgreSQL are installed.  
Run the following command inside the `API` directory:

```bash
npm install
npm start
```

## Environment Variables
Set up a `.env` file with:
```plaintext
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## API Documentation
Refer to the [API Docs](../DOCUMENTATION.md) for detailed endpoints.
