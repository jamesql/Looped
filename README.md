<p align="center">
    <img src="./Assets/logo_main.jpg" alt="Looped Logo" width="200">
</p>

<h1 align="center">
    Looped
</h1>

## Description

Looped is a dynamic professional networking platform designed to connect individuals and companies in an interactive and structured environment. Users can join specialized servers, engage in discussions through dedicated channels, and showcase their expertise. The platform supports profile creation, resume uploads, and real-time communication via text, voice, and video. Additionally, users can explore job opportunities, build their portfolios, and foster professional relationships.

## Purpose

The mission of Looped is to provide a secure and engaging space for professional networking, collaboration, and career advancement. The platform incorporates robust security features such as permission-based access control, content moderation, and two-factor authentication to ensure a safe and productive user experience. Looped empowers professionals to expand their network, share insights, and explore new opportunities in an innovative and intuitive way.

---

## Features

- **User Authentication**: Secure login with OAuth and two-factor authentication (2FA)
- **Profile & Resume Management**: Users can create profiles, upload resumes, and showcase portfolios
- **Real-Time Communication**: Supports text, voice, and video chat within channels and direct messages
- **Server & Channel System**: Users can join or create industry-specific servers with structured communication
- **Job Board Integration**: Allows users to apply for jobs and companies to post job listings
- **Scalability & Performance**: Optimized with Redis caching, load balancing, and cloud hosting

---

## Project Structure

| Component            |                               Description                                |
| :------------------- | :----------------------------------------------------------------------: |
| [API](API)           | Backend API handling authentication, data management, and business logic |
| [Database](Database) |              Database setup and configuration instructions               |
| [React](React)       |            Frontend application built with React and Express             |
| [Redis](Redis)       |              Caching layer setup for optimized performance               |
| [Socket](Socket)     |          Real-time WebSocket server for seamless communication           |
| [Util](Util)         |         Utility wrapper classes to reuse throughout the project          |
| [Types](Types)       |                 Types to be used throughout the project                  |
| [Assets](Assets)     |     UI/UX design assets, branding materials, and other static files      |

---

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- Node.js & npm
- Docker (optional, for containerized deployment)
- Redis (for caching)
- PostgreSQL or MongoDB (for database)

### Steps to Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/jamesql/Looped.git
   cd Looped
   ```
2. **Install Dependencies**
   ```bash
   npm install --needs to be done in all directories
   ```
3. **Set Up Environment Variables**  
   Create a `.env` file and configure the required variables:
   ```plaintext
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_jwt_secret_key
   REFRESH_TOKEN_SECRET=your_jwt_secret_key

   # Prisma PostgreSQL Database URL
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public
   
   # Redis URL
   REDIS_URL=redis://localhost:6379
   
   # bCrypt Salt Rounds
   BCRYPT_SALT_ROUNDS=10
   ```
4. **Start Redis Server**
   ```redis-server```
5. **Install Database**
   ```
   You'll need to copy your .env to ./API to use prisma migrate
   cd ./API
   npx prisma migrate dev
   ```
5. **Start the Application**
```bash
All but React will be started from root directory /Looped
API - ts-node ./API
Socket - ts-node ./Socket
React - npx run dev
````

---

## Main Workflow

Looped follows a structured workflow to ensure efficient communication and collaboration among users:

1. **User Authentication & Profile Setup**

   - Secure account creation and login (OAuth, 2FA)
   - Profile customization with resume and portfolio uploads

2. **Server & Channel Interaction**

   - Join or create industry-specific servers
   - Participate in discussions through structured text, voice, and video channels

3. **Networking & Messaging**

   - Direct messaging with connections
   - Group conversations and professional discussions

4. **Job Applications & Portfolio Showcase**
   - Explore and apply for job opportunities
   - Showcase projects and past work

---

## Scalability & Performance

Looped is built with scalability in mind, ensuring optimal performance and reliability as the user base grows:

- **Microservices Architecture**: Modular services to allow independent scaling
- **Cloud Hosting & Load Balancing**: Deployments on scalable cloud infrastructure
- **Database Optimization**: Efficient indexing and caching strategies using Redis
- **Real-time Communication**: WebSocket-based messaging for seamless interaction

---

## Contribution Guidelines

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature-branch
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to your fork and submit a pull request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Documentation

For detailed setup instructions, API references, and developer guides, please visit the [official documentation](DOCUMENTATION_LINK).

---

## Contact

For inquiries or support, reach out to us at:
📧 Email: [help@looped.it.com]  
🌐 Website: [looped.it.com](https://looped.it.com)

---
