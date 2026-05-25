/**
 * EXPORTACIONES CENTRALIZADAS - SISTEMA DE DATOS DEL JUEGO
 * Galaxy Online II - MADSJEEZ
 * 
 * Este archivo exporta todos los datos, tipos y utilidades del juego
 */

// ============================================
// DATOS DE EDIFICIOS
// ============================================
export {
  ALL_BUILDINGS_COMPLETE,
  getBuildingById,
  calculateUpgradeCost as calculateBuildingUpgradeCost,
  calculateTotalProduction,
  type BuildingComplete,
  type BuildingLevel
} from './buildings-complete';

// ============================================
// DATOS DE INVESTIGACIONES
// ============================================
export {
  ALL_RESEARCH_COMPLETE,
  RESEARCH_TREE,
  getResearchById,
  canResearch,
  getResearchPath,
  type ResearchComplete,
  type ResearchLevel
} from './research-complete';

// ============================================
// DATOS DE NAVES
// ============================================
export {
  ALL_HULLS,
  ALL_MODULES,
  frigates,
  cruisers,
  battleships,
  specialHulls,
  ballisticWeapons,
  directionalWeapons,
  missileWeapons,
  structureModules,
  shieldModules,
  auxiliaryModules,
  getHullById,
  getModuleById,
  getHullsByType,
  getModulesByType,
  calculateShipStats,
  type HullType,
  type ModuleType,
  type ShipHull,
  type ShipModule
} from './ships-complete';

// ============================================
// DATOS DE DEFENSAS
// ============================================
export {
  ALL_DEFENSES,
  spaceStation,
  meteorStar,
  particleCannon,
  antiAirGun,
  thorsCannon,
  planetaryShield,
  orbitalDefenseGrid,
  getDefenseById,
  calculateTotalDefense,
  calculateDefenseDamage,
  calculateDefenseCost,
  type DefenseStructure,
  type DefenseLevel,
  type DefenseStats
} from './defenses-complete';

// ============================================
// DATOS DE INSTANCIAS Y RECOMPENSAS
// ============================================
export {
  ALL_INSTANCES,
  normalInstances,
  restrictedInstances,
  constellationInstances,
  humaroidInstances,
  DAILY_REWARDS,
  ACHIEVEMENTS,
  DAILY_MISSIONS,
  getInstanceById,
  getInstancesByType,
  getInstancesByDifficulty,
  calculateTotalRewards,
  canAccessInstance,
  type GameInstance,
  type InstanceType,
  type Difficulty,
  type Reward,
  type RewardType,
  type InstanceStage,
  type Achievement,
  type DailyMission
} from './instances-complete';

// ============================================
// SISTEMA ECONÓMICO
// ============================================
export {
  ECONOMY_CONFIG,
  EconomySystem,
  calculateProduction,
  calculateStorageCapacity,
  calculateUpgradeCost,
  calculateBuildTime,
  calculateEnergyBalance,
  calculateResourceState,
  calculateShipBuildCost,
  calculateTrade,
  validateEconomyState,
  type ResourceSnapshot,
  type ProductionSnapshot,
  type EnergyBalance,
  type ShipBuildCost,
  type TradeRate,
  type EconomyValidation
} from './economy-system';

// ============================================
// SISTEMA DE COMANDANTES
// ============================================
export {
  ALL_COMMANDERS,
  commonCommanders,
  rareCommanders,
  epicCommanders,
  legendaryCommanders,
  divineCommanders,
  COMMANDER_LEVELS,
  COMMANDER_GEMS,
  BIONIC_CHIPS,
  getCommanderById,
  getCommandersByRarity,
  getCommandersByRole,
  calculateCommanderStats,
  calculateExpToLevel,
  canEquipGem,
  canEquipChip,
  getDropRateByRarity,
  CommanderSystem,
  type CommanderRarity,
  type CommanderRole,
  type CommanderStats,
  type CommanderAbility,
  type CommanderGem,
  type BionicChip,
  type CommanderLevel
} from './commanders-complete';

// ============================================
// SPACE STATION
// ============================================
export {
  ALL_STATION_MODULES,
  stationCore,
  hangarModule,
  weaponPlatform,
  shieldGenerator,
  radarArray,
  repairBay,
  tradingPost,
  stationResearchLab,
  resourceSilo,
  defenseTurret,
  SPACE_STATION_CONFIG,
  DEFAULT_DEFENSIVE_FLEETS,
  calculateStationStats,
  calculateStationTotalCost,
  calculateStationCombatStats,
  getModuleById as getStationModuleById,
  getModulesByType as getStationModulesByType,
  canInstallModule,
  getUpgradeCostForModule,
  SpaceStationSystem,
  type StationModuleType,
  type StationModule,
  type StationModuleLevel,
  type DefensiveFleet,
  type StationStats
} from './space-station-complete';

