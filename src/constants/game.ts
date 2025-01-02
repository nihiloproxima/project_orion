// Galaxy Grid Configuration
export const GALAXY_GRID = {
  SIZE: 10000, // Total size of the galaxy cube
  CELL_SIZE: 50, // Size of each grid cell
  MIN_ZOOM: 100,
  MAX_ZOOM: 5000,
  ZOOM_SPEED: 0.5,
  OFFSET: 5000,
} as const;

// Helper functions for grid calculations
export const GRID_HELPERS = {
  // Convert world coordinates to grid cell coordinates
  worldToGrid: (x: number, y: number) => ({
    gridX: Math.floor((x + GALAXY_GRID.OFFSET) / GALAXY_GRID.CELL_SIZE),
    gridY: Math.floor((y + GALAXY_GRID.OFFSET) / GALAXY_GRID.CELL_SIZE),
  }),

  // Convert grid cell coordinates to world coordinates (center of cell)
  gridToWorld: (gridX: number, gridY: number) => ({
    x:
      gridX * GALAXY_GRID.CELL_SIZE -
      GALAXY_GRID.OFFSET +
      GALAXY_GRID.CELL_SIZE / 2,
    y:
      gridY * GALAXY_GRID.CELL_SIZE -
      GALAXY_GRID.OFFSET +
      GALAXY_GRID.CELL_SIZE / 2,
  }),
} as const;

// Visual Configuration
export const DISPLAY = {
  CELL_SIZE: 50, // Base size for grid cells
  MIN_PLANET_RADIUS: 4,
  MAX_PLANET_RADIUS: 12,
} as const;
