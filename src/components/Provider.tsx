'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<ThemeProvider>
				<LanguageProvider>
					<GameProvider>
						<SocketProvider>{children}</SocketProvider>
					</GameProvider>
				</LanguageProvider>
			</ThemeProvider>
		</AuthProvider>
	);
}