// ============================================
// SISTEMA PvP
// ============================================
export {
  ARENA_CONFIG,
  ARENA_RANKS,
  LEAGUE_TIERS,
  CURRENT_SEASON,
  WEEKLY_CHAMPIONSHIP,
  MONTHLY_CHAMPIONSHIP,
  HONOR_TITLES,
  calculateMatchmaking,
  calculateLeaguePoints,
  getLeagueTierByPoints,
  getArenaRankByPosition,
  getHonorTitle,
  getDailyRewards,
  calculateDecay,
  PvPSystem,
  type PvPType,
  type LeagueTierType,
  type LeagueTier,
  type PvPRewards,
  type PvPPlayer,
  type ArenaRank,
  type ArenaMatch,
  type Championship,
  type BattleReplay
} from './pvp-system';

// ============================================
// SISTEMA DE ITEMS
// ============================================
export {
  ALL_ITEMS,
  BLUEPRINTS,
  CHESTS,
  CONSUMABLES,
  LIFE_BOATS,
  DEVELOPMENT_ITEMS,
  MATERIALS,
  SPECIAL_ITEMS,
  getItemById,
  getItemsByType,
  getItemsByRarity,
  getBlueprints,
  getChestById,
  getConsumableById,
  getLifeBoatById,
  openChest,
  calculateItemSellPrice,
  getDropRate,
  ItemSystem,
  type ItemRarity,
  type ItemType,
  type ConsumableEffect,
  type Item,
  type Blueprint,
  type Chest,
  type Consumable,
  type LifeBoat,
  type DevelopmentItem
} from './items-complete';

// ============================================
// CORP/ALIANZA
// ============================================
export {
  CORP_RANKS,
  CORP_SIZES,
  CORP_TECHNOLOGIES,
  CORP_MISSIONS,
  CORP_STORE_ITEMS,
  HELP_SYSTEM_CONFIG,
  CORP_CREATION_COST,
  CORP_CREATION_REQUIREMENTS,
  createCorp,
  calculateAllianceBonuses,
  calculateContributionPoints,
  calculateCorpExpGain,
  calculateCorpLevel,
  getNextLevelExp,
  getCorpRankInfo,
  canPerformAction,
  getMaxMembersForSize,
  isRankHigher,
  canPromote,
  CorpSystem,
  type CorpRank,
  type CorpSize,
  type CorpActivity,
  type CorpMember,
  type Corp,
  type CorpRankInfo,
  type CorpTechnology,
  type CorpMission,
  type CorpStore,
  type CorpWar,
  type AllianceBonuses,
  type HelpRequest
} from './corp-alliance';

// ============================================
// SISTEMA DE COMBATE
// ============================================
export {
  CONSTELLATION_STARS,
  COMBAT_TYPE_MODIFIERS,
  calculateCommanderCombatBonus,
  calculateCompleteShipStats,
  calculateDamage,
  calculateFleetDamage,
  applyStarBonuses,
  applyCombatTypeModifiers,
  CombatSystem,
  type CombatType,
  type DamageType,
  type RangeType,
  type ShipCombatStats,
  type CommanderCombatBonus,
  type StarBonus,
  type CompleteShipStats,
  type DamageResult,
  type FleetDamageResult
} from './combat-system';

// ============================================
// SISTEMA DE SHOP Y GACHA
// ============================================
export {
  CURRENCY_RATES,
  GACHA_SYSTEMS,
  GACHA_COMMANDERS_POOL,
  FUSION_RECIPES,
  SHOP_ITEMS,
  SHOP_OFFERS,
  RAFFLE_EVENTS,
  PURCHASE_EVENTS,
  calculateGachaDrop,
  calculateFusion,
  calculateDiscountedPrice,
  getGachaSystem,
  getCommanderDropRate,
  getFusionRecipe,
  getActiveOffers,
  ShopGachaSystem,
  type CurrencyType,
  type ShopCategory,
  type GachaType,
  type OfferType,
  type GachaProbabilities,
  type GachaCommander,
  type FusionRecipe,
  type ShopItem,
  type ShopOffer,
  type RaffleEvent,
  type PurchaseEvent
} from './shop-gacha-system';

