# 🚀 DESTOCK SPACE - PROYECTO UNITY PC

## 📋 **RESUMEN EJECUTIVO**

Cliente Unity PC instalable para DESTOCK SPACE, conectado al backend común, con naves GLB, sistema VFX editable, combate espacial funcional, y sistemas MMO completos de economía, inventario y marketplace.

---

## 🎯 **PRIORIDADES DE DESARROLLO**

1. ✅ **Crear cliente Unity PC instalable**
2. ✅ **Importar y configurar naves GLB**
3. ✅ **Implementar sistema visual VFX editable**
4. ✅ **Crear combate espacial funcional**
5. ✅ **Conectar inventario, economía y marketplace al backend**
6. ✅ **Preparar build Windows**
7. ✅ **Documentar API para cliente web (Cursor)**

---

## 🛠️ **CONFIGURACIÓN DEL PROYECTO UNITY**

### **📋 Versiones y Requisitos**
```yaml
Unity Version: 2022.3.20f1 LTS
Target Platform: Windows (x64)
Rendering Pipeline: Universal Render Pipeline (URP)
Scripting Backend: IL2CPP
API Compatibility Level: .NET Standard 2.1
```

### **📁 Estructura del Proyecto**
```
📁 DESTOCK_SPACE/
├── 📁 Assets/
│   ├── 📁 Scripts/
│   │   ├── 📁 Backend/
│   │   │   ├── APIController.cs
│   │   │   ├── WebSocketClient.cs
│   │   │   ├── AuthManager.cs
│   │   │   └── DataSyncManager.cs
│   │   ├── 📁 Game/
│   │   │   ├── 📁 Ships/
│   │   │   │   ├── ShipController.cs
│   │   │   │   ├── ShipMovement.cs
│   │   │   │   ├── ShipCombat.cs
│   │   │   │   └── ShipVisuals.cs
│   │   │   ├── 📁 Combat/
│   │   │   │   ├── CombatManager.cs
│   │   │   │   ├── WeaponSystem.cs
│   │   │   │   ├── DamageSystem.cs
│   │   │   │   └── EffectsController.cs
│   │   │   ├── 📁 Economy/
│   │   │   │   ├── ResourceManager.cs
│   │   │   │   ├── InventoryManager.cs
│   │   │   │   ├── MarketplaceManager.cs
│   │   │   │   └── TradingSystem.cs
│   │   │   └── 📁 UI/
│   │   │       ├── UIManager.cs
│   │   │       ├── HUDController.cs
│   │   │       ├── InventoryUI.cs
│   │   │       └── MarketplaceUI.cs
│   │   ├── 📁 VFX/
│   │   │   ├── VFXManager.cs
│   │   │   ├── ParticleController.cs
│   │   │   ├── EngineEffects.cs
│   │   │   ├── WeaponEffects.cs
│   │   │   └── ExplosionEffects.cs
│   │   └── 📁 Utils/
│   │       ├── GameManager.cs
│   │       ├── SceneLoader.cs
│   │       ├── AudioManager.cs
│   │       └── SaveSystem.cs
│   ├── 📁 Models/
│   │   ├── 📁 Ships/
│   │   │   ├── 📁 Fighter/
│   │   │   ├── 📁 Cruiser/
│   │   │   ├── 📁 Battleship/
│   │   │   └── 📁 Carrier/
│   │   ├── 📁 Space/
│   │   │   ├── 📁 Planets/
│   │   │   ├── 📁 Asteroids/
│   │   │   ├── 📁 Stations/
│   │   │   └── 📁 Nebulae/
│   │   └── 📁 VFX/
│   │       ├── 📁 Engines/
│   │       ├── 📁 Weapons/
│   │       ├── 📁 Explosions/
│   │       └── 📁 Shields/
│   ├── 📁 Scenes/
│   │   ├── MainMenu.unity
│   │   ├── SpaceScene.unity
│   │   ├── CombatScene.unity
│   │   ├── MarketplaceScene.unity
│   │   └── InventoryScene.unity
│   ├── 📁 Materials/
│   │   ├── 📁 Ships/
│   │   ├── 📁 Space/
│   │   ├── 📁 VFX/
│   │   └── 📁 UI/
│   ├── 📁 Textures/
│   │   ├── 📁 Ships/
│   │   ├── 📁 Space/
│   │   ├── 📁 VFX/
│   │   └── 📁 UI/
│   ├── 📁 Audio/
│   │   ├── 📁 Music/
│   │   ├── 📁 SFX/
│   │   └── 📁 Voice/
│   ├── 📁 Prefabs/
│   │   ├── 📁 Ships/
│   │   ├── 📁 Weapons/
│   │   ├── 📁 VFX/
│   │   ├── 📁 UI/
│   │   └── 📁 Environment/
│   └── 📁 Settings/
│       ├── QualitySettings.asset
│       ├── RenderPipelineAsset.asset
│       └── InputManager.asset
├── 📁 Packages/
│   ├── 📄 manifest.json
│   └── 📁 PackagesCache/
├── 📁 ProjectSettings/
└── 📄 DESTOCK_SPACE.sln
```

---

## 🔌 **CONEXIÓN BACKEND**

