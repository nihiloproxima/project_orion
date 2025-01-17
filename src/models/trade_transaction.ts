import { ResourceType } from "./planets_resources";

export interface TradeTransaction {
    id: string;
    offer_id: string;
    buyer_id: string;
    seller_id: string;
    resource_type: ResourceType;
    amount: number;
    price_per_unit: number;
    total_price: number;
    created_at: number;
}
