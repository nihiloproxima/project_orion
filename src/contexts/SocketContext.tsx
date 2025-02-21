import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGame } from './GameContext';
import { useAuth } from './AuthContext';

interface SocketContextType {
	socket: Socket | null;
	connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const socketRef = useRef<Socket | null>(null);
	const { state, setState } = useGame();
	const { authedUser } = useAuth();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const initSocket = async () => {
			if (!authedUser) return console.log('No authed user');
			console.log(`socket`, process.env.NEXT_PUBLIC_WEBSOCKET_URL!);

			const token = await authedUser.getIdToken();

			socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL!, {
				auth: { token },
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
			});

			socketRef.current.on('connect', () => {
				console.log('Socket connected');
				socketRef.current?.emit('subscribe:planets');
				setConnected(true);
			});

			socketRef.current.on('disconnect', () => {
				console.log('Socket disconnected');
				setConnected(false);
			});

			socketRef.current.on('active:users', (users: any) => {
				setState((prev) => ({ ...prev, activePlayers: users }));
			});

			// Subscribe to planet updates
			if (state.selectedPlanet) {
				socketRef.current.emit('subscribe:planet', state.selectedPlanet.id);
			}

			// Heartbeat
			const heartbeatInterval = setInterval(() => {
				if (socketRef.current?.connected) {
					socketRef.current.emit('heartbeat');
				}
			}, 60 * 1000);

			return () => {
				clearInterval(heartbeatInterval);
				socketRef.current?.disconnect();
			};
		};

		initSocket();
	}, [authedUser, state.selectedPlanet?.id]);

	// Handle planet selection changes
	useEffect(() => {
		if (!socketRef.current?.connected || !state.selectedPlanet) return;

		socketRef.current.emit('subscribe:planet', state.selectedPlanet.id);
	}, [state.selectedPlanet?.id]);

	return <SocketContext.Provider value={{ socket: socketRef.current, connected }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
}