// ============================================
// SISTEMA DE MISIONES Y QUESTS
// ============================================
export {
  MAIN_STORY_QUESTS,
  SIDE_QUESTS,
  CHAIN_QUESTS,
  HIDDEN_QUESTS,
  ALL_QUESTS,
  QuestSystem,
  type QuestType,
  type QuestDifficulty,
  type QuestStatus,
  type QuestObjectiveType,
  type QuestObjective,
  type QuestReward,
  type Quest,
  type QuestNotification
} from './quest-system';

// ============================================
// SISTEMA DE PLANETAS Y COLONIZACIÓN
// ============================================
export {
  PLANET_TYPE_CONFIG,
  COLONIZATION_COSTS,
  TERRAFORM_LEVELS,
  PLANET_ARTIFACTS,
  NEW_PLAYER_PROTECTION,
  generatePlanet,
  calculateColonizationCost,
  calculateTerraformCost,
  getPlanetTypeInfo,
  getResourceBonus,
  PlanetColonizationSystem,
  type PlanetType,
  type PlanetSize,
  type PlanetRarity,
  type PlanetClimate,
  type PlanetAtmosphere,
  type PlanetResourceBonus,
  type PlanetBuildingSlots,
  type Planet,
  type ColonizationCost,
  type TerraformLevel,
  type PlanetArtifact
} from './planet-colonization';

// ============================================
// SISTEMA DE EVENTOS TEMPORALES
// ============================================
export {
  ANNUAL_EVENTS,
  WEEKLY_EVENTS,
  FLASH_EVENTS,
  COMPETITIONS,
  generateEventCalendar,
  getActiveBonuses,
  calculateBonusValue,
  EventsSystem,
  type EventType,
  type EventStatus,
  type EventBonus,
  type GameEvent,
  type Competition,
  type EventCalendar
} from './events-system';

// ============================================
// SISTEMA DE LOGROS Y ACHIEVEMENTS
// ============================================
export {
  COMBAT_ACHIEVEMENTS,
  ECONOMY_ACHIEVEMENTS,
  RESEARCH_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  EXPLORATION_ACHIEVEMENTS,
  COLLECTION_ACHIEVEMENTS,
  SPECIAL_ACHIEVEMENTS,
  SECRET_ACHIEVEMENTS,
  ALL_ACHIEVEMENTS,
  ACHIEVEMENT_POINTS_REWARDS,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByTier,
  calculateTotalPoints,
  getPointsReward,
  AchievementsSystem,
  type AchievementCategory,
  type AchievementTier,
  type AchievementRequirement,
  type PlayerAchievement
} from './achievements-system';

// ============================================
// SISTEMA SOCIAL
// ============================================
export {
  CHAT_CHANNELS,
  MAIL_LIMITS,
  REPUTATION_RANKS,
  REFERRAL_REWARDS,
  getChatChannelInfo,
  canUseChannel,
  calculateReputationRank,
  getReferralRewards,
  SocialSystem,
  type FriendStatus,
  type Friend,
  type ChatChannel,
  type ChatMessage,
  type ChatChannelInfo,
  type MailType,
  type MailAttachment,
  type MailMessage,
  type BlockedPlayer,
  type ReputationType,
  type Reputation,
  type Referral
} from './social-system';

// ============================================
// SISTEMA DE RANKINGS
// ============================================
export {
  RANKING_REWARDS,
  ARENA_LEAGUES,
  SEASONS,
  BATTLE_PASS,
  getRankingRewards,
  getLeagueByRating,
  getCurrentSeason,
  getBattlePassTier,
  calculateRankChange,
  RankingsSystem,
  type RankingType,
  type RankingPeriod,
  type RankingEntry,
  type Ranking,
  type RankingReward,
  type League,
  type Season,
  type BattlePassTier,
  type BattlePass
} from './rankings-system';

// ============================================
// SISTEMA DE MOVIMIENTO Y NAVEGACIÓN
// ============================================
export {
  MOVEMENT_MODES,
  TRAJECTORY_TYPES,
  FORMATIONS,
  MOVEMENT_EFFECTS,
  MOVEMENT_SOUNDS,
  calculateTravelTime,
  calculateFuelConsumption,
  getOptimalTrajectory,
  getFormationBonus,
  ShipMovementSystem,
  type MovementMode,
  type MovementStats,
  type TrajectoryType,
  type Trajectory,
  type FormationType,
  type Formation,
  type MovementEffect,
  type MovementSound
} from './ship-movement';

// ============================================
// SISTEMA DE EFECTOS VISUALES Y SONIDOS
// ============================================
export {
  WEAPON_FX,
  EXPLOSION_FX,
  SHIELD_FX,
  ABILITY_FX,
  AMBIENT_SOUNDS,
  DEFAULT_AUDIO_SETTINGS,
  getWeaponFX,
  getExplosionFX,
  getShieldFX,
  getAbilityFX,
  getAmbientSounds,
  CombatFXSounds,
  type FXIntensity,
  type WeaponFX,
  type ExplosionFX,
  type ShieldFX,
  type AbilityFX,
  type AmbientSound
} from './combat-fx-sounds';

