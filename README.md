<h1 align="center">🚀 Project Orion</h1>

<h2 align="center">
  <a href="https://projectorion.app">Play Now at projectorion.app</a>
</h2>

![Project Orion Dashboard](screenshots/dashboard.webp)


Project Orion is a real-time space strategy MMO game where players take on the role of commanders assigned to frontier colonies by the Galactic Council. Combining idle mechanics, resource management, and strategic warfare, the game offers a deep and engaging experience in space exploration and empire building.

## 🎮 Game Overview

As a newly appointed commander, you are tasked with:
- Managing and developing your colonial outpost
- Harvesting and processing vital resources
- Researching advanced technologies
- Building and commanding powerful spacecraft
- Engaging in diplomatic relations or warfare with other players
- Expanding your influence across the galaxy

## ⚡ Features

- **Real-time Resource Management**: Manage Metal, Deuterium, Microchips, and Energy
- **Interactive 3D Galaxy Map**: Real-time visualization of fleet movements across space
  - Live tracking of your fleets and enemy movements
  - Interactive zoom and rotation controls
  - Visual representation of colonies, resources, and strategic points
  - Time-to-arrival indicators and movement trajectories
- **Strategic Building System**: Develop your colony with various structures and facilities
- **Advanced Research Tree**: Unlock new technologies and capabilities
- **Fleet Management**: Build, customize, and command your space fleet
- **Mission System**: Engage in exploration, trading, or combat missions
- **Player Interaction**: Trade resources or engage in strategic warfare
- **Season-based Gameplay**: Regular resets with persistent achievements

## 🏗️ Project Structure

The project is organized as a monorepo with two main components:

### [Client](/client)
- Next.js-based frontend application
- Modern UI with Radix UI components
- Real-time updates using WebSocket
- 3D visualizations with Three.js
- Firebase authentication

### [Server](/server)
- Fastify-based backend service
- BullMQ for job queue management
- Real-time game mechanics
- Resource calculation engine
- Mission processing system

For detailed technical information about each component, please refer to their respective README files:
- [Client Documentation](/client/README.md)
- [Server Documentation](/server/README.md)


## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/nihiloproxima/project-orion.git
cd project-orion
```

2. Install dependencies
```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. Start the game
```bash
# Start all services using Docker
docker-compose build && docker-compose up -d
```

The game will be available at `http://localhost:40000`

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Three.js, WebSocket
- **Backend**: Node.js, Fastify, BullMQ
- **Database**: Redis
- **Authentication**: Firebase
- **Deployment**: Docker, Nginx

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

ISC License

## 🎮 Inspiration

Project Orion draws inspiration from classic space strategy games like OGame, while introducing modern gameplay mechanics and real-time interactions. Our goal is to create an engaging experience that combines the best aspects of idle games with deep strategic gameplay.