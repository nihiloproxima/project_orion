'use client';

import _ from 'lodash';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { containerVariants, itemVariants } from '@/lib/animations';
import { useGame } from '@/contexts/GameContext';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, where, QueryConstraint } from 'firebase/firestore';
import { db, withIdConverter } from '@/lib/firebase';
import { ResourceForSale, ComponentForSale, BlueprintForSale } from '@/models/trading';
import { ResourceType } from '@/models/planet';
import { useState } from 'react';
import { Hammer, Flame, Microchip, Package, FileCode, Coins, ArrowDownZA, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

const RESOURCE_ICONS = {
	metal: Hammer,
	deuterium: Flame,
	microchips: Microchip,
};

export default function Trading() {
	const { state } = useGame();
	const [selectedTab, setSelectedTab] = useState('resources');
	const [showListingDialog, setShowListingDialog] = useState(false);
	const [selectedResource, setSelectedResource] = useState<ResourceType>('metal');
	const [amount, setAmount] = useState('');
	const [price, setPrice] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [minAmount, setMinAmount] = useState('');
	const [maxAmount, setMaxAmount] = useState('');
	const [resourceFilter, setResourceFilter] = useState<ResourceType | 'all'>('all');

	// Fetch marketplace listings
	const [resourceListings] = useCollectionData<ResourceForSale>(
		query(
			collection(db, `seasons/${state.gameConfig?.season.current}/resources_marketplace`).withConverter(
				withIdConverter
			),
			...([
				resourceFilter !== 'all' && where('resource', '==', resourceFilter),
				minAmount && where('amount', '>=', _.toFinite(minAmount)),
				maxAmount && where('amount', '<=', _.toFinite(maxAmount)),
			].filter(Boolean) as QueryConstraint[])
		)
	);

	const [componentListings] = useCollectionData<ComponentForSale>(
		query(
			collection(db, `seasons/${state.gameConfig?.season.current}/components_marketplace`).withConverter(
				withIdConverter
			),
			orderBy('created_at', sortOrder)
		)
	);

	const [blueprintListings] = useCollectionData<BlueprintForSale>(
		query(
			collection(db, `seasons/${state.gameConfig?.season.current}/blueprints_marketplace`).withConverter(
				withIdConverter
			),
			orderBy('created_at', sortOrder)
		)
	);

	const handleCreateListing = async () => {
		if (!amount || !price) return;

		try {
			if (selectedTab === 'resources') {
				// await api.post('/trading/resources', {
				// 	resource: selectedResource,
				// 	amount: parseInt(amount),
				// 	price: parseInt(price),
				// });
			}
			setShowListingDialog(false);
			setAmount('');
			setPrice('');
		} catch (error) {
			console.error('Error creating listing:', error);
		}
	};

	const handlePurchase = async (listingId: string, type: 'resource' | 'component' | 'blueprint') => {
		try {
			// await api.post(`/trading/${type}s/purchase`, {
			// 	listingId,
			// });
		} catch (error) {
			console.error('Error purchasing item:', error);
		}
	};

	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	return (
		<div className="space-y-6">
			<motion.div variants={containerVariants} initial="hidden" animate="show">
				<motion.div variants={itemVariants} className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold neon-text mb-2">GALACTIC MARKETPLACE</h1>
						<p className="text-muted-foreground">Trade resources and equipment with other commanders</p>
					</div>
					<div className="flex gap-2">
						<Button onClick={toggleSortOrder} variant="outline" className="neon-border">
							{sortOrder === 'desc' ? (
								<ArrowDownZA className="h-4 w-4" />
							) : (
								<ArrowDown className="h-4 w-4" />
							)}
						</Button>
						<Button onClick={() => setShowListingDialog(true)} className="neon-border">
							Create Listing
						</Button>
					</div>
				</motion.div>

				<Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
					<TabsList>
						<TabsTrigger value="resources" className="flex items-center gap-2">
							<Coins className="h-4 w-4" /> Resources
						</TabsTrigger>
						<TabsTrigger value="components" className="flex items-center gap-2">
							<Package className="h-4 w-4" /> Components
						</TabsTrigger>
						<TabsTrigger value="blueprints" className="flex items-center gap-2">
							<FileCode className="h-4 w-4" /> Blueprints
						</TabsTrigger>
					</TabsList>

					<TabsContent value="resources" className="space-y-4">
						<div className="flex gap-4 items-end mb-4">
							<div className="space-y-2">
								<Select
									value={resourceFilter}
									onValueChange={(value: ResourceType | 'all') => setResourceFilter(value)}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter Resource" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Resources</SelectItem>
										<SelectItem value="metal">Metal</SelectItem>
										<SelectItem value="deuterium">Deuterium</SelectItem>
										<SelectItem value="microchips">Microchips</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Input
									type="number"
									placeholder="Min Amount"
									value={minAmount}
									onChange={(e) => setMinAmount(e.target.value)}
									className="w-[120px]"
								/>
							</div>
							<div className="space-y-2">
								<Input
									type="number"
									placeholder="Max Amount"
									value={maxAmount}
									onChange={(e) => setMaxAmount(e.target.value)}
									className="w-[120px]"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{resourceListings?.map((listing) => (
								<Card key={listing.id} className="bg-card/50 backdrop-blur-sm neon-border">
									<CardHeader className="flex flex-row items-center justify-between">
										<CardTitle className="text-lg">
											{listing.amount.toLocaleString()} {listing.resource}
										</CardTitle>
										{React.createElement(RESOURCE_ICONS[listing.resource])}
									</CardHeader>
									<CardContent>
										<div className="flex justify-between items-center">
											<span className="text-primary">
												{listing.price.toLocaleString()} credits
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handlePurchase(listing.id, 'resource')}
												disabled={listing.agent.id === state.currentUser?.id}
											>
												{listing.agent.id === state.currentUser?.id
													? 'Your Listing'
													: 'Purchase'}
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="components" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{componentListings?.map((listing) => (
								<Card key={listing.id} className="bg-card/50 backdrop-blur-sm neon-border">
									<CardHeader>
										<CardTitle className="text-lg">{listing.component.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												{listing.component.description}
											</p>
											<div className="flex justify-between items-center">
												<span className="text-primary">
													{listing.price.toLocaleString()} credits
												</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handlePurchase(listing.id, 'component')}
													disabled={listing.agent.id === state.currentUser?.id}
												>
													{listing.agent.id === state.currentUser?.id
														? 'Your Listing'
														: 'Purchase'}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="blueprints" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{blueprintListings?.map((listing) => (
								<Card key={listing.id} className="bg-card/50 backdrop-blur-sm neon-border">
									<CardHeader>
										<CardTitle className="text-lg">{listing.blueprint.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												{listing.blueprint.description}
											</p>
											<div className="flex justify-between items-center">
												<span className="text-primary">
													{listing.price.toLocaleString()} credits
												</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handlePurchase(listing.id, 'blueprint')}
													disabled={listing.agent.id === state.currentUser?.id}
												>
													{listing.agent.id === state.currentUser?.id
														? 'Your Listing'
														: 'Purchase'}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</motion.div>

			<Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Listing</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Select
							value={selectedResource}
							onValueChange={(value: ResourceType) => setSelectedResource(value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Resource" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="metal">Metal</SelectItem>
								<SelectItem value="deuterium">Deuterium</SelectItem>
								<SelectItem value="microchips">Microchips</SelectItem>
							</SelectContent>
						</Select>
						<Input
							type="number"
							placeholder="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<Input
							type="number"
							placeholder="Price (credits)"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowListingDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateListing}>Create Listing</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