// ============================================
// SISTEMA DE TUTORIALES
// ============================================
// NOTA: FXCategory se exporta desde fx-system-complete.ts (efectos visuales)
// El tipo de audio se usa como AudioFXCategory desde combat-fx-sounds.ts
export {
  MAIN_TUTORIALS,
  INFO_CARDS,
  CONTEXTUAL_TOOLTIPS,
  DIFFICULTY_PRESETS,
  getTutorialById,
  getTutorialsByType,
  getAvailableTutorials,
  getInfoCardById,
  getInfoCardsByCategory,
  getDifficultyPreset,
  calculateDifficultyModifiers,
  TutorialSystem,
  type TutorialStepType,
  type Tutorial,
  type InfoCard,
  type ContextualTooltip,
  type DifficultyPreset
} from './tutorials';

// ============================================
// SISTEMA PvP EN TIEMPO REAL
// ============================================
export {
  PVP_MAPS,
  GAME_MODE_CONFIGS,
  SPECTATOR_CONFIG,
  getMapById,
  getMapsByMode,
  getGameModeConfig,
  calculateMatchDuration,
  PvPRealTimeSystem,
  type RealTimePvPType,
  type MatchStatus,
  type RealTimePlayer,
  type RealTimeMatch,
  type PvPMap,
  type GameModeConfig,
  type SpectatorMode
} from './pvp-realtime';

// ============================================
// SISTEMA DE GUERRAS
// ============================================
export {
  WAR_DECLARATION_COSTS,
  WAR_PHASES,
  WAR_EXHAUSTION_CALCULATION,
  BATTLE_TYPES,
  HISTORIC_WARS,
  calculateWarDeclarationCost,
  calculateWarExhaustion,
  getBattleType,
  calculateBattleScore,
  getWarPhaseConfig,
  canDeclareWar,
  WarSystem,
  type WarType,
  type WarStatus,
  type WarPhase,
  type WarParticipant,
  type WarObjective,
  type WarBattle,
  type War,
  type WarDeclarationCost,
  type WarPhaseConfig,
  type WarExhaustionFactors,
  type BattleType,
  type PeaceTreaty
} from './war-system';

// ============================================
// SISTEMA DE RECOLECCIÓN DE RECURSOS
// ============================================
export {
  RESOURCE_PLANET_TYPES,
  RESOURCE_PLANET_TIERS,
  MINING_SHIPS,
  MINING_TECHNOLOGIES,
  MINING_EVENTS,
  EXAMPLE_RESOURCE_PLANETS,
  calculateMiningYield,
  getMiningShipById,
  getResourcePlanetTierConfig,
  canMinePlanet,
  generateResourcePlanet,
  ResourceCollectionSystem,
  type ResourcePlanetType,
  type ResourcePlanetTier,
  type ResourceRichness,
  type ResourceDeposit,
  type ResourcePlanet,
  type MiningShip,
  type MiningTechnology,
  type MiningOperation,
  type MiningEventType,
  type MiningEvent
} from './resource-collection';

// ============================================
// ESPECIFICACIONES DE ASSETS VISUALES
// ============================================
export {
  TUTORIAL_IMAGES,
  INFO_CARD_IMAGES,
  UI_ICONS_SPEC,
  ASSETS_SUMMARY,
  getCriticalImages,
  getImagesByCategory,
  getImageById,
  VisualAssetsSpec,
  type ImageSpec
} from './visual-assets-spec';

// ============================================
// SISTEMA COMPLETO DE FX
// ============================================
export {
  FX_PERFORMANCE_CONFIG,
  SHIELD_SYSTEMS,
  EXPLOSION_SYSTEMS,
  VISUAL_STRATEGIES,
  DIFFICULTY_VISUAL_SETTINGS,
  GAME_VISUAL_DIRECTION,
  FX_PROGRAMMING_METHODS,
  FX_OPTIMIZATION_TECHNIQUES,
  FXSystemComplete,
  getExplosionByCategory,
  getShieldByType,
  getVisualStrategyByCategory,
  getOptimizationForQuality,
  calculateFXBudget,
  type FXCategory,
  type FXPriority,
  type FXComplexity,
  type FXPerformanceConfig,
  type ShieldSystem,
  type ExplosionSystem,
  type VisualStrategy,
  type DifficultyVisualSettings,
  type VisualDirection,
  type FXProgrammingMethods,
  type FXOptimizationTechniques
} from './fx-system-complete';

