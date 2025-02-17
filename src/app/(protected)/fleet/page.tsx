'use client';
import { Anchor, ArrowUpDown, Box, LayoutGrid, LayoutList, Pencil, Rocket, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Ship } from '../../../models/ship';
import { useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { useGame } from '../../../contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ResourcePayload } from '@/models';
import { getPublicImageUrl } from '@/lib/images';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';

type SortField = 'speed' | 'cargo_capacity' | 'attack_power' | 'defense';
type SortOrder = 'asc' | 'desc';

export default function Fleet() {
	const { state } = useGame();
	const [ships] = useCollectionData(
		state.gameConfig
			? query(
					collection(db, `seasons/${state.gameConfig.season.current}/ships`).withConverter(withIdConverter),
					where('owner_id', '==', state.currentUser?.id)
			  )
			: null
	);
	const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [selectedShipToRename, setSelectedShipToRename] = useState<Ship | null>(null);
	const [newShipName, setNewShipName] = useState('');
	const [sortField, setSortField] = useState<SortField>('speed');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

	const { toast } = useToast();

	const handleRenameShip = async () => {
		if (!selectedShipToRename || !newShipName.trim()) return;

		const { error } = await api.renameShip(selectedShipToRename.id, newShipName);

		if (error) {
			return toast({
				title: 'Error',
				description: 'Failed to rename ship. Please try again.',
				variant: 'destructive',
			});
		}

		toast({
			title: 'Success',
			description: 'Ship renamed successfully.',
		});

		setRenameDialogOpen(false);
		setSelectedShipToRename(null);
		setNewShipName('');
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortOrder('desc');
		}
	};

	// Add debris fields fetch
	useEffect(() => {
		const fetchDebrisFields = async () => {
			const { data } = await supabase.from('debris_fields').select('*');
			setDebrisFields(data || []);
		};
		fetchDebrisFields();
	}, []);

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
			<motion.div variants={itemVariants}>
				<h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
					<Rocket className="h-8 w-8" />
					FLEET
				</h1>
				<p className="text-muted-foreground">Manage and deploy your stationed ships</p>
			</motion.div>

			<motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-2 w-full">
				<div className="flex gap-2 w-full sm:w-auto">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
						className="flex items-center gap-2"
					>
						{viewMode === 'grid' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
					</Button>
				</div>

				<div className="flex gap-2 w-full sm:w-auto">
					<div className="w-full sm:w-[180px]">
						<Select value={sortField} onValueChange={(value) => handleSort(value as SortField)}>
							<SelectTrigger>
								<ArrowUpDown className="w-4 h-4 mr-2" />
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="speed">
									Speed {sortField === 'speed' && (sortOrder === 'asc' ? '↑' : '↓')}
								</SelectItem>
								<SelectItem value="cargo_capacity">
									Cargo {sortField === 'cargo_capacity' && (sortOrder === 'asc' ? '↑' : '↓')}
								</SelectItem>
								<SelectItem value="attack_power">
									Attack {sortField === 'attack_power' && (sortOrder === 'asc' ? '↑' : '↓')}
								</SelectItem>
								<SelectItem value="defense">
									Defense {sortField === 'defense' && (sortOrder === 'asc' ? '↑' : '↓')}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Button
					variant="default"
					size="lg"
					disabled={!selectedShip}
					className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors border ${
						!selectedShip
							? 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed'
							: 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border'
					}`}
				>
					<span className="uppercase">Send Mission</span>
				</Button>
			</motion.div>

			<motion.div
				variants={itemVariants}
				className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
			>
				{ships?.map((ship, index) => (
					<motion.div
						key={ship.id}
						variants={itemVariants}
						initial="hidden"
						animate="show"
						transition={{ delay: index * 0.1 }}
					>
						<Card
							className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
								selectedShip?.id === ship.id ? 'neon-border-primary' : 'hover:neon-border'
							}`}
						>
							<CardHeader className="flex flex-row items-center space-y-0 pb-2">
								<CardTitle className="flex-1 flex items-center gap-2">
									<Image
										src={getPublicImageUrl('ships', ship.type + '.webp')}
										width={100}
										height={100}
										aria-description={`Ship ${ship.name}`}
										alt={ship.name}
										className="w-8 h-8"
									/>
									<div className="flex flex-col">
										<span>{ship.name}</span>
										<span className="text-xs text-muted-foreground">{ship.ship_type}</span>
									</div>
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setSelectedShipToRename(ship);
										setNewShipName(ship.name);
										setRenameDialogOpen(true);
									}}
								>
									<Pencil className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="flex items-center gap-2">
										<Rocket className="h-4 w-4 text-blue-400" />
										<span>Speed: {ship.speed}</span>
									</div>
									<div className="flex items-center gap-2">
										<Box className="h-4 w-4 text-yellow-400" />
										<span>Cargo: {ship.cargo_capacity}</span>
									</div>
									<div className="flex items-center gap-2">
										<Anchor className="h-4 w-4 text-red-400" />
										<span>Attack: {ship.attack_power}</span>
									</div>
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4 text-green-400" />
										<span>Defense: {ship.defense}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>

			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Ship</DialogTitle>
					</DialogHeader>
					<Input
						value={newShipName}
						onChange={(e) => setNewShipName(e.target.value)}
						placeholder="Enter new ship name"
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleRenameShip}>Rename</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