### **🌐 API Controller**
```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json;
using System.Threading.Tasks;

public class APIController : MonoBehaviour
{
    private static APIController instance;
    public static APIController Instance => instance;
    
    [Header("API Configuration")]
    private string baseURL = "https://api.destockspace.com/v1";
    private string accessToken;
    private string refreshToken;
    
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
    
    // Autenticación
    public async Task<bool> Login(string email, string password)
    {
        var loginData = new { email, password, clientType = "PC" };
        var json = JsonConvert.SerializeObject(loginData);
        
        using (var www = UnityWebRequest.Post($"{baseURL}/auth/login", json))
        {
            www.SetRequestHeader("Content-Type", "application/json");
            www.SetRequestHeader("X-Client-Type", "PC");
            
            await www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<LoginResponse>(www.downloadHandler.text);
                accessToken = response.tokens.accessToken;
                refreshToken = response.tokens.refreshToken;
                
                // Guardar tokens localmente
                PlayerPrefs.SetString("AccessToken", accessToken);
                PlayerPrefs.SetString("RefreshToken", refreshToken);
                
                return true;
            }
        }
        
        return false;
    }
    
    // Obtener recursos del jugador
    public async Task<ResourceData[]> GetPlayerResources()
    {
        using (var www = UnityWebRequest.Get($"{baseURL}/economy/resources"))
        {
            www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
            www.SetRequestHeader("X-Client-Type", "PC");
            
            await www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<ResourcesResponse>(www.downloadHandler.text);
                return response.resources;
            }
        }
        
        return null;
    }
    
    // Obtener inventario
    public async Task<InventoryItem[]> GetPlayerInventory()
    {
        using (var www = UnityWebRequest.Get($"{baseURL}/inventory"))
        {
            www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
            www.SetRequestHeader("X-Client-Type", "PC");
            
            await www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<InventoryResponse>(www.downloadHandler.text);
                return response.items;
            }
        }
        
        return null;
    }
    
    // Obtener fleet
    public async Task<ShipData[]> GetPlayerFleet()
    {
        using (var www = UnityWebRequest.Get($"{baseURL}/ships/fleet"))
        {
            www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
            www.SetRequestHeader("X-Client-Type", "PC");
            
            await www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                var response = JsonConvert.DeserializeObject<FleetResponse>(www.downloadHandler.text);
                return response.ships;
            }
        }
        
        return null;
    }
}

// Modelos de datos
[System.Serializable]
public class LoginResponse
{
    public UserData user;
    public TokenData tokens;
}

[System.Serializable]
public class TokenData
{
    public string accessToken;
    public string refreshToken;
    public int expiresIn;
}

[System.Serializable]
public class ResourceData
{
    public string type;
    public float amount;
    public float maxAmount;
    public float productionRate;
}

[System.Serializable]
public class InventoryItem
{
    public string id;
    public string itemId;
    public string name;
    public string type;
    public int quantity;
    public bool equipped;
}

[System.Serializable]
public class ShipData
{
    public string id;
    public string name;
    public string type;
    public int level;
    public float health;
    public Vector3 position;
    public string[] equipment;
}
```

### **📡 WebSocket Client**
```csharp
using UnityEngine;
using NativeWebSocket;
using System.Collections;
using Newtonsoft.Json;
using System.Threading.Tasks;

public class WebSocketClient : MonoBehaviour
{
    private static WebSocketClient instance;
    public static WebSocketClient Instance => instance;
    
    private WebSocket websocket;
    private bool isConnected = false;
    
    [Header("WebSocket Configuration")]
    private string wsURL = "wss://api.destockspace.com/ws";
    
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
    
    public async Task Connect(string token)
    {
        websocket = new WebSocket(wsURL);
        
        websocket.OnOpen += () =>
        {
            Debug.Log("WebSocket Connected");
            isConnected = true;
            
            // Autenticar
            var authMessage = new
            {
                type = "auth",
                token = token,
                clientType = "PC"
            };
            
            websocket.SendText(JsonConvert.SerializeObject(authMessage));
        };
        
        websocket.OnMessage += (bytes) =>
        {
            var message = System.Text.Encoding.UTF8.GetString(bytes);
            HandleWebSocketMessage(message);
        };
        
        websocket.OnClose += (e) =>
        {
            Debug.Log($"WebSocket Closed: {e}");
            isConnected = false;
        };
        
        websocket.OnError += (e) =>
        {
            Debug.LogError($"WebSocket Error: {e}");
        };
        
        await websocket.Connect();
    }
    
    private void HandleWebSocketMessage(string message)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<WebSocketMessage>(message);
            
            switch (data.type)
            {
                case "resource:update":
                    HandleResourceUpdate(data);
                    break;
                case "inventory:update":
                    HandleInventoryUpdate(data);
                    break;
                case "combat:initiated":
                    HandleCombatInitiated(data);
                    break;
                case "marketplace:update":
                    HandleMarketplaceUpdate(data);
                    break;
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error handling WebSocket message: {e}");
        }
    }
    
    private void HandleResourceUpdate(WebSocketMessage data)
    {
        var resources = JsonConvert.DeserializeObject<ResourceData[]>(data.payload.ToString());
        ResourceManager.Instance.UpdateResources(resources);
    }
    
    private void HandleInventoryUpdate(WebSocketMessage data)
    {
        var inventory = JsonConvert.DeserializeObject<InventoryItem[]>(data.payload.ToString());
        InventoryManager.Instance.UpdateInventory(inventory);
    }
    
    private void HandleCombatInitiated(WebSocketMessage data)
    {
        var combatData = JsonConvert.DeserializeObject<CombatInitData>(data.payload.ToString());
        CombatManager.Instance.InitiateCombat(combatData);
    }
    
    private void HandleMarketplaceUpdate(WebSocketMessage data)
    {
        var marketData = JsonConvert.DeserializeObject<MarketplaceData>(data.payload.ToString());
        MarketplaceManager.Instance.UpdateMarketplace(marketData);
    }
    
    private void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        if (websocket != null && isConnected)
        {
            DispatchMessageQueue();
        }
#endif
    }
    
    private async void DispatchMessageQueue()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        if (websocket.State == WebSocketState.Open)
        {
            await websocket.DispatchMessageQueue();
        }
#endif
    }
    
    private void OnDestroy()
    {
        if (websocket != null)
        {
            websocket.Close();
        }
    }
}

[System.Serializable]
public class WebSocketMessage
{
    public string type;
    public object payload;
    public string timestamp;
}
```