// ============================================
// SISTEMA DE ESPIONAJE
// ============================================
export {
  SPY_EQUIPMENT,
  DEFAULT_AGENTS,
  ESPIONAGE_MISSION_TEMPLATES,
  COUNTER_INTEL_SYSTEMS,
  EspionageSystem,
  calculateMissionSuccess,
  getEquipmentByType,
  getAgentBySpecialization,
  estimateMissionDuration,
  type EspionageType,
  type EspionageStatus,
  type SpyAgent,
  type SpyEquipment,
  type SpyMissionHistory,
  type EspionageMission,
  type EspionageReward,
  type EspionagePenalty,
  type EspionagePhase,
  type EspionageEvent,
  type IntelData,
  type IntelDatabase,
  type IntelThreat,
  type IntelOpportunity,
  type IntelPattern,
  type CounterIntelligence,
  type CounterIntelSystem,
  type CounterIntelOperation,
  type IntelBreach
} from './espionage-system';

// ============================================
// SISTEMA DE DIPLOMACIA
// ============================================
export {
  DIPLOMATIC_ACTIONS,
  STANDARD_TREATIES,
  DiplomacySystem,
  calculateOpinion,
  canPerformAction as canPerformDiplomaticAction,
  getTreatyByType,
  calculateTradeProfit as calculateDiplomaticTradeProfit,
  type DiplomaticRelation,
  type DiplomaticAction,
  type DiplomaticEntity,
  type DiplomaticRelationEntry,
  type OpinionModifier,
  type Treaty,
  type TreatyType,
  type TreatyTerm,
  type Embassy,
  type TradeAgreement,
  type TradeParty,
  type TradeRoute,
  type TradeGood,
  type InterstellarMarket,
  type DiplomaticHistoryEntry
} from './diplomacy-system';

// ============================================
// SISTEMA DE PIRATERÍA
// ============================================
export {
  PIRATE_FACTIONS,
  PIRATE_RISK_ZONES,
  PiracySystem,
  calculateRaidSuccess,
  getPirateRisk,
  getPiratesInSystem,
  calculateBountyValue,
  type PirateType,
  type PirateFleetSize,
  type PirateNPC,
  type PirateHideout,
  type PatrolRoute,
  type Raid,
  type LetterOfMarque,
  type Bounty,
  type AntiPiracyMeasures,
  type PirateRiskZone,
  type PirateEconomy
} from './piracy-system';

// ============================================
// SISTEMA DE COMERCIO INTERESTELAR
// ============================================
export {
  MAJOR_TRADE_ROUTES,
  REGIONAL_MARKETS,
  TRADE_GOODS,
  InterstellarTradeSystem,
  calculateTradeProfit,
  findBestTradeRoute,
  predictPrice,
  getMarketBySystem,
  getRoutesFromSystem,
  type InterstellarTradeRoute,
  type TradeCaravan,
  type RegionalMarket,
  type PriceSystem,
  type TrackedGood
} from './interstellar-trade-system';

// ============================================
// SISTEMA DE METEOROLOGÍA ESPACIAL
// ============================================
export {
  SPACE_WEATHER_PHENOMENA,
  WEATHER_STATIONS,
  SpaceWeatherSystem,
  calculateWeatherRisk,
  getWeatherBySystem,
  getWeatherStationBySystem,
  predictWeatherWindow,
  type SpaceWeather,
  type SpaceWeatherType,
  type SpaceWeatherSeverity,
  type WeatherForecast,
  type WeatherStation,
  type WeatherNavigation
} from './space-weather-system';

// ============================================
// SISTEMA DE ANOMALÍAS ESPACIALES
// ============================================
export {
  SPACE_ANOMALIES,
  AnomaliesSystem,
  calculateAnomalyRisk,
  getAnomalyBySystem,
  getAnomalyByRarity,
  getUndiscoveredAnomalies,
  calculateResearchReward,
  type AnomalyType,
  type AnomalyRarity,
  type SpaceAnomaly,
  type AnomalyExpedition,
  type AnomalyCatalog
} from './anomalies-system';

// ============================================
// SISTEMA DE ARQUEOLOGÍA ESPACIAL
// ============================================
export {
  ARCHAEOLOGICAL_SITES,
  ANCIENT_TECHNOLOGIES,
  ArchaeologySystem,
  calculateExcavationSuccess,
  getSiteBySystem,
  getSitesByCivilization,
  getUndiscoveredSites,
  calculateArtifactValue,
  canUnlockTechnology,
  type ArchaeologicalSiteType,
  type SiteAge,
  type ArchaeologicalSite,
  type ArchaeologicalExpedition,
  type ExcavatedArtifact,
  type Museum
} from './archaeology-system';

