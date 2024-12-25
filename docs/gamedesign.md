# Orion game

## Galaxy Setup

The game takes place in a vast galaxy containing 500 planets at the start. These planets are distributed across a massive coordinate system that spans from -1,000,000 to +1,000,000 on both X and Y axes, creating a grid of 2 million by 2 million units.

### Planet Distribution
- 500 initial planets
- Random coordinates between (-1M, -1M) and (+1M, +1M)
- No initial player ownership
- Unique coordinates for each planet

### Planet Biomes
Planets can have one of the following biome types:
- **Water Worlds**: Planets covered primarily in oceans and water bodies
- **Arid Planets**: Dry planets with sparse vegetation
- **Desert Planets**: Extremely hot and dry worlds with minimal water
- **Ice Planets**: Frozen worlds with extremely cold temperatures
- **Gas Giants**: Massive planets composed primarily of gases
- **Sun-like**: Hot, star-like planets with extreme surface conditions

Each planet's biome affects its resource generation capabilities and the types of structures that can be built on it. The biome distribution creates strategic value for different planets based on their natural characteristics.

### Planet Discovery
All planets are initially visible on the galaxy map, but they remain unclaimed until a player establishes control over them. This creates opportunities for expansion and strategic colonization as the game progresses.

## Initial Planet Selection

When a new player joins the game, they must select their starting planet from among the unclaimed planets in the galaxy. This crucial decision will serve as their initial base of operations and determine their starting position in the vast coordinate system.

### Selection Process
1. Upon successful registration, players are presented with a view of the galaxy map
2. Only unclaimed planets are available for selection
3. Players can view basic information about each planet before making their choice:
   - Planet coordinates
   - Biome type
   - Base resource generation rates
4. Once a planet is selected, it becomes the player's homeworld and cannot be changed
5. The chosen planet is immediately marked as controlled and removed from the available selection pool for other new players

### Strategic Considerations
Players should consider several factors when choosing their starting planet:
- Proximity to other players' territories
- The planet's biome and its resource generation bonuses
- Strategic position within the galaxy for future expansion
- Distance from potential threats or allies

The initial planet selection is a permanent choice that will significantly impact the player's early game strategy and development options.

## Resource Generation

Each planet's resource generation capabilities are intrinsically tied to its biome type and the structures built upon it. Resources are localized to individual planets, meaning players must manage resources separately for each planet they control.

### Biome-Specific Resource Bonuses

Different biomes provide natural bonuses to specific resource generation:

| Biome Type  | Primary Resource Bonus | Secondary Resource Bonus |
|-------------|------------------------|-------------------------|
| Water World | +20% Deuterium         | +10% Energy            |
| Arid        | +15% Metal            | +10% Science           |
| Desert      | +20% Energy           | +5% Metal              |
| Ice Planet  | +25% Deuterium        | +5% Science            |
| Gas Giant   | +30% Energy           | +15% Deuterium         |
| Sun-like    | +25% Energy           | +20% Science           |

### Resource Extraction Structures

Each resource type requires specific structures for extraction:

1. **Metal Mines**
   - Basic resource gathering structure
   - Efficiency affected by planet's surface composition
   - Higher levels increase metal production rate

2. **Energy Plants**
   - Generates energy from various sources
   - Solar plants more efficient on sun-like planets
   - Wind turbines more effective on gas giants

3. **Deuterium Synthesizers**
   - Extracts deuterium from planetary sources
   - Significantly more efficient on water and ice worlds
   - Higher energy consumption at higher levels

4. **Research Laboratories**
   - Generates science points
   - Efficiency boosted by planet's atmospheric conditions
   - Multiple labs on same planet provide diminishing returns

### Resource Management

- Resources are planet-specific and cannot be automatically shared between planets
- Players must manually transfer resources between planets using transport ships
- Production rates are affected by:
  - Base planet biome bonuses
  - Structure levels
  - Planet's position relative to the system's star (for energy production)
  - Available workforce and automation level

### Military and Utility Structures

1. **Shipyard**
   - Constructs various types of spaceships
   - Higher levels reduce build time and unlock advanced ship designs
   - Can queue multiple ship construction orders