---

## 🚀 **SISTEMA DE NAVES GLB**

### **📦 Ship Controller**
```csharp
using UnityEngine;
using GLTFast;
using System.Threading.Tasks;

public class ShipController : MonoBehaviour
{
    [Header("Ship Data")]
    public string shipId;
    public string shipType;
    public int level;
    public float maxHealth = 100f;
    public float currentHealth;
    
    [Header("Movement")]
    public float moveSpeed = 10f;
    public float rotationSpeed = 100f;
    public float acceleration = 5f;
    
    [Header("Combat")]
    public WeaponSystem[] weapons;
    public ShieldController shield;
    
    private Rigidbody rb;
    private GltfImport gltfImport;
    private ShipVisuals shipVisuals;
    private ShipMovement shipMovement;
    private ShipCombat shipCombat;
    
    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        shipVisuals = GetComponent<ShipVisuals>();
        shipMovement = GetComponent<ShipMovement>();
        shipCombat = GetComponent<ShipCombat>();
        
        currentHealth = maxHealth;
    }
    
    public async Task LoadShipModel(string modelPath)
    {
        gltfImport = new GltfImport();
        
        var success = await gltfImport.Load(modelPath);
        
        if (success)
        {
            // Instanciar el modelo
            var instance = gltfImport.InstantiateScene();
            instance.transform.SetParent(transform);
            instance.transform.localPosition = Vector3.zero;
            instance.transform.localRotation = Quaternion.identity;
            
            // Configurar materiales y shaders
            SetupShipMaterials(instance);
            
            // Inicializar sistemas visuales
            shipVisuals.InitializeVisuals(instance);
            
            Debug.Log($"Ship model loaded: {modelPath}");
        }
        else
        {
            Debug.LogError($"Failed to load ship model: {modelPath}");
        }
    }
    
    private void SetupShipMaterials(GameObject shipModel)
    {
        var renderers = shipModel.GetComponentsInChildren<Renderer>();
        
        foreach (var renderer in renderers)
        {
            foreach (var material in renderer.materials)
            {
                // Aplicar shader personalizado para naves
                material.shader = Shader.Find("Custom/ShipShader");
                
                // Configurar propiedades del material
                material.SetFloat("_Metallic", 0.8f);
                material.SetFloat("_Glossiness", 0.9f);
                material.SetColor("_EmissionColor", Color.blue * 0.1f);
            }
        }
    }
    
    public void TakeDamage(float damage)
    {
        currentHealth -= damage;
        
        // Aplicar efectos visuales de daño
        shipVisuals.ShowDamageEffect();
        
        if (shield != null)
        {
            shield.AbsorbDamage(damage);
        }
        
        if (currentHealth <= 0)
        {
            DestroyShip();
        }
    }
    
    private void DestroyShip()
    {
        // Iniciar explosión
        VFXManager.Instance.CreateExplosion(transform.position, transform.localScale.x);
        
        // Notificar al backend
        APIController.Instance.ReportShipDestruction(shipId);
        
        // Destruir nave
        Destroy(gameObject);
    }
    
    private void Update()
    {
        // Actualizar estado de la nave
        shipMovement.UpdateMovement();
        shipCombat.UpdateCombat();
        
        // Sincronizar con backend
        if (Time.time % 1f < Time.deltaTime) // Cada segundo
        {
            SyncShipState();
        }
    }
    
    private async void SyncShipState()
    {
        var shipState = new
        {
            shipId = shipId,
            position = transform.position,
            rotation = transform.rotation,
            health = currentHealth,
            activeWeapons = GetActiveWeapons()
        };
        
        await APIController.Instance.UpdateShipState(shipState);
    }
    
    private string[] GetActiveWeapons()
    {
        var activeWeapons = new System.Collections.Generic.List<string>();
        
        foreach (var weapon in weapons)
        {
            if (weapon.isActiveAndEnabled)
            {
                activeWeapons.Add(weapon.weaponId);
            }
        }
        
        return activeWeapons.ToArray();
    }
}
```