// ============================================
// SISTEMA DE MORAL
// ============================================
export {
  MORALE_MECHANICS,
  CHARISMATIC_LEADERS,
  MoraleSystem,
  calculateMoraleLevel,
  getMoraleEffects,
  calculateMoraleChange,
  calculateDesertionRisk,
  getLeaderByStyle,
  type MoraleLevel,
  type TroopMorale,
  type CharismaticLeader,
  type MoraleEvent,
  type Fanaticism,
  type DesertionSystem
} from './morale-system';

// ============================================
// SISTEMA DE SUMINISTROS
// ============================================
// NOTA: Sistema de suministros no implementado aún
// export {
//   SUPPLY_MECHANICS,
//   SupplySystem,
//   calculateConsumption,
//   calculateDaysRemaining,
//   getResupplyPointsInRange,
//   calculateOptimalRoute,
//   checkSupplyShortage,
//   type SupplyType,
//   type Supply,
//   type SupplyInventory,
//   type FleetSupplyManagement,
//   type ResupplyPoint
// } from './supply-system';

// ============================================
// SISTEMA DE TÍTULOS
// ============================================
export {
  TITLES,
  TitlesSystem,
  getTitleById,
  getTitlesByCategory,
  getTitlesByRarity,
  getUnlockedTitles,
  getNextUnlockableTitles,
  calculateTitleBenefits,
  checkTitleUnlock,
  getRarityMultiplier,
  type TitleCategory,
  type TitleRarity,
  type Title,
  type TitleProgress,
  type TitleCatalog
} from './titles-system';

// ============================================
// SISTEMA DE NOTAS/REGISTROS (Diario del Capitán)
// ============================================
export {
  LOG_TEMPLATES,
  CaptainLogsSystem,
  generateStardate,
  createLogEntry,
  analyzeBattlePerformance,
  getLogsByType,
  getLogsByImportance,
  searchLogs,
  calculateWritingStats,
  type LogType,
  type LogImportance,
  type CaptainLog,
  type CaptainDiary,
  type BattleRecord,
  type PersonalHistory
} from './captain-logs-system';

// ============================================
// SISTEMA DE GUÍAS COMUNITARIAS
// ============================================
export {
  PREDEFINED_GUIDES,
  CommunityGuidesSystem,
  calculateGuideScore,
  shouldFeatureGuide,
  findGuidesByTag,
  findGuidesByType,
  findGuidesByDifficulty,
  searchGuides,
  sortGuidesByRating,
  sortGuidesByRecency,
  getPopularTags,
  type GuideType,
  type GuideDifficulty,
  type Guide,
  type GuideSection,
  type QuizQuestion,
  type CalculatorWidget,
  type VotingSystem,
  type CommunityPoll,
  type GameWiki,
  type WikiCategory,
  type WikiArticle,
  type WikiEditor
} from './community-guides-system';

// ============================================
// SISTEMA DE STREAMING INTEGRADO
// ============================================
export {
  DEFAULT_CHAT_COMMANDS,
  StreamingSystem,
  calculateStreamScore,
  getActiveStreams,
  getStreamsByType,
  getRecommendedStreams,
  createSpectatorMode,
  generateStreamThumbnail,
  type StreamType,
  type StreamQuality,
  type GameStream,
  type StreamingSpectatorMode,
  type StreamPoll,
  type StreamPrediction,
  type CommentedReplay,
  type LiveTournament,
  type StreamerSettings,
  type Viewer
} from './streaming-system';

// ============================================
// SISTEMA DE TELEMETRÍA
// ============================================
export {
  PREDEFINED_FUNNELS,
  TelemetrySystem,
  generateSessionId,
  trackEvent,
  calculateRetentionRate,
  getHeatmapForArea,
  analyzeFunnel,
  aggregateMetrics,
  type TelemetryEventType,
  type TelemetrySeverity,
  type TelemetryEvent,
  type GameMetrics,
  type HeatmapData,
  type RealtimeAnalytics,
  type ConversionFunnel,
  type TelemetryConfig
} from './telemetry-system';

// ============================================
// SISTEMA DE ANTI-CHEAT
// ============================================
export {
  SANCTION_TEMPLATES,
  AntiCheatSystem,
  calculateTrustScore,
  determineSanction,
  analyzeStatisticalAnomaly,
  canAppeal,
  getSanctionDuration,
  type CheatType,
  type DetectionConfidence,
  type CheatDetection,
  type AutomatedDetection,
  type PlayerReport,
  type Sanction,
  type SanctionHistory,
  type StatisticalAnalysis,
  type AntiCheatConfig
} from './anti-cheat-system';

