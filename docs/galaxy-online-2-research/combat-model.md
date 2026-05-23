# Combat model inicial — Star Empire Commander (SEC)

Objetivo: un modelo de combate inspirado en la idea “flotas + módulos + comandante”, pero con reglas y fórmulas **propias**.

## Conceptos

- Combate **asíncrono**: se resuelve en backend y se entrega un reporte reproducible.
- Determinista: `seed` + `ruleset_version` + inputs => mismo resultado.
- Campo: instancia por “celdas” (grid simple) para posicionamiento.

## Stats de nave (propuesta)

Por blueprint (base) + loadout (módulos) + buffs (comandante):
- `hp` (durabilidad/estructura)
- `shield`
- `armor` (reducción plana o por tipo)
- `speed` (turn order + reposition)
- `range`
- `accuracy`
- `evasion`
- `crit_rate`, `crit_mult`
- `damage_profile`: split por tipos (p.ej. Thermal/Kinetic/EM/Explosive — nombres a definir)

## Comandante (propuesta)

4 atributos (nombres propios SEC):
- `precision` (hit/crit synergy)
- `maneuver` (evasion + initiative)
- `command` (buff scaling + formation)
- `overcharge` (procs/skills)

Expertise:
- `weapon_expertise` por familias (p.ej. beam, projectile, missile)
- `hull_expertise` por clases (frigate/cruiser/battleship/capital)

## Formación / targeting

- Formation = posiciones iniciales por stack.
- Targeting por reglas simples:
  1) si hay “taunt/guard”, priorizar
  2) si no, nearest-in-range
  3) tie-break por threat (dps) y random(seed)

## Turnos

Tick-based por rounds:
1) Determinar orden por `initiative = speed + commander_bonus + rng(seed)`
2) Movimiento (si aplica) con costo por celda
3) Ataque: seleccionar arma/módulo listo
4) Aplicar daño y estados

## Cálculo de daño (propio)

Para cada “hit”:
- `hitChance = clamp( base + accuracy - evasion, min, max )`
- Si hit:
  - `raw = weaponDamage * (1 + attackBonus)`
  - `mitigated = raw * (1 - resist[type]) - flatArmor`
  - Aplicar a shield primero, overflow a hp
  - Crit: `mitigated *= crit_mult` con prob `crit_rate`

Resistencias:
- Resistencias por tipo se suman por módulos hasta un cap.

## Reporte de batalla

Debe incluir:
- Resumen: ganador, pérdidas, duración, loot
- Timeline por round: movimientos, targets, hits/crits, procs
- Auditoría: `seed`, `ruleset_version`, hashes de input

## Simulador

MVP:
- Script/endpoint que toma dos flotas y devuelve `BattleResult`.
- Para balance: ejecutar Monte Carlo con seeds distintos y comparar winrates.