### **🎨 Ship Visuals**
```csharp
using UnityEngine;
using System.Collections;

public class ShipVisuals : MonoBehaviour
{
    [Header("Visual Effects")]
    public ParticleSystem[] engineEffects;
    public ParticleSystem[] shieldEffects;
    public Light[] shipLights;
    
    [Header("Damage Effects")]
    public ParticleSystem damageSparks;
    public Material damageMaterial;
    public float damageEffectDuration = 2f;
    
    private GameObject shipModel;
    private Material originalMaterial;
    private Coroutine damageCoroutine;
    
    public void InitializeVisuals(GameObject model)
    {
        shipModel = model;
        
        // Guardar material original
        if (shipModel.GetComponent<Renderer>() != null)
        {
            originalMaterial = shipModel.GetComponent<Renderer>().material;
        }
        
        // Inicializar efectos de motor
        InitializeEngineEffects();
        
        // Inicializar luces
        InitializeShipLights();
    }
    
    private void InitializeEngineEffects()
    {
        foreach (var engine in engineEffects)
        {
            var main = engine.main;
            main.startColor = Color.cyan;
            main.startSize = 0.5f;
            main.startLifetime = 2f;
            main.emissionRate = 50f;
        }
    }
    
    private void InitializeShipLights()
    {
        foreach (var light in shipLights)
        {
            light.color = Color.white;
            light.intensity = 2f;
            light.range = 10f;
        }
    }
    
    public void ShowDamageEffect()
    {
        if (damageCoroutine != null)
        {
            StopCoroutine(damageCoroutine);
        }
        
        damageCoroutine = StartCoroutine(DamageEffectCoroutine());
    }
    
    private IEnumerator DamageEffectCoroutine()
    {
        // Aplicar material de daño
        if (shipModel != null && damageMaterial != null)
        {
            shipModel.GetComponent<Renderer>().material = damageMaterial;
        }
        
        // Activar chispas
        if (damageSparks != null)
        {
            damageSparks.Play();
        }
        
        // Parpadear luces
        foreach (var light in shipLights)
        {
            StartCoroutine(LightFlicker(light));
        }
        
        yield return new WaitForSeconds(damageEffectDuration);
        
        // Restaurar material original
        if (shipModel != null && originalMaterial != null)
        {
            shipModel.GetComponent<Renderer>().material = originalMaterial;
        }
        
        // Detener chispas
        if (damageSparks != null)
        {
            damageSparks.Stop();
        }
    }
    
    private IEnumerator LightFlicker(Light light)
    {
        for (int i = 0; i < 10; i++)
        {
            light.enabled = !light.enabled;
            yield return new WaitForSeconds(0.1f);
        }
        
        light.enabled = true;
    }
    
    public void SetEnginePower(float power)
    {
        foreach (var engine in engineEffects)
        {
            var main = engine.main;
            main.startSize = 0.5f * power;
            main.emissionRate = 50f * power;
            
            if (power > 0.5f)
            {
                engine.Play();
            }
            else
            {
                engine.Stop();
            }
        }
    }
    
    public void ActivateShield(bool activate)
    {
        foreach (var shield in shieldEffects)
        {
            if (activate)
            {
                shield.Play();
            }
            else
            {
                shield.Stop();
            }
        }
    }
}
```

---

## ✨ **SISTEMA VFX EDITABLE**

