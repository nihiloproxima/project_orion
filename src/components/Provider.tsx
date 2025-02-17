'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<GameProvider>
				<SocketProvider>
					<ThemeProvider>{children}</ThemeProvider>
				</SocketProvider>
			</GameProvider>
		</AuthProvider>
	);
}
