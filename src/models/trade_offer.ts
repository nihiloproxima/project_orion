import { ResourceType } from "./planets_resources";

export type TradeAction = "buy" | "sell";

export interface TradeOffer {
    id: string;
    owner_id: string;
    planet_id: string;
    outpost_id: string;
    action: TradeAction;
    resource_type: ResourceType;
    amount: number;
    price_per_unit: number;
    total_price: number;
    created_at: number;
    updated_at: number;
    status: "active" | "completed" | "cancelled";
    remaining_amount: number;
}

export interface CreateTradeOfferParams {
    planet_id: string;
    outpost_id: string;
    action: TradeAction;
    resource_type: ResourceType;
    amount: number;
    price_per_unit: number;
}
