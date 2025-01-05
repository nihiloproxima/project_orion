import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UnlockableType } from "../models/researchs_config";
import { PlanetResearchs } from "../models/planet_researchs";
import { ResearchsConfig } from "../models/researchs_config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTechnologyBonus(
  researchsConfig: ResearchsConfig,
  planetResearchs: PlanetResearchs,
  researchEffectType: UnlockableType
): number {
  let totalBonus = 0;

  for (const [researchId, research] of Object.entries(
    researchsConfig.available_researchs
  )) {
    const techLevel = planetResearchs.technologies[researchId]?.level || 0;
    if (techLevel === 0) continue;

    for (const effect of research.effects) {
      if (effect.type === researchEffectType) {
        if (effect.per_level) {
          totalBonus += (effect.value * techLevel) / 100;
        } else {
          totalBonus += effect.value / 100;
        }
      }
    }
  }

  return 1 + totalBonus;
}

export const formatTimerTime = (seconds: number) => {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
    remainingSeconds > 0 && `${remainingSeconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
};

export const formatTimeString = (timeRemainingMs: number) => {
  const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

  return [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
};
