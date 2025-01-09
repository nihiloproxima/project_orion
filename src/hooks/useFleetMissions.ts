import { useCallback } from 'react';
import { api } from '@/lib/api';
import { MissionType } from '@/models/ship';
import { ResourcePayload } from '@/models/fleet_movement';
import { useToast } from '@/hooks/use-toast';

interface SendMissionParams {
	from_planet_id: string;
	to_planet_id: string;
	ships_ids: string[];
	mission_type: MissionType;
	resources?: ResourcePayload;
}

export function useFleetMissions() {
	const { toast } = useToast();

	const sendMission = useCallback(
		async ({ ships_ids, mission_type, from_planet_id, to_planet_id, resources }: SendMissionParams) => {
			try {
				await api.fleet.sendMission({
					ships_ids,
					mission_type,
					from_planet_id,
					to_planet_id,
					resources,
				});

				toast({
					title: 'Success',
					description: 'Mission launched successfully.',
				});

				return true;
			} catch (error) {
				console.error('Failed to send mission:', error);
				toast({
					title: 'Error',
					description: 'Failed to launch mission. Please try again.',
					variant: 'destructive',
				});
				return false;
			}
		},
		[toast]
	);

	return {
		sendMission,
	};
}
