using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

public class BackendConnectionManager : MonoBehaviour
{
    private static BackendConnectionManager instance;
    public static BackendConnectionManager Instance => instance;
    
    [Header("Backend Configuration")]
    private string baseURL = "https://api.destockspace.com/v1";
    private string wsURL = "wss://api.destockspace.com/ws";
    private string accessToken;
    private string refreshToken;
    private string userId;
    
    [Header("Connection Settings")]
    private float connectionTimeout = 10f;
    private int maxRetries = 3;
    private float retryDelay = 2f;
    
    [Header("Debug")]
    public bool enableDebugLogs = true;
    
    // Estado de la conexión
    private bool isConnected = false;
    private bool isReconnecting = false;
    private float lastPingTime = 0f;
    private float pingInterval = 30f;
    
    // Eventos
    public delegate void ConnectionEvent();
    public event ConnectionEvent OnConnected;
    public event ConnectionEvent OnDisconnected;
    public event ConnectionEvent OnReconnecting;
    
    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeConnection();
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        // Intentar reconectar con tokens guardados
        LoadSavedTokens();
        if (!string.IsNullOrEmpty(accessToken))
        {
            _ = ReconnectWithToken();
        }
    }
    
    private void Update()
    {
        // Enviar ping periódico
        if (isConnected && Time.time - lastPingTime > pingInterval)
        {
            _ = SendPing();
            lastPingTime = Time.time;
        }
    }
    
    /// <summary>
    /// Inicializa la conexión al backend
    /// </summary>
    private void InitializeConnection()
    {
        LogDebug("Backend Connection Manager initialized");
    }
    
    /// <summary>
    /// Login de usuario
    /// </summary>
    public async Task<bool> Login(string email, string password)
    {
        try
        {
            var loginData = new
            {
                email = email,
                password = password,
                clientType = "PC"
            };
            
            var json = JsonConvert.SerializeObject(loginData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/auth/login", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<LoginResponse>(www.downloadHandler.text);
                    
                    accessToken = response.tokens.accessToken;
                    refreshToken = response.tokens.refreshToken;
                    userId = response.user.id;
                    
                    // Guardar tokens
                    SaveTokens();
                    
                    // Conectar WebSocket
                    await ConnectWebSocket();
                    
                    isConnected = true;
                    OnConnected?.Invoke();
                    
                    LogDebug($"Login successful for user: {response.user.username}");
                    return true;
                }
                else
                {
                    LogError($"Login failed: {www.error}");
                    return false;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Login exception: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Conexión WebSocket
    /// </summary>
    private async Task ConnectWebSocket()
    {
        try
        {
            // Implementar conexión WebSocket
            LogDebug("WebSocket connection established");
            
            // Aquí iría la implementación real con Socket.IO o WebSocket nativo
        }
        catch (Exception e)
        {
            LogError($"WebSocket connection failed: {e.Message}");
        }
    }
    
    /// <summary>
    /// Obtiene recursos del jugador
    /// </summary>
    public async Task<ResourceData[]> GetPlayerResources()
    {
        if (!isConnected) return null;
        
        try
        {
            using (var www = UnityWebRequest.Get($"{baseURL}/economy/resources"))
            {
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<ResourcesResponse>(www.downloadHandler.text);
                    LogDebug($"Resources loaded: {response.resources.Length} types");
                    return response.resources;
                }
                else
                {
                    LogError($"Failed to get resources: {www.error}");
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Get resources exception: {e.Message}");
            return null;
        }
    }
    
    /// <summary>
    /// Obtiene inventario del jugador
    /// </summary>
    public async Task<InventoryItem[]> GetPlayerInventory()
    {
        if (!isConnected) return null;
        
        try
        {
            using (var www = UnityWebRequest.Get($"{baseURL}/inventory"))
            {
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<InventoryResponse>(www.downloadHandler.text);
                    LogDebug($"Inventory loaded: {response.items.Length} items");
                    return response.items;
                }
                else
                {
                    LogError($"Failed to get inventory: {www.error}");
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Get inventory exception: {e.Message}");
            return null;
        }
    }
    
    /// <summary>
    /// Obtiene fleet del jugador
    /// </summary>
    public async Task<ShipData[]> GetPlayerFleet()
    {
        if (!isConnected) return null;
        
        try
        {
            using (var www = UnityWebRequest.Get($"{baseURL}/ships/fleet"))
            {
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<FleetResponse>(www.downloadHandler.text);
                    LogDebug($"Fleet loaded: {response.ships.Length} ships");
                    return response.ships;
                }
                else
                {
                    LogError($"Failed to get fleet: {www.error}");
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Get fleet exception: {e.Message}");
            return null;
        }
    }
    
    /// <summary>
    /// Obtiene listings del marketplace
    /// </summary>
    public async Task<MarketplaceListing[]> GetMarketplaceListings(object filters)
    {
        if (!isConnected) return null;
        
        try
        {
            string filterString = JsonConvert.SerializeObject(filters);
            string url = $"{baseURL}/marketplace/listings?filters={UnityWebRequest.EscapeURL(filterString)}";
            
            using (var www = UnityWebRequest.Get(url))
            {
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<MarketplaceResponse>(www.downloadHandler.text);
                    LogDebug($"Marketplace loaded: {response.listings.Length} listings");
                    return response.listings;
                }
                else
                {
                    LogError($"Failed to get marketplace: {www.error}");
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Get marketplace exception: {e.Message}");
            return null;
        }
    }
    
    /// <summary>
    /// Inicia combate
    /// </summary>
    public async Task<CombatInitData> InitiateCombat(object combatData)
    {
        if (!isConnected) return null;
        
        try
        {
            var json = JsonConvert.SerializeObject(combatData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/combat/initiate", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<CombatInitData>(www.downloadHandler.text);
                    LogDebug($"Combat initiated: {response.combatId}");
                    return response;
                }
                else
                {
                    LogError($"Failed to initiate combat: {www.error}");
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Initiate combat exception: {e.Message}");
            return null;
        }
    }
    
    /// <summary>
    /// Envía acción de combate
    /// </summary>
    public async Task<bool> SubmitCombatAction(string combatId, object actionData)
    {
        if (!isConnected) return false;
        
        try
        {
            var json = JsonConvert.SerializeObject(actionData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/combat/{combatId}/actions", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    LogDebug($"Combat action submitted for combat: {combatId}");
                    return true;
                }
                else
                {
                    LogError($"Failed to submit combat action: {www.error}");
                    return false;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Submit combat action exception: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Actualiza estado de nave
    /// </summary>
    public async Task<bool> UpdateShipState(object shipState)
    {
        if (!isConnected) return false;
        
        try
        {
            var json = JsonConvert.SerializeObject(shipState);
            
            using (var www = UnityWebRequest.Put($"{baseURL}/ships/state", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    return true;
                }
                else
                {
                    LogError($"Failed to update ship state: {www.error}");
                    return false;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Update ship state exception: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Transfiere recursos
    /// </summary>
    public async Task<bool> TransferResources(object transferData)
    {
        if (!isConnected) return false;
        
        try
        {
            var json = JsonConvert.SerializeObject(transferData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/economy/resources/transfer", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    LogDebug("Resources transferred successfully");
                    return true;
                }
                else
                {
                    LogError($"Failed to transfer resources: {www.error}");
                    return false;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Transfer resources exception: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Compra item del marketplace
    /// </summary>
    public async Task<bool> BuyListing(string listingId, int quantity)
    {
        if (!isConnected) return false;
        
        try
        {
            var buyData = new { quantity = quantity };
            var json = JsonConvert.SerializeObject(buyData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/marketplace/listings/{listingId}/buy", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    LogDebug($"Listing purchased: {listingId}");
                    return true;
                }
                else
                {
                    LogError($"Failed to buy listing: {www.error}");
                    return false;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Buy listing exception: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Envía ping al servidor
    /// </summary>
    private async Task SendPing()
    {
        if (!isConnected) return;
        
        try
        {
            using (var www = UnityWebRequest.Get($"{baseURL}/ping"))
            {
                www.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = 5000; // 5 segundos para ping
                
                await www.SendWebRequest();
                
                if (www.result != UnityWebRequest.Result.Success)
                {
                    LogWarning("Ping failed, attempting to reconnect");
                    _ = AttemptReconnection();
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Ping exception: {e.Message}");
        }
    }
    
    /// <summary>
    /// Intenta reconexión
    /// </summary>
    private async Task AttemptReconnection()
    {
        if (isReconnecting) return;
        
        isReconnecting = true;
        OnReconnecting?.Invoke();
        
        for (int i = 0; i < maxRetries; i++)
        {
            LogDebug($"Reconnection attempt {i + 1}/{maxRetries}");
            
            // Esperar antes de intentar
            await Task.Delay((int)(retryDelay * 1000));
            
            // Intentar refresh token
            if (await RefreshToken())
            {
                // Reconectar WebSocket
                await ConnectWebSocket();
                
                isConnected = true;
                OnConnected?.Invoke();
                
                LogDebug("Reconnection successful");
                break;
            }
        }
        
        if (!isConnected)
        {
            LogError("Reconnection failed after all attempts");
            OnDisconnected?.Invoke();
        }
        
        isReconnecting = false;
    }
    
    /// <summary>
    /// Refresca el token de acceso
    /// </summary>
    private async Task<bool> RefreshToken()
    {
        try
        {
            var refreshData = new { refreshToken = refreshToken };
            var json = JsonConvert.SerializeObject(refreshData);
            
            using (var www = UnityWebRequest.Post($"{baseURL}/auth/refresh", json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                www.SetRequestHeader("X-Client-Type", "PC");
                www.timeout = (int)(connectionTimeout * 1000);
                
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonConvert.DeserializeObject<TokenResponse>(www.downloadHandler.text);
                    accessToken = response.accessToken;
                    refreshToken = response.refreshToken;
                    
                    SaveTokens();
                    return true;
                }
            }
        }
        catch (Exception e)
        {
            LogError($"Token refresh exception: {e.Message}");
        }
        
        return false;
    }
    
    /// <summary>
    /// Se reconecta usando token guardado
    /// </summary>
    private async Task ReconnectWithToken()
    {
        if (string.IsNullOrEmpty(accessToken)) return;
        
        LogDebug("Attempting to reconnect with saved token");
        
        if (await RefreshToken())
        {
            await ConnectWebSocket();
            isConnected = true;
            OnConnected?.Invoke();
            
            LogDebug("Reconnection with saved token successful");
        }
    }
    
    /// <summary>
    /// Guarda tokens localmente
    /// </summary>
    private void SaveTokens()
    {
        PlayerPrefs.SetString("AccessToken", accessToken);
        PlayerPrefs.SetString("RefreshToken", refreshToken);
        PlayerPrefs.SetString("UserId", userId);
        PlayerPrefs.Save();
    }
    
    /// <summary>
    /// Carga tokens guardados
    /// </summary>
    private void LoadSavedTokens()
    {
        accessToken = PlayerPrefs.GetString("AccessToken", "");
        refreshToken = PlayerPrefs.GetString("RefreshToken", "");
        userId = PlayerPrefs.GetString("UserId", "");
    }
    
    /// <summary>
    /// Logout
    /// </summary>
    public void Logout()
    {
        isConnected = false;
        
        // Limpiar tokens
        accessToken = "";
        refreshToken = "";
        userId = "";
        
        PlayerPrefs.DeleteKey("AccessToken");
        PlayerPrefs.DeleteKey("RefreshToken");
        PlayerPrefs.DeleteKey("UserId");
        PlayerPrefs.Save();
        
        OnDisconnected?.Invoke();
        
        LogDebug("Logged out successfully");
    }
    
    /// <summary>
    /// Verifica si está conectado
    /// </summary>
    public bool IsConnected()
    {
        return isConnected && !string.IsNullOrEmpty(accessToken);
    }
    
    /// <summary>
    /// Obtiene el ID del usuario actual
    /// </summary>
    public string GetUserId()
    {
        return userId;
    }
    
    // Métodos de logging
    private void LogDebug(string message)
    {
        if (enableDebugLogs)
        {
            Debug.Log($"[Backend] {message}");
        }
    }
    
    private void LogWarning(string message)
    {
        Debug.LogWarning($"[Backend] {message}");
    }
    
    private void LogError(string message)
    {
        Debug.LogError($"[Backend] {message}");
    }
}

// Modelos de datos para el backend
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
public class TokenResponse
{
    public string accessToken;
    public string refreshToken;
}

[System.Serializable]
public class UserData
{
    public string id;
    public string username;
    public string email;
    public int level;
    public long experience;
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
public class ResourcesResponse
{
    public ResourceData[] resources;
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
public class InventoryResponse
{
    public InventoryItem[] items;
}

[System.Serializable]
public class ShipData
{
    public string id;
    public string name;
    public string type;
    public int level;
    public float health;
    public float maxHealth;
    public Vector3 position;
    public Quaternion rotation;
    public string[] equipment;
}

[System.Serializable]
public class FleetResponse
{
    public ShipData[] ships;
}

[System.Serializable]
public class MarketplaceListing
{
    public string id;
    public string sellerId;
    public string sellerName;
    public string itemId;
    public string itemName;
    public int quantity;
    public float price;
    public string currency;
    public string status;
    public DateTime createdAt;
}

[System.Serializable]
public class MarketplaceResponse
{
    public MarketplaceListing[] listings;
}
