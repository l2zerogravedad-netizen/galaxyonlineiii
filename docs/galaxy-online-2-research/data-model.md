# Data model propuesto — Star Empire Commander (SEC)

Objetivo: un modelo de datos para MMO asíncrono con economía, colas/timers y combate reproducible.

## Entidades principales (propuesta)

### users
- `id`, `email`, `password_hash`, `created_at`, `last_login_at`, `status`
- `roles` (player/admin/mod)

### empires
- `id`, `user_id`, `name`, `created_at`, `timezone`
- `hq_planet_id`
- `xp`, `level`, `command_limit`

### planets
- `id`, `empire_id`, `name`, `type`, `x`, `y`
- `slots_ground`, `slots_orbit`
- `resources_state` (snapshot para producción)

### resources
- Catálogo: `id`, `key`, `display_name`, `is_premium`

### buildings
- Catálogo: `id`, `key`, `category` (ground/orbit), `max_level`
- `cost_formula_version`, `build_time_formula_version`

### empire_buildings
- `id`, `empire_id`, `planet_id`, `building_id`, `level`, `slot_index`

### researches
- Catálogo: `id`, `key`, `tree` (science/blueprints/etc.), `max_level`
- `effects` (JSON: modifiers)

### empire_researches
- `id`, `empire_id`, `research_id`, `level`

### ships (blueprints)
- Catálogo: `id`, `key`, `hull_class`, `tier`, `base_stats`
- `slot_layout` (weapon/defense/aux)

### modules (blueprints)
- Catálogo: `id`, `key`, `slot_type`, `tier`, `stats`, `damage_type`?

### inventory
- `id`, `empire_id`, `item_type`, `item_id`, `quantity`, `meta`

### blueprints
- `id`, `empire_id`, `blueprint_type` (ship/module), `target_id`, `level`, `xp`

### fleets
- `id`, `empire_id`, `name`, `location_planet_id`, `status` (idle/traveling/engaged)
- `formation_id`, `commander_id`

### fleet_ships
- `id`, `fleet_id`, `ship_blueprint_id`, `quantity`, `loadout` (JSON)

### commanders
- `id`, `empire_id`, `name`, `rarity`, `level`, `xp`
- `stats` (JSON), `expertises` (JSON), `skills` (JSON)

### battles
- `id`, `kind` (pve/pvp), `seed`, `ruleset_version`
- `created_at`, `resolved_at`, `status`

### battle_reports
- `id`, `battle_id`, `empire_id`, `summary`, `timeline` (JSON), `losses` (JSON)

### alliances
- `id`, `name`, `created_at`, `leader_empire_id`

### alliance_members
- `id`, `alliance_id`, `empire_id`, `role`, `joined_at`

### missions
- Catálogo: `id`, `key`, `kind`, `difficulty`, `rewards`

### events
- `id`, `key`, `starts_at`, `ends_at`, `config`

### market
- `id`, `kind` (auction/fixed), `rules`

### market_listings
- `id`, `market_id`, `seller_empire_id`, `item`, `price`, `status`, `expires_at`

## Timers y colas (infra)

Sugerencia: una tabla genérica de colas para construcciones/research/producción.

### queues
- `id`, `empire_id`, `planet_id`, `queue_type` (build/research/shipyard/etc.)
- `payload` (JSON), `starts_at`, `ends_at`, `status`

Reglas:
- El servidor es autoridad de tiempo.
- Jobs idempotentes para completar colas y resolver batallas.

