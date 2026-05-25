using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class SpaceCombatSystem : MonoBehaviour
{
    [Header("Combat Settings")]
    public float combatRange = 1000f;
    public float weaponRange = 500f;
    public float lockOnRange = 300f;
    public float combatUpdateRate = 0.1f;
    
    [Header("Combat UI")]
    public CombatHUD combatHUD;
    public TargetReticle targetReticle;
    public DamageIndicator damageIndicator;
    
    private static SpaceCombatSystem instance;
    public static SpaceCombatSystem Instance => instance;
    
    // Estado del combate
    private bool combatActive = false;
    private List<ShipController> combatParticipants = new List<ShipController>();
    private List<Projectile> activeProjectiles = new List<Projectile>();
    private Dictionary<string, CombatTarget> targets = new Dictionary<string, CombatTarget>();
    
    // Timers
    private float lastCombatUpdate = 0f;
    private float combatStartTime = 0f;
    private string currentCombatId;
    
    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Update()
    {
        if (!combatActive) return;
        
        // Actualizar combate a intervalos regulares
        if (Time.time - lastCombatUpdate >= combatUpdateRate)
        {
            UpdateCombatState();
            lastCombatUpdate = Time.time;
        }
        
        // Actualizar proyectiles
        UpdateProjectiles();
        
        // Actualizar UI
        UpdateCombatUI();
        
        // Verificar fin del combate
        CheckCombatEnd();
    }
    
    /// <summary>
    /// Inicia una sesión de combate
    /// </summary>
    public async Task<bool> StartCombat(List<string> participantIds)
    {
        Debug.Log($"Starting combat with {participantIds.Count} participants");
        
        // Crear datos de combate para el backend
        var combatData = new
        {
            participants = participantIds,
            location = new { x = 0, y = 0, z = 0 },
            battleType = "pvp"
        };
        
        // Iniciar combate en el backend
        var response = await APIController.Instance.InitiateCombat(combatData);
        
        if (response != null)
        {
            currentCombatId = response.combatId;
            combatStartTime = Time.time;
            combatActive = true;
            
            // Cargar participantes
            await LoadCombatParticipants(participantIds);
            
            // Inicializar UI de combate
            InitializeCombatUI();
            
            // Notificar a todos los participantes
            NotifyCombatStart();
            
            return true;
        }
        
        return false;
    }
    
    /// <summary>
    /// Carga los participantes del combate
    /// </summary>
    private async Task LoadCombatParticipants(List<string> participantIds)
    {
        combatParticipants.Clear();
        
        foreach (string participantId in participantIds)
        {
            // Obtener datos de la nave del backend
            var shipData = await APIController.Instance.GetShipData(participantId);
            
            if (shipData != null)
            {
                // Crear nave en el juego
                GameObject shipObj = await CreateShipFromData(shipData);
                ShipController shipController = shipObj.GetComponent<ShipController>();
                
                combatParticipants.Add(shipController);
                targets[participantId] = new CombatTarget(shipController);
            }
        }
        
        Debug.Log($"Loaded {combatParticipants.Count} combat participants");
    }
    
    /// <summary>
    /// Crea una nave desde los datos del backend
    /// </summary>
    private async Task<GameObject> CreateShipFromData(ShipData shipData)
    {
        // Cargar prefab de la nave
        GameObject shipPrefab = await LoadShipPrefab(shipData.type);
        if (shipPrefab == null)
        {
            Debug.LogError($"Failed to load ship prefab: {shipData.type}");
            return null;
        }
        
        // Instanciar nave
        GameObject ship = Instantiate(shipPrefab);
        ship.name = shipData.name;
        ship.transform.position = new Vector3(shipData.position.x, shipData.position.y, shipData.position.z);
        
        // Configurar ShipController
        ShipController controller = ship.GetComponent<ShipController>();
        controller.shipId = shipData.id;
        controller.currentHealth = shipData.health;
        controller.level = shipData.level;
        
        // Configurar equipo
        await ConfigureShipEquipment(controller, shipData.equipment);
        
        return ship;
    }
    
    /// <summary>
    /// Configura el equipo de la nave
    /// </summary>
    private async Task ConfigureShipEquipment(ShipController ship, string[] equipment)
    {
        WeaponSystem weaponSystem = ship.GetComponent<WeaponSystem>();
        
        foreach (string equipmentId in equipment)
        {
            var itemData = await APIController.Instance.GetItemData(equipmentId);
            
            if (itemData != null)
            {
                if (itemData.type == "weapon")
                {
                    weaponSystem.AddWeapon(itemData);
                }
                else if (itemData.type == "shield")
                {
                    var shield = ship.GetComponent<ShieldController>();
                    shield.ConfigureShield(itemData);
                }
                else if (itemData.type == "module")
                {
                    ship.AddModule(itemData);
                }
            }
        }
    }
    
    /// <summary>
    /// Actualiza el estado del combate
    /// </summary>
    private void UpdateCombatState()
    {
        foreach (ShipController ship in combatParticipants)
        {
            if (ship == null || ship.currentHealth <= 0) continue;
            
            // Encontrar enemigos cercanos
            var enemies = FindEnemiesInRange(ship, combatRange);
            
            if (enemies.Count > 0)
            {
                // Seleccionar objetivo
                ShipController target = SelectTarget(ship, enemies);
                
                if (target != null)
                {
                    // Apuntar al objetivo
                    ship.SetTarget(target);
                    
                    // Disparar si está en rango
                    float distance = Vector3.Distance(ship.transform.position, target.transform.position);
                    if (distance <= weaponRange)
                    {
                        ship.FireWeapons();
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// Encuentra enemigos en rango
    /// </summary>
    private List<ShipController> FindEnemiesInRange(ShipController ship, float range)
    {
        var enemies = new List<ShipController>();
        
        foreach (var otherShip in combatParticipants)
        {
            if (otherShip == null || otherShip == ship || otherShip.currentHealth <= 0) continue;
            
            float distance = Vector3.Distance(ship.transform.position, otherShip.transform.position);
            if (distance <= range)
            {
                enemies.Add(otherShip);
            }
        }
        
        return enemies;
    }
    
    /// <summary>
    /// Selecciona el mejor objetivo
    /// </summary>
    private ShipController SelectTarget(ShipController ship, List<ShipController> enemies)
    {
        ShipController bestTarget = null;
        float bestScore = float.MinValue;
        
        foreach (var enemy in enemies)
        {
            float score = CalculateTargetScore(ship, enemy);
            
            if (score > bestScore)
            {
                bestScore = score;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    }
    
    /// <summary>
    /// Calcula la puntuación de un objetivo
    /// </summary>
    private float CalculateTargetScore(ShipController ship, ShipController target)
    {
        float score = 0f;
        
        // Distancia (más cercano = mejor)
        float distance = Vector3.Distance(ship.transform.position, target.transform.position);
        score += (combatRange - distance) / combatRange * 100f;
        
        // Salud (más dañado = mejor)
        float healthPercentage = target.currentHealth / target.maxHealth;
        score += (1f - healthPercentage) * 50f;
        
        // Amenaza (más poderoso = mayor prioridad)
        float threatLevel = GetThreatLevel(target);
        score += threatLevel * 30f;
        
        return score;
    }
    
    /// <summary>
    /// Obtiene el nivel de amenaza de una nave
    /// </summary>
    private float GetThreatLevel(ShipController ship)
    {
        // Basado en el tipo y nivel de la nave
        switch (ship.shipType.ToLower())
        {
            case "fighter":
                return 0.5f + (ship.level * 0.1f);
            case "cruiser":
                return 1.0f + (ship.level * 0.2f);
            case "battleship":
                return 1.5f + (ship.level * 0.3f);
            case "carrier":
                return 2.0f + (ship.level * 0.4f);
            default:
                return 0.5f;
        }
    }
    
    /// <summary>
    /// Actualiza los proyectiles activos
    /// </summary>
    private void UpdateProjectiles()
    {
        for (int i = activeProjectiles.Count - 1; i >= 0; i--)
        {
            Projectile projectile = activeProjectiles[i];
            
            if (projectile == null)
            {
                activeProjectiles.RemoveAt(i);
                continue;
            }
            
            projectile.UpdateProjectile();
            
            if (projectile.HasHitTarget || projectile.OutOfRange)
            {
                if (projectile.HasHitTarget && projectile.target != null)
                {
                    // Aplicar daño
                    projectile.target.TakeDamage(projectile.damage);
                    
                    // Crear efectos visuales
                    CreateImpactEffects(projectile.transform.position, projectile.weaponType);
                    
                    // Actualizar UI de daño
                    damageIndicator.ShowDamage(projectile.target.transform.position, projectile.damage);
                }
                
                // Destruir proyectil
                Destroy(projectile.gameObject);
                activeProjectiles.RemoveAt(i);
            }
        }
    }
    
    /// <summary>
    /// Crea efectos de impacto
    /// </summary>
    private void CreateImpactEffects(Vector3 position, WeaponType weaponType)
    {
        // Efectos VFX
        VFXManager.Instance.CreateWeaponEffect(position, position, weaponType);
        
        // Efectos de cámara
        CameraShake.Instance.Shake(0.2f, 0.5f);
        
        // Sonido
        AudioManager.Instance.PlayImpactSound(weaponType);
    }
    
    /// <summary>
    /// Actualiza la UI de combate
    /// </summary>
    private void UpdateCombatUI()
    {
        if (combatHUD == null) return;
        
        // Actualizar lista de objetivos
        combatHUD.UpdateTargets(targets.Values);
        
        // Actualizar estado del combate
        float combatDuration = Time.time - combatStartTime;
        combatHUD.UpdateCombatStatus(combatDuration, combatParticipants.Count);
        
        // Actualizar retícula del objetivo actual
        ShipController playerShip = GetPlayerShip();
        if (playerShip != null && playerShip.currentTarget != null)
        {
            targetReticle.SetTarget(playerShip.currentTarget.transform);
        }
    }
    
    /// <summary>
    /// Verifica si el combate ha terminado
    /// </summary>
    private void CheckCombatEnd()
    {
        var aliveShips = new List<ShipController>();
        
        foreach (var ship in combatParticipants)
        {
            if (ship != null && ship.currentHealth > 0)
            {
                aliveShips.Add(ship);
            }
        }
        
        // El combate termina si queda solo un participante o ninguno
        if (aliveShips.Count <= 1)
        {
            EndCombat(aliveShips.Count > 0 ? aliveShips[0] : null);
        }
    }
    
    /// <summary>
    /// Finaliza el combate
    /// </summary>
    private async void EndCombat(ShipController winner)
    {
        combatActive = false;
        
        Debug.Log($"Combat ended. Winner: {(winner != null ? winner.name : "None")}");
        
        // Preparar resultados del combate
        var combatResults = new
        {
            combatId = currentCombatId,
            winner = winner?.shipId,
            participants = combatParticipants.ConvertAll(s => s?.shipId),
            duration = Time.time - combatStartTime,
            statistics = GenerateCombatStatistics()
        };
        
        // Enviar resultados al backend
        await APIController.Instance.EndCombat(combatResults);
        
        // Mostrar UI de resultados
        ShowCombatResults(winner, combatResults);
        
        // Limpiar estado del combate
        CleanupCombat();
    }
    
    /// <summary>
    /// Genera estadísticas del combate
    /// </summary>
    private object GenerateCombatStatistics()
    {
        var stats = new
        {
            totalShots = activeProjectiles.Count,
            totalDamage = CalculateTotalDamage(),
            combatDuration = Time.time - combatStartTime,
            participants = combatParticipants.ConvertAll(p => new
            {
                id = p?.shipId,
                name = p?.name,
                finalHealth = p?.currentHealth,
                damageDealt = GetDamageDealt(p),
                damageReceived = GetDamageReceived(p)
            })
        };
        
        return stats;
    }
    
    /// <summary>
    /// Registra un proyectil en el sistema
    /// </summary>
    public void RegisterProjectile(Projectile projectile)
    {
        activeProjectiles.Add(projectile);
    }
    
    /// <summary>
    /// Obtiene la nave del jugador
    /// </summary>
    private ShipController GetPlayerShip()
    {
        string playerId = PlayerPrefs.GetString("UserId");
        
        foreach (var ship in combatParticipants)
        {
            if (ship != null && ship.shipId == playerId)
            {
                return ship;
            }
        }
        
        return null;
    }
    
    /// <summary>
    /// Inicializa la UI de combate
    /// </summary>
    private void InitializeCombatUI()
    {
        if (combatHUD != null)
        {
            combatHUD.Show();
            combatHUD.InitializeCombat(targets.Values);
        }
        
        if (targetReticle != null)
        {
            targetReticle.Show();
        }
        
        if (damageIndicator != null)
        {
            damageIndicator.Show();
        }
    }
    
    /// <summary>
    /// Muestra los resultados del combate
    /// </summary>
    private void ShowCombatResults(ShipController winner, object results)
    {
        // Implementar UI de resultados
        Debug.Log($"Combat Results: Winner - {winner?.name}");
    }
    
    /// <summary>
    /// Limpia el estado del combate
    /// </summary>
    private void CleanupCombat()
    {
        // Destruir naves restantes
        foreach (var ship in combatParticipants)
        {
            if (ship != null)
            {
                Destroy(ship.gameObject);
            }
        }
        
        // Destruir proyectiles restantes
        foreach (var projectile in activeProjectiles)
        {
            if (projectile != null)
            {
                Destroy(projectile.gameObject);
            }
        }
        
        // Limpiar estado
        combatParticipants.Clear();
        activeProjectiles.Clear();
        targets.Clear();
        currentCombatId = null;
        
        // Ocultar UI de combate
        if (combatHUD != null) combatHUD.Hide();
        if (targetReticle != null) targetReticle.Hide();
        if (damageIndicator != null) damageIndicator.Hide();
    }
    
    /// <summary>
    /// Notifica el inicio del combate
    /// </summary>
    private void NotifyCombatStart()
    {
        foreach (var ship in combatParticipants)
        {
            if (ship != null)
            {
                ship.OnCombatStart();
            }
        }
    }
    
    // Métodos auxiliares
    private float CalculateTotalDamage()
    {
        float totalDamage = 0f;
        foreach (var projectile in activeProjectiles)
        {
            if (projectile != null)
            {
                totalDamage += projectile.damage;
            }
        }
        return totalDamage;
    }
    
    private float GetDamageDealt(ShipController ship)
    {
        // Implementar cálculo de daño infligido
        return 0f;
    }
    
    private float GetDamageReceived(ShipController ship)
    {
        if (ship == null) return 0f;
        return ship.maxHealth - ship.currentHealth;
    }
    
    private async Task<GameObject> LoadShipPrefab(string shipType)
    {
        // Implementar carga de prefab
        string prefabPath = $"Assets/Prefabs/Ships/{shipType}.prefab";
        return await Resources.LoadAsync<GameObject>(prefabPath) as GameObject;
    }
}

/// <summary>
/// Representa un objetivo en el combate
/// </summary>
public class CombatTarget
{
    public ShipController ship;
    public float threatLevel;
    public float distance;
    public bool isLocked;
    public float lockOnTime;
    
    public CombatTarget(ShipController ship)
    {
        this.ship = ship;
        this.threatLevel = 0f;
        this.distance = 0f;
        this.isLocked = false;
        this.lockOnTime = 0f;
    }
    
    public void Update(ShipController referenceShip)
    {
        if (ship == null || referenceShip == null) return;
        
        distance = Vector3.Distance(ship.transform.position, referenceShip.transform.position);
        threatLevel = CalculateThreatLevel();
    }
    
    private float CalculateThreatLevel()
    {
        if (ship == null) return 0f;
        
        float baseThreat = 0f;
        switch (ship.shipType.ToLower())
        {
            case "fighter": baseThreat = 1f; break;
            case "cruiser": baseThreat = 2f; break;
            case "battleship": baseThreat = 3f; break;
            case "carrier": baseThreat = 4f; break;
        }
        
        float healthFactor = 1f - (ship.currentHealth / ship.maxHealth);
        return baseThreat * (1f + healthFactor);
    }
}

/// <summary>
/// Datos de combate para el backend
/// </summary>
[System.Serializable]
public class CombatInitData
{
    public string combatId;
    public string[] participants;
    public Vector3 location;
    public string battleType;
}

[System.Serializable]
public class CombatResult
{
    public string combatId;
    public string winner;
    public string[] participants;
    public float duration;
    public object statistics;
}