### **🎮 VFX Manager**
```csharp
using UnityEngine;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.IO;

public class VFXManager : MonoBehaviour
{
    private static VFXManager instance;
    public static VFXManager Instance => instance;
    
    [Header("VFX Presets")]
    public VFXPreset[] enginePresets;
    public VFXPreset[] weaponPresets;
    public VFXPreset[] explosionPresets;
    
    [Header("VFX Pool")]
    public int poolSize = 100;
    private Dictionary<string, Queue<GameObject>> vfxPool;
    
    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeVFXPool();
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void InitializeVFXPool()
    {
        vfxPool = new Dictionary<string, Queue<GameObject>>();
        
        // Precargar efectos comunes
        PreloadVFX("EngineBasic", enginePresets[0].prefab);
        PreloadVFX("LaserBasic", weaponPresets[0].prefab);
        PreloadVFX("ExplosionSmall", explosionPresets[0].prefab);
    }
    
    private void PreloadVFX(string key, GameObject prefab)
    {
        var queue = new Queue<GameObject>();
        
        for (int i = 0; i < poolSize; i++)
        {
            var vfx = Instantiate(prefab);
            vfx.SetActive(false);
            queue.Enqueue(vfx);
        }
        
        vfxPool[key] = queue;
    }
    
    public GameObject PlayVFX(string vfxKey, Vector3 position, Quaternion rotation)
    {
        if (vfxPool.ContainsKey(vfxKey) && vfxPool[vfxKey].Count > 0)
        {
            var vfx = vfxPool[vfxKey].Dequeue();
            vfx.transform.position = position;
            vfx.transform.rotation = rotation;
            vfx.SetActive(true);
            
            // Retornar al pool después de terminar
            StartCoroutine(ReturnToPool(vfxKey, vfx));
            
            return vfx;
        }
        
        Debug.LogWarning($"VFX not found in pool: {vfxKey}");
        return null;
    }
    
    private IEnumerator ReturnToPool(string key, GameObject vfx)
    {
        // Esperar a que el efecto termine
        var particleSystem = vfx.GetComponent<ParticleSystem>();
        if (particleSystem != null)
        {
            yield return new WaitForSeconds(particleSystem.main.duration);
        }
        else
        {
            yield return new WaitForSeconds(2f);
        }
        
        vfx.SetActive(false);
        vfxPool[key].Enqueue(vfx);
    }
    
    public void CreateExplosion(Vector3 position, float size)
    {
        var explosionKey = size > 5f ? "ExplosionLarge" : "ExplosionSmall";
        var explosion = PlayVFX(explosionKey, position, Quaternion.identity);
        
        if (explosion != null)
        {
            // Ajustar tamaño
            explosion.transform.localScale = Vector3.one * (size / 5f);
            
            // Efectos de cámara
            CameraShake.Instance.Shake(0.5f, size * 0.1f);
            
            // Sonido
            AudioManager.Instance.PlayExplosionSound(size);
        }
    }
    
    public void CreateEngineEffect(Vector3 position, Quaternion rotation, string presetName)
    {
        var engineEffect = PlayVFX(presetName, position, rotation);
        
        if (engineEffect != null)
        {
            // Configurar para seguimiento de nave
            var followTarget = engineEffect.AddComponent<FollowTarget>();
            followTarget.target = transform;
        }
    }
    
    public void CreateWeaponEffect(Vector3 start, Vector3 end, WeaponType weaponType)
    {
        var weaponKey = GetWeaponKey(weaponType);
        var weaponEffect = PlayVFX(weaponKey, start, Quaternion.LookRotation(end - start));
        
        if (weaponEffect != null)
        {
            // Mover efecto hacia el objetivo
            StartCoroutine(MoveWeaponEffect(weaponEffect, start, end));
        }
    }
    
    private IEnumerator MoveWeaponEffect(GameObject effect, Vector3 start, Vector3 end)
    {
        float duration = 0.5f;
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            effect.transform.position = Vector3.Lerp(start, end, elapsed / duration);
            elapsed += Time.deltaTime;
            yield return null;
        }
        
        // Crear impacto
        CreateImpactEffect(end);
        
        // Retornar al pool
        effect.SetActive(false);
    }
    
    private void CreateImpactEffect(Vector3 position)
    {
        var impact = PlayVFX("WeaponImpact", position, Quaternion.identity);
        
        if (impact != null)
        {
            // Efectos adicionales
            CreateSparks(position);
        }
    }
    
    private void CreateSparks(Vector3 position)
    {
        var sparks = PlayVFX("Sparks", position, Quaternion.identity);
        if (sparks != null)
        {
            sparks.transform.localScale = Vector3.one * 0.5f;
        }
    }
    
    private string GetWeaponKey(WeaponType weaponType)
    {
        switch (weaponType)
        {
            case WeaponType.Laser:
                return "LaserBasic";
            case WeaponType.Plasma:
                return "PlasmaBolt";
            case WeaponType.Missile:
                return "MissileTrail";
            default:
                return "LaserBasic";
        }
    }
    
    // Editor: Guardar configuración VFX
    public void SaveVFXConfiguration()
    {
        var config = new VFXConfiguration
        {
            enginePresets = enginePresets,
            weaponPresets = weaponPresets,
            explosionPresets = explosionPresets
        };
        
        var json = JsonConvert.SerializeObject(config, Formatting.Indented);
        File.WriteAllText(Application.persistentDataPath + "/vfx_config.json", json);
        
        Debug.Log("VFX Configuration saved");
    }
    
    // Editor: Cargar configuración VFX
    public void LoadVFXConfiguration()
    {
        var path = Application.persistentDataPath + "/vfx_config.json";
        
        if (File.Exists(path))
        {
            var json = File.ReadAllText(path);
            var config = JsonConvert.DeserializeObject<VFXConfiguration>(json);
            
            enginePresets = config.enginePresets;
            weaponPresets = config.weaponPresets;
            explosionPresets = config.explosionPresets;
            
            Debug.Log("VFX Configuration loaded");
        }
    }
}

[System.Serializable]
public class VFXPreset
{
    public string name;
    public GameObject prefab;
    public float duration;
    public float size;
    public Color color;
    public VFXParameters parameters;
}

[System.Serializable]
public class VFXParameters
{
    public float emissionRate = 50f;
    public float startSize = 1f;
    public float startSpeed = 5f;
    public Color startColor = Color.white;
    public float lifetime = 2f;
}

[System.Serializable]
public class VFXConfiguration
{
    public VFXPreset[] enginePresets;
    public VFXPreset[] weaponPresets;
    public VFXPreset[] explosionPresets;
}

public enum WeaponType
{
    Laser,
    Plasma,
    Missile,
    Railgun,
    Explosive
}
```

---

## ⚔️ **SISTEMA DE COMBATE ESPACIAL**

