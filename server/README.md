# Space Strategy Game Server

A TypeScript-based game server built with Fastify and BullMQ for managing a multiplayer space strategy game.

## 🚀 Features

- Season-based gameplay system
- Resource management (Metal, Deuterium, Microchips, Energy)
- Multiple planet biomes with unique resource modifiers
- Research and technology system
- Building and structure management
- Queue-based worker system for game tasks
- Real-time resource production
- Planetary colonization mechanics

## 🛠️ Tech Stack

- TypeScript
- Fastify
- BullMQ for job queues
- Firebase Admin SDK
- Redis
- Winston for logging

## 🏗️ Project Structure

- `src/` - Source code
  - `models/` - Game data models and configurations
  - `worker/` - Background job processing
  - `server.ts` - Main server entry point

## 🚦 Getting Started

### Prerequisites

- Node.js (v20 recommended)
- Redis server
- Firebase project credentials

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

4. Start the development server:
```bash
npm run dev
```

5. Start the worker (in a separate terminal):
```bash
npm run dev:worker
```

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:worker` - Start development worker with hot reload
- `npm run build` - Build the project
- `npm run start` - Start the production server
- `npm run worker` - Start the production worker

## 🎮 Game Configuration

The game includes detailed configuration for:

- Resource production and management
- Research technologies and prerequisites
- Building structures and costs
- Planet types and biome effects
- Season mechanics
- Speed multipliers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License
