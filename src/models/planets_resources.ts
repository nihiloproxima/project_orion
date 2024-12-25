import { eq } from "drizzle-orm";
import { planetsResourcesTable } from "../db/schema/planets_resources";
import db from "../db/db";

export type ResourceType = "metal" | "energy" | "deuterium" | "science";

export interface PlanetResources {
    planet_id: string;
    metal: number;
    metal_generation_rate: number;
    crystal: number;
    crystal_generation_rate: number;
    energy: number;
    energy_generation_rate: number;
    deuterium: number;
    deuterium_generation_rate: number;
    science: number;
    science_generation_rate: number;
    last_update: Date;
}

export async function getPlanetCurrentResources(
    planetId: string,
): Promise<PlanetResources> {
    const [resources] = await db
        .select()
        .from(planetsResourcesTable)
        .where(eq(planetsResourcesTable.planet_id, planetId))
        .limit(1);

    if (!resources) {
        throw new Error("Planet resources not found");
    }

    const now = new Date();
    const lastUpdate = resources.last_update;
    const elapsedSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;

    // Calculate current resources based on generation rates
    const updatedResources: PlanetResources = {
        ...resources,
        metal: resources.metal +
            resources.metal_generation_rate * elapsedSeconds,
        crystal: resources.crystal +
            resources.crystal_generation_rate * elapsedSeconds,
        energy: resources.energy +
            resources.energy_generation_rate * elapsedSeconds,
        deuterium: resources.deuterium +
            resources.deuterium_generation_rate * elapsedSeconds,
        science: resources.science +
            resources.science_generation_rate * elapsedSeconds,
        last_update: now,
    };

    // Update the database with new values
    await db
        .update(planetsResourcesTable)
        .set(updatedResources)
        .where(eq(planetsResourcesTable.planet_id, planetId));

    return updatedResources;
}