### **🎮 Combat Manager**
```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CombatManager : MonoBehaviour
{
    private static CombatManager instance;
    public static CombatManager Instance => instance;
    
    [Header("Combat Settings")]
    public float combatRange = 1000f;
    public float weaponRange = 500f;
    public float lockOnRange = 300f;
    
    private List<ShipController> activeShips = new List<ShipController>();
    private List<Projectile> activeProjectiles = new List<Projectile>();
    private bool combatActive = false;
    
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
    
    public void StartCombat(List<ShipController> participants)
    {
        activeShips = participants;
        combatActive = true;
        
        Debug.Log($"Combat started with {participants.Count} ships");
        
        // Notificar al backend
        NotifyCombatStart(participants);
    }
    
    private void Update()
    {
        if (!combatActive) return;
        
        UpdateCombat();
        UpdateProjectiles();
        CheckCombatEnd();
    }
    
    private void UpdateCombat()
    {
        foreach (var ship in activeShips)
        {
            if (ship == null) continue;
            
            // Encontrar enemigos cercanos
            var enemies = FindEnemiesInRange(ship, combatRange);
            
            if (enemies.Count > 0)
            {
                // Apuntar al enemigo más cercano
                var target = FindClosestEnemy(ship, enemies);
                ship.SetTarget(target);
                
                // Disparar si está en rango
                if (Vector3.Distance(ship.transform.position, target.transform.position) <= weaponRange)
                {
                    ship.FireWeapons();
                }
            }
        }
    }
    
    private List<ShipController> FindEnemiesInRange(ShipController ship, float range)
    {
        var enemies = new List<ShipController>();
        
        foreach (var otherShip in activeShips)
        {
            if (otherShip == null || otherShip == ship) continue;
            
            if (Vector3.Distance(ship.transform.position, otherShip.transform.position) <= range)
            {
                enemies.Add(otherShip);
            }
        }
        
        return enemies;
    }
    
    private ShipController FindClosestEnemy(ShipController ship, List<ShipController> enemies)
    {
        ShipController closest = null;
        float minDistance = float.MaxValue;
        
        foreach (var enemy in enemies)
        {
            float distance = Vector3.Distance(ship.transform.position, enemy.transform.position);
            if (distance < minDistance)
            {
                minDistance = distance;
                closest = enemy;
            }
        }
        
        return closest;
    }
    
    private void UpdateProjectiles()
    {
        for (int i = activeProjectiles.Count - 1; i >= 0; i--)
        {
            var projectile = activeProjectiles[i];
            
            if (projectile == null)
            {
                activeProjectiles.RemoveAt(i);
                continue;
            }
            
            projectile.UpdateProjectile();
            
            if (projectile.HasHitTarget || projectile.OutOfRange)
            {
                if (projectile.HasHitTarget)
                {
                    projectile.target.TakeDamage(projectile.damage);
                    CreateImpactEffect(projectile.transform.position);
                }
                
                Destroy(projectile.gameObject);
                activeProjectiles.RemoveAt(i);
            }
        }
    }
    
    private void CheckCombatEnd()
    {
        var aliveShips = new List<ShipController>();
        
        foreach (var ship in activeShips)
        {
            if (ship != null && ship.currentHealth > 0)
            {
                aliveShips.Add(ship);
            }
        }
        
        if (aliveShips.Count <= 1)
        {
            EndCombat(aliveShips.Count > 0 ? aliveShips[0] : null);
        }
    }
    
    private void EndCombat(ShipController winner)
    {
        combatActive = false;
        
        Debug.Log($"Combat ended. Winner: {(winner != null ? winner.name : "None")}");
        
        // Notificar al backend
        NotifyCombatEnd(winner);
        
        // Limpiar proyectiles
        foreach (var projectile in activeProjectiles)
        {
            if (projectile != null)
            {
                Destroy(projectile.gameObject);
            }
        }
        activeProjectiles.Clear();
    }
    
    public void AddProjectile(Projectile projectile)
    {
        activeProjectiles.Add(projectile);
    }
    
    private void CreateImpactEffect(Vector3 position)
    {
        VFXManager.Instance.CreateWeaponEffect(position, position, WeaponType.Laser);
    }
    
    private async void NotifyCombatStart(List<ShipController> participants)
    {
        var combatData = new
        {
            participants = participants.ConvertAll(p => p.shipId),
            location = new { x = 0, y = 0, z = 0 },
            battleType = "pvp"
        };
        
        await APIController.Instance.InitiateCombat(combatData);
    }
    
    private async void NotifyCombatEnd(ShipController winner)
    {
        var result = new
        {
            combatId = System.Guid.NewGuid().ToString(),
            winner = winner?.shipId,
            participants = activeShips.ConvertAll(s => s?.shipId),
            duration = Time.time
        };
        
        await APIController.Instance.EndCombat(result);
    }
}
```

---

## 💰 **SISTEMAS MMO**