// ============================================
// SISTEMA DE MODERACIÓN
// ============================================
export {
  DEFAULT_MODERATION_RULES,
  TICKET_CATEGORIES,
  ModerationSystem,
  checkContentAgainstRules,
  calculateTicketPriority,
  assignTicket,
  escalateTicket,
  getSLADeadline,
  isContentAppropriate,
  type ModerationContentType,
  type ModerationSeverity,
  type ModerationRule,
  type ModeratedContent,
  type ChatFilter,
  type SupportTicket,
  type ModerationTeam,
  type MuteSystem
} from './moderation-system';

// ============================================
// SISTEMA DE BACKUP/RESTORE
// ============================================
export {
  createBackup,
  validateBackup,
  restoreBackup,
  migrateData,
  calculateRollbackImpact,
  BackupRestoreSystem,
  type BackupType,
  type BackupScope,
  type Backup,
  type AccountData,
  type CharacterData,
  type InventoryData,
  type ProgressData,
  type SettingsData,
  type AchievementData,
  type RelationsData,
  type MigrationData,
  type RollbackSystem,
  type BackupConfig
} from './backup-restore-system';

// ============================================
// SISTEMA DE A/B TESTING
// ============================================
export {
  SAMPLE_EXPERIMENTS,
  assignVariant,
  calculateSampleSize,
  isExperimentValid,
  determineWinner,
  shouldStopEarly,
  ABTestingSystem,
  type ExperimentType,
  type ExperimentStatus,
  type Experiment,
  type Variant,
  type MetricConfig,
  type SegmentConfig,
  type ExperimentResults,
  type MetricResult,
  type VariantAssignment,
  type ExperimentEvent,
  type ABTestConfig
} from './ab-testing-system';

// ============================================
// SISTEMA DE LOCALIZACIÓN
// ============================================
export {
  LANGUAGE_CONFIGS,
  getLanguageConfig,
  getSupportedLanguages,
  getFullySupportedLanguages,
  getRTLLanguages,
  formatNumber,
  formatDate,
  getTextDirection,
  translate,
  pluralize,
  LocalizationSystem,
  type SupportedLanguage,
  type LanguageConfig,
  type Translation,
  type TranslationCategory,
  type GameText,
  type CulturalAdaptation
} from './localization-system';

// ============================================
// SISTEMA DE NOTICIAS Y COMUNICACIONES
// ============================================
export {
  NewsSystem,
  createNewsArticle,
  formatReadingTime,
  getArticlesByType,
  getFeaturedArticles,
  getRelatedArticles,
  scheduleAnnouncement,
  type NewsArticle,
  type PatchNotes,
  type Announcement,
  type OfficialCommunication,
  type PushNotification,
  type NewsSystemConfig,
  type NewsType,
  type NewsPriority
} from './news-system';

// ============================================
// SISTEMA DE CALENDARIO Y EVENTOS ESTACIONALES
// ============================================
export {
  CalendarSystem,
  PREDEFINED_HOLIDAYS,
  createSeasonalEvent,
  isEventActive,
  getActiveEvents,
  getUpcomingEvents,
  getEventsInMonth,
  calculateEventProgress,
  formatEventDuration,
  createEventNotification,
  type SeasonalEvent,
  type GameCalendar,
  type EventNotification,
  type SeasonalEventType,
  type EventFrequency
} from './calendar-system';

// ============================================
// SISTEMA DE TUTORIAL Y AYUDA
// ============================================
export {
  BASIC_TUTORIAL,
  createTutorial,
  addTutorialStep,
  startTutorial,
  completeTutorialStep,
  isTutorialCompleted,
  getTutorialProgress,
  createHelpTopic,
  searchHelpTopics,
  type HelpTopic,
  type InteractiveGuide,
  type SmartSuggestion
} from './tutorial-system';

// ============================================
// SISTEMA DE PERSONALIZACIÓN DE AVATAR
// ============================================
export {
  AvatarSystem,
  PREDEFINED_AVATAR_COMPONENTS,
  createAvatar,
  equipComponent,
  unequipComponent,
  updateAvatarColor,
  createAvatarPreset,
  applyAvatarPreset,
  getComponentsBySlot,
  getComponentsByRarity,
  canPlayerUseComponent,
  calculateAvatarValue,
  calculateCompletionPercentage,
  type Avatar,
  type AvatarComponent,
  type AvatarPreset,
  type AvatarPhoto,
  type AvatarShop,
  type AvatarSlot,
  type AvatarGender,
  type AvatarRace
} from './avatar-system';

