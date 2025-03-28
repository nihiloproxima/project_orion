'use client';

import { AuthLayout } from '@/components/layouts/AuthLayout';
import ProtectedRoute from '@/hoc/ProtectedRoutes';
import { Toaster } from '@/components/ui/toaster';
import { RewardModal } from '@/components/RewardModal';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<AuthLayout>
				{children}
				<Toaster />
				<RewardModal />
			</AuthLayout>
		</ProtectedRoute>
	);
}