### **💎 Resource Manager**
```csharp
using UnityEngine;
using TMPro;
using System.Threading.Tasks;

public class ResourceManager : MonoBehaviour
{
    private static ResourceManager instance;
    public static ResourceManager Instance => instance;
    
    [Header("UI References")]
    public TextMeshProUGUI metalText;
    public TextMeshProUGUI plasmaText;
    public TextMeshProUGUI energyText;
    public TextMeshProUGUI crystalsText;
    
    [Header("Resource Data")]
    private ResourceData[] currentResources;
    
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
    
    private async void Start()
    {
        await LoadResources();
    }
    
    public async Task LoadResources()
    {
        currentResources = await APIController.Instance.GetPlayerResources();
        UpdateUI();
    }
    
    public void UpdateResources(ResourceData[] resources)
    {
        currentResources = resources;
        UpdateUI();
    }
    
    private void UpdateUI()
    {
        if (currentResources == null) return;
        
        foreach (var resource in currentResources)
        {
            switch (resource.type.ToLower())
            {
                case "metal":
                    if (metalText != null)
                        metalText.text = FormatResource(resource);
                    break;
                case "plasma":
                    if (plasmaText != null)
                        plasmaText.text = FormatResource(resource);
                    break;
                case "energy":
                    if (energyText != null)
                        energyText.text = FormatResource(resource);
                    break;
                case "crystals":
                    if (crystalsText != null)
                        crystalsText.text = FormatResource(resource);
                    break;
            }
        }
    }
    
    private string FormatResource(ResourceData resource)
    {
        return $"{resource.amount:F0}/{resource.maxAmount:F0}";
    }
    
    public async Task<bool> TransferResources(string toUserId, string resourceType, float amount)
    {
        var transferData = new
        {
            fromUserId = PlayerPrefs.GetString("UserId"),
            toUserId = toUserId,
            resourceType = resourceType,
            amount = amount,
            reason = "Trade"
        };
        
        var success = await APIController.Instance.TransferResources(transferData);
        
        if (success)
        {
            await LoadResources(); // Refresh resources
        }
        
        return success;
    }
}
```

### **📦 Inventory Manager**
```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Threading.Tasks;
using System.Collections.Generic;

public class InventoryManager : MonoBehaviour
{
    private static InventoryManager instance;
    public static InventoryManager Instance => instance;
    
    [Header("UI References")]
    public Transform inventoryGrid;
    public GameObject itemSlotPrefab;
    public Button sortButton;
    public Button filterButton;
    
    [Header("Inventory Data")]
    private InventoryItem[] currentInventory;
    private Dictionary<string, ItemSlot> itemSlots = new Dictionary<string, ItemSlot>();
    
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
    
    private void Start()
    {
        InitializeUI();
        _ = LoadInventory();
    }
    
    private void InitializeUI()
    {
        sortButton.onClick.AddListener(SortInventory);
        filterButton.onClick.AddListener(ShowFilterMenu);
        
        // Crear slots iniciales
        for (int i = 0; i < 50; i++) // 50 slots
        {
            var slot = Instantiate(itemSlotPrefab, inventoryGrid);
            var itemSlot = slot.GetComponent<ItemSlot>();
            itemSlot.Initialize(i);
        }
    }
    
    public async Task LoadInventory()
    {
        currentInventory = await APIController.Instance.GetPlayerInventory();
        UpdateInventoryUI();
    }
    
    public void UpdateInventory(InventoryItem[] items)
    {
        currentInventory = items;
        UpdateInventoryUI();
    }
    
    private void UpdateInventoryUI()
    {
        if (currentInventory == null) return;
        
        // Limpiar slots existentes
        foreach (var slot in itemSlots.Values)
        {
            slot.ClearItem();
        }
        
        // Llenar slots con items
        foreach (var item in currentInventory)
        {
            if (itemSlots.ContainsKey(item.id))
            {
                itemSlots[item.id].SetItem(item);
            }
        }
    }
    
    private void SortInventory()
    {
        if (currentInventory == null) return;
        
        // Ordenar por tipo y nombre
        System.Array.Sort(currentInventory, (a, b) => {
            int typeCompare = a.type.CompareTo(b.type);
            if (typeCompare != 0) return typeCompare;
            return a.name.CompareTo(b.name);
        });
        
        UpdateInventoryUI();
    }
    
    private void ShowFilterMenu()
    {
        // Implementar menú de filtros
        Debug.Log("Show filter menu");
    }
    
    public async Task<bool> EquipItem(string itemId)
    {
        var success = await APIController.Instance.EquipItem(itemId);
        
        if (success)
        {
            await LoadInventory(); // Refresh inventory
        }
        
        return success;
    }
    
    public async Task<bool> UnequipItem(string itemId)
    {
        var success = await APIController.Instance.UnequipItem(itemId);
        
        if (success)
        {
            await LoadInventory(); // Refresh inventory
        }
        
        return success;
    }
}
```