2. **Defense Factory**
   - Produces planetary defense systems
   - Includes missile launchers, shield generators, and defense turrets
   - Structures remain permanently on planet unless destroyed
### Available Ships

1. **Colony Ships**
   - Required for expanding to new planets
   - Carries necessary equipment and initial colonists
   - Attack: 10, Defense: 50
   - Speed: Slow (2000 units/hour)
   - Cargo Capacity: 5000 units
   - High resource cost but essential for empire growth

2. **Transport Ships**
   - Moves resources between planets
   - Various sizes available for different cargo capacities
   - Attack: 5, Defense: 25
   - Speed: Medium (3000 units/hour)
   - Cargo Capacity: 25000 units
   - Speed and cargo space trade-offs

3. **Spy Probes**
   - Gathers intelligence on other planets
   - Can detect resource levels and structures
   - Attack: 0, Defense: 1
   - Speed: Very Fast (10000 units/hour)
   - Cargo Capacity: 0 units
   - Small, fast, but vulnerable to defense systems

4. **Recycler Ships**
   - Specialized for collecting debris after battles
   - Can only collect from debris fields
   - Attack: 1, Defense: 20
   - Speed: Slow (1500 units/hour)
   - Cargo Capacity: 20000 units
   - Essential for resource recovery after conflicts

5. **Cruisers**
   - Fast and powerful combat vessels
   - Excellent for both attack and defense
   - Attack: 400, Defense: 200
   - Speed: Fast (6000 units/hour)
   - Cargo Capacity: 1000 units
   - Backbone of any combat fleet

### Ship Management

- Ships remain stationed at their home planet until given orders
- Each ship type has specific:
  - Resource costs
  - Build time
  - Speed and range capabilities
  - Cargo capacity (for transport ships)
- Ships can be:
  - Recalled mid-journey
  - Set for recurring missions
  - Grouped into fleets for coordinated operations

### Alliances and Player Interactions

1. **Alliance System**
   - Players can form alliances with other players
   - Alliance members share:
     - Private alliance chat channel
     - Ability to coordinate strategies
     - Diplomatic status visibility
   - Alliances can be broken at any time
   - No mechanical restrictions on attacking alliance members

2. **Resource Trading**
   - Transport ships can deliver resources to any player
   - Process:
     - Ships travel to destination planet
     - Resources are automatically unloaded
     - Ships return to origin planet
   - Trading possible with both allies and non-allies

3. **Combat System**
   - Battle outcomes determined by:
     - Attacking fleet strength
     - Planetary defense structures
     - Stationed defensive ships
   - Combat results in:
     - Ship and structure losses
     - Debris field creation
     - Potential resource plunder

4. **Debris Fields**
   - Created after battles
   - Contains:
     - Salvageable metal
     - Salvageable deuterium
   - Special recycler ships required for collection
   - Only portion of destroyed resources recoverable
   - First-come-first-served basis for collection

5. **Diplomatic Flexibility**
   - No permanent allegiances
   - Strategic betrayal possible
   - Combat enabled between all players regardless of alliance status
   - Encourages dynamic political landscape

## Galactic Council

The Galactic Council serves as the governing body and game master of the galaxy, wielding significant influence over the game's rules and mechanics.

### Council Authority
- Acts as the supreme administrative entity
- Can modify game rules and mechanics
- Maintains balance and fairness in the galaxy
- Oversees major conflicts and diplomatic situations

### Council Powers
1. **Rule Modifications**
   - Can adjust resource generation rates
   - Modify ship and structure costs
   - Update combat mechanics
   - Implement temporary or permanent rule changes

2. **Special Events**
   - Can trigger galaxy-wide events
   - Create temporary anomalies or opportunities
   - Establish neutral zones or restricted areas
   - Introduce special challenges or missions

3. **Diplomatic Oversight**
   - Mediate major conflicts between alliances
   - Enforce peace treaties when necessary
   - Issue sanctions against aggressive players
   - Create safe zones for new players

### Council Interventions
The Council may intervene in various situations to:
- Balance gameplay mechanics
- Address exploits or unfair advantages
- Protect new players from excessive aggression
- Maintain healthy competition in the galaxy
