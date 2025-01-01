// Galaxy Grid Configuration
export const GALAXY_GRID = {
  SIZE: 10000, // Total grid size (-5000 to +5000)
  OFFSET: 5000, // Half of grid size, used to convert between coordinate systems
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  ZOOM_SPEED: 0.001,
} as const;

// Visual Configuration
export const DISPLAY = {
  CELL_SIZE: 50, // Base size for grid cells
  MIN_PLANET_RADIUS: 4,
  MAX_PLANET_RADIUS: 12,
} as const;