### **🛒 Marketplace Manager**
```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;
using System.Collections.Generic;

public class MarketplaceManager : MonoBehaviour
{
    private static MarketplaceManager instance;
    public static MarketplaceManager Instance => instance;
    
    [Header("UI References")]
    public Transform listingsGrid;
    public GameObject listingPrefab;
    public TMP_InputField searchInput;
    public Dropdown categoryDropdown;
    public Slider priceSlider;
    public TextMeshProUGUI priceText;
    
    [Header("Marketplace Data")]
    private MarketplaceListing[] currentListings;
    private Dictionary<string, ListingUI> listingUIs = new Dictionary<string, ListingUI>();
    
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
    
    private void Start()
    {
        InitializeUI();
        _ = LoadMarketplace();
    }
    
    private void InitializeUI()
    {
        searchInput.onValueChanged.AddListener(OnSearchChanged);
        categoryDropdown.onValueChanged.AddListener(OnCategoryChanged);
        priceSlider.onValueChanged.AddListener(OnPriceChanged);
        
        // Configurar categorías
        categoryDropdown.options.Add(new Dropdown.OptionData("All"));
        categoryDropdown.options.Add(new Dropdown.OptionData("Weapons"));
        categoryDropdown.options.Add(new Dropdown.OptionData("Ships"));
        categoryDropdown.options.Add(new Dropdown.OptionData("Resources"));
        categoryDropdown.options.Add(new Dropdown.OptionData("Modules"));
    }
    
    public async Task LoadMarketplace()
    {
        var filters = new
        {
            itemType = categoryDropdown.options[categoryDropdown.value].text,
            maxPrice = priceSlider.value,
            sortBy = "price",
            sortOrder = "asc"
        };
        
        currentListings = await APIController.Instance.GetMarketplaceListings(filters);
        UpdateMarketplaceUI();
    }
    
    public void UpdateMarketplace(MarketplaceData data)
    {
        // Actualizar con datos de WebSocket
        _ = LoadMarketplace();
    }
    
    private void UpdateMarketplaceUI()
    {
        if (currentListings == null) return;
        
        // Limpiar UI existente
        foreach (var listing in listingUIs.Values)
        {
            Destroy(listing.gameObject);
        }
        listingUIs.Clear();
        
        // Crear UI para cada listing
        foreach (var listing in currentListings)
        {
            var listingObj = Instantiate(listingPrefab, listingsGrid);
            var listingUI = listingObj.GetComponent<ListingUI>();
            listingUI.SetListing(listing);
            
            listingUIs[listing.id] = listingUI;
        }
    }
    
    private void OnSearchChanged(string searchText)
    {
        FilterListings();
    }
    
    private void OnCategoryChanged(int categoryIndex)
    {
        FilterListings();
    }
    
    private void OnPriceChanged(float price)
    {
        priceText.text = $"Max: {price:F0}";
        FilterListings();
    }
    
    private void FilterListings()
    {
        // Implementar filtrado
        _ = LoadMarketplace();
    }
    
    public async Task<bool> BuyListing(string listingId, int quantity)
    {
        var success = await APIController.Instance.BuyListing(listingId, quantity);
        
        if (success)
        {
            await LoadMarketplace(); // Refresh marketplace
            await ResourceManager.Instance.LoadResources(); // Refresh resources
        }
        
        return success;
    }
    
    public async Task<bool> CreateListing(string itemId, int quantity, float price, string currency)
    {
        var listingData = new
        {
            itemId = itemId,
            quantity = quantity,
            price = price,
            currency = currency,
            duration = 24 // hours
        };
        
        var success = await APIController.Instance.CreateListing(listingData);
        
        if (success)
        {
            await LoadMarketplace(); // Refresh marketplace
        }
        
        return success;
    }
}
```

---

## 🏗️ **CONFIGURACIÓN DE BUILD WINDOWS**

### **📋 Build Settings**
```csharp
// Build Configuration Script
using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;

public class BuildScript
{
    [MenuItem("Build/Build Windows")]
    public static void BuildWindows()
    {
        // Configurar build options
        var buildOptions = new BuildPlayerOptions
        {
            scenes = GetScenes(),
            locationPathName = "Builds/DESTOCK_SPACE.exe",
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        };
        
        // Configurar player settings
        PlayerSettings.companyName = "DESTOCK SPACE";
        PlayerSettings.productName = "DESTOCK SPACE";
        PlayerSettings.applicationIdentifier = "com.destockspace.game";
        
        // Configurar calidad
        QualitySettings.SetQualityLevel(5); // High
        
        // Ejecutar build
        var report = BuildPipeline.BuildPlayer(buildOptions);
        
        if (report.summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"Build succeeded: {report.summary.totalSize} bytes");
            Debug.Log($"Build time: {report.summary.totalTime}");
        }
        else
        {
            Debug.LogError("Build failed");
        }
    }
    
    private static string[] GetScenes()
    {
        return new string[]
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/SpaceScene.unity",
            "Assets/Scenes/CombatScene.unity",
            "Assets/Scenes/MarketplaceScene.unity",
            "Assets/Scenes/InventoryScene.unity"
        };
    }
}
```

---

## 📚 **DOCUMENTACIÓN API PARA CURSOR**

### **🔌 Endpoints Principales para Cliente Web**
```yaml
# Autenticación
POST /auth/login
POST /auth/register
POST /auth/refresh

# Recursos
GET /economy/resources
POST /economy/resources/transfer
GET /economy/transactions

# Inventario
GET /inventory
POST /inventory/items
PUT /inventory/items/:itemId/equip

# Marketplace
GET /marketplace/listings
POST /marketplace/listings
POST /marketplace/listings/:listingId/buy

# Naves
GET /ships/fleet
POST /ships
PUT /ships/:shipId/equipment

# Combate
POST /combat/initiate
POST /combat/:combatId/actions
GET /combat/:combatId/status

# WebSocket Events
resource:update
inventory:update
combat:initiated
marketplace:update
```

---

## 🎯 **RESULTADO ESPERADO**

Al finalizar este desarrollo:

✅ **Cliente Unity PC** completamente funcional  
✅ **Naves GLB** importadas y configuradas  
✅ **Sistema VFX editable** con presets personalizables  
✅ **Combate espacial** funcional en tiempo real  
✅ **Sistemas MMO** conectados al backend común  
✅ **Build Windows** instalable listo para distribución  
✅ **API documentada** para cliente web (Cursor)  

**El cliente PC será la versión completa del juego con todas las características y sistemas MMO integrados.**