// ============================================
// SISTEMA DE EMOTES Y ANIMACIONES
// ============================================
export {
  EmoteSystem,
  PREDEFINED_EMOTES,
  createEmote,
  canPlayerUseEmote,
  getEmotesByCategory,
  getEmotesByRarity,
  getAvailableEmotes,
  createEmoteSequence,
  createCustomDance,
  searchEmotes,
  getPopularEmotes,
  getNewEmotes,
  type Emote,
  type EmoteSequence,
  type CustomDance,
  type Gesture,
  type EmoteCatalog,
  type EmoteCategory,
  type EmoteRarity
} from './emotes-system';

// ============================================
// SISTEMA DE CAPTURAS DE PANTALLA Y GALERÍA
// ============================================
export {
  ScreenshotSystem,
  createScreenshot,
  createAlbum,
  addScreenshotToAlbum,
  searchScreenshots,
  getScreenshotsByType,
  getPopularScreenshots,
  getRecentScreenshots,
  calculateStorageUsage,
  type Screenshot,
  type ScreenshotAlbum,
  type ImageEditor,
  type AutoCapture,
  type CommunityGallery,
  type ScreenshotType,
  type ScreenshotFormat
} from './screenshot-system';

// ============================================
// SISTEMA DE HISTORIAL Y ESTADÍSTICAS DETALLADAS
// ============================================
export {
  HistorySystem,
  createHistoryEntry,
  filterHistoryByType,
  filterHistoryByDateRange,
  calculatePlayerStats,
  analyzePatterns,
  generateReport,
  type HistoryEntry,
  type PlayerStatistics,
  type PatternAnalysis,
  type PlayerComparison,
  type HistoryReport,
  type HistoryEntryType
} from './history-system';

// ============================================
// SISTEMA DE NOTIFICACIONES Y ALERTAS
// ============================================
export {
  NotificationSystem,
  createNotification,
  scheduleNotification,
  addNotificationAction,
  markNotificationAsRead,
  recordNotificationAction,
  filterNotifications,
  getUnreadCount,
  groupNotifications,
  createNotificationTemplate,
  type Notification,
  type NotificationTemplate,
  type NotificationSubscription,
  type NotificationCampaign,
  type NotificationCenter,
  type NotificationType,
  type NotificationPriority,
  type NotificationChannel
} from './notification-system';

// ============================================
// SISTEMA DE CONFIGURACIÓN Y PREFERENCIAS
// ============================================
export {
  SettingsSystem,
  DEFAULT_SETTINGS,
  createSettingsProfile,
  applySettingsProfile,
  resetSettingsToDefault,
  validateSettings,
  exportSettings,
  importSettings,
  optimizeSettingsForHardware,
  type GameSettings,
  type SettingsProfile,
  type SettingsSync,
  type GraphicsSettings,
  type ControlsSettings,
  type InterfaceSettings,
  type GameplaySettings,
  type SettingsCategory
} from './settings-system';

// ============================================
// SISTEMA DE API Y WEBHOOKS
// ============================================
export {
  ApiSystem,
  PREDEFINED_API_ENDPOINTS,
  createApiEndpoint,
  createWebhook,
  createDeveloperApp,
  generateApiKey,
  validateApiRequest,
  generateWebhookSignature,
  verifyWebhookSignature,
  type ApiEndpoint,
  type Webhook,
  type WebhookEvent,
  type DeveloperApp,
  type ApiDocumentation,
  type ApiMonitoring,
  type ApiVersion,
  type HttpMethod
} from './api-system';

// ============================================
// SISTEMA DE INTEGRACIONES EXTERNAS
// ============================================
export {
  IntegrationSystem,
  PREDEFINED_INTEGRATIONS,
  createIntegration,
  createDiscordIntegration,
  createTwitchIntegration,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationPermissions,
  getIntegrationByType,
  getActiveIntegrations,
  calculateIntegrationHealth,
  createIntegrationWebhook,
  type Integration,
  type DiscordIntegration,
  type TwitchIntegration,
  type YouTubeIntegration,
  type IntegrationWebhook,
  type IntegrationSync,
  type IntegrationHub,
  type IntegrationType,
  type IntegrationStatus
} from './integration-system';

// ============================================
// DATOS LEGACY (Compatibilidad)
// ============================================
// Legacy data exports - Crear archivo si no existe
// export * from './legacy-data';

// ============================================
// CONFIGURACIÓN DE ECONOMÍA INICIAL
// ============================================
// Economy config exports - Crear archivo si no existe
// export * from './economyConfig';
