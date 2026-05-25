using UnityEngine;
using GLTFast;
using System.Threading.Tasks;
using System.IO;
using Newtonsoft.Json;

public class GLBShipImporter : MonoBehaviour
{
    [Header("GLB Import Settings")]
    public string glbBasePath = "Assets/Models/Ships/";
    public bool generateColliders = true;
    public bool optimizeMesh = true;
    public bool generateLODs = true;
    
    [Header("Material Settings")]
    public Material shipMaterial;
    public Material engineMaterial;
    public Material weaponMaterial;
    
    private GltfImport gltfImport;
    private ShipDatabase shipDatabase;
    
    private void Awake()
    {
        shipDatabase = GetComponent<ShipDatabase>();
        gltfImport = new GltfImport();
    }
    
    /// <summary>
    /// Importa una nave desde archivo GLB
    /// </summary>
    /// <param name="shipType">Tipo de nave (Fighter, Cruiser, etc.)</param>
    /// <param name="shipName">Nombre del archivo GLB</param>
    /// <returns>GameObject de la nave importada</returns>
    public async Task<GameObject> ImportShip(string shipType, string shipName)
    {
        string fullPath = Path.Combine(glbBasePath, shipType, shipName + ".glb");
        
        Debug.Log($"Importing ship: {fullPath}");
        
        // Verificar si el archivo existe
        if (!File.Exists(fullPath))
        {
            Debug.LogError($"GLB file not found: {fullPath}");
            return null;
        }
        
        // Importar GLB
        bool success = await gltfImport.Load(fullPath);
        
        if (!success)
        {
            Debug.LogError($"Failed to import GLB: {fullPath}");
            return null;
        }
        
        // Crear instancia del modelo
        GameObject shipInstance = gltfImport.InstantiateScene();
        
        // Configurar nave
        await ConfigureShip(shipInstance, shipType, shipName);
        
        // Guardar en base de datos
        shipDatabase.SaveShip(shipType, shipName, shipInstance);
        
        return shipInstance;
    }
    
    /// <summary>
    /// Configura la nave importada con componentes y materiales
    /// </summary>
    private async Task ConfigureShip(GameObject ship, string shipType, string shipName)
    {
        // Añadir componentes básicos
        ship.AddComponent<Rigidbody>();
        ship.AddComponent<BoxCollider>();
        
        // Configurar Rigidbody
        Rigidbody rb = ship.GetComponent<Rigidbody>();
        rb.mass = GetShipMass(shipType);
        rb.drag = 0.1f;
        rb.angularDrag = 0.5f;
        rb.useGravity = false;
        
        // Aplicar materiales
        await ApplyShipMaterials(ship, shipType);
        
        // Generar colliders
        if (generateColliders)
        {
            GenerateColliders(ship);
        }
        
        // Optimizar mesh
        if (optimizeMesh)
        {
            OptimizeMesh(ship);
        }
        
        // Generar LODs
        if (generateLODs)
        {
            await GenerateLODs(ship, shipType);
        }
        
        // Añadir componentes específicos de nave
        AddShipComponents(ship, shipType);
        
        Debug.Log($"Ship configured: {shipName} ({shipType})");
    }
    
    /// <summary>
    /// Aplica materiales personalizados a la nave
    /// </summary>
    private async Task ApplyShipMaterials(GameObject ship, string shipType)
    {
        Renderer[] renderers = ship.GetComponentsInChildren<Renderer>();
        
        foreach (Renderer renderer in renderers)
        {
            foreach (Material material in renderer.materials)
            {
                // Determinar tipo de material basado en el nombre del objeto
                string objectName = renderer.gameObject.name.ToLower();
                
                if (objectName.Contains("engine") || objectName.Contains("thruster"))
                {
                    material.CopyPropertiesFromMaterial(engineMaterial);
                }
                else if (objectName.Contains("weapon") || objectName.Contains("gun") || objectName.Contains("cannon"))
                {
                    material.CopyPropertiesFromMaterial(weaponMaterial);
                }
                else
                {
                    material.CopyPropertiesFromMaterial(shipMaterial);
                }
                
                // Configurar propiedades del material
                material.SetFloat("_Metallic", 0.8f);
                material.SetFloat("_Glossiness", 0.9f);
                material.SetColor("_EmissionColor", GetShipEmissionColor(shipType) * 0.1f);
            }
        }
    }
    
    /// <summary>
    /// Genera colliders automáticos para la nave
    /// </summary>
    private void GenerateColliders(GameObject ship)
    {
        // Eliminar colliders existentes
        Collider[] existingColliders = ship.GetComponentsInChildren<Collider>();
        foreach (Collider collider in existingColliders)
        {
            DestroyImmediate(collider);
        }
        
        // Añadir collider principal
        MeshFilter mainMeshFilter = ship.GetComponentInChildren<MeshFilter>();
        if (mainMeshFilter != null)
        {
            MeshCollider mainCollider = ship.AddComponent<MeshCollider>();
            mainCollider.sharedMesh = mainMeshFilter.sharedMesh;
            mainCollider.convex = true;
        }
        
        // Añadir colliders para partes importantes
        Transform[] childTransforms = ship.GetComponentsInChildren<Transform>();
        foreach (Transform child in childTransforms)
        {
            if (child.name.ToLower().Contains("engine") || 
                child.name.ToLower().Contains("weapon") || 
                child.name.ToLower().Contains("bridge"))
            {
                MeshFilter childMesh = child.GetComponent<MeshFilter>();
                if (childMesh != null)
                {
                    MeshCollider childCollider = child.gameObject.AddComponent<MeshCollider>();
                    childCollider.sharedMesh = childMesh.sharedMesh;
                    childCollider.convex = true;
                    childCollider.isTrigger = true;
                }
            }
        }
    }
    
    /// <summary>
    /// Optimiza el mesh de la nave
    /// </summary>
    private void OptimizeMesh(GameObject ship)
    {
        MeshFilter[] meshFilters = ship.GetComponentsInChildren<MeshFilter>();
        
        foreach (MeshFilter meshFilter in meshFilters)
        {
            Mesh mesh = meshFilter.sharedMesh;
            
            // Combinar meshes duplicados
            if (mesh != null)
            {
                mesh.Optimize();
                mesh.RecalculateNormals();
                mesh.RecalculateBounds();
            }
        }
    }
    
    /// <summary>
    /// Genera niveles de detalle (LOD) para la nave
    /// </summary>
    private async Task GenerateLODs(GameObject ship, string shipType)
    {
        LODGroup lodGroup = ship.GetComponent<LODGroup>();
        if (lodGroup == null)
        {
            lodGroup = ship.AddComponent<LODGroup>();
        }
        
        // Crear diferentes niveles de detalle
        GameObject lod0 = await CreateLOD(ship, 1.0f, 0); // Alta calidad
        GameObject lod1 = await CreateLOD(ship, 0.5f, 1); // Media calidad
        GameObject lod2 = await CreateLOD(ship, 0.25f, 2); // Baja calidad
        
        // Configurar LODs
        LOD[] lods = new LOD[3];
        lods[0] = new LOD(0.6f, new Renderer[] { lod0.GetComponent<Renderer>() });
        lods[1] = new LOD(0.3f, new Renderer[] { lod1.GetComponent<Renderer>() });
        lods[2] = new LOD(0.1f, new Renderer[] { lod2.GetComponent<Renderer>() });
        
        lodGroup.SetLODs(lods);
        lodGroup.RecalculateBounds();
    }
    
    /// <summary>
    /// Crea un nivel de detalle específico
    /// </summary>
    private async Task<GameObject> CreateLOD(GameObject original, float quality, int lodLevel)
    {
        GameObject lod = Instantiate(original);
        lod.name = $"{original.name}_LOD{lodLevel}";
        
        // Reducir polígonos basado en el nivel de LOD
        MeshFilter[] meshFilters = lod.GetComponentsInChildren<MeshFilter>();
        foreach (MeshFilter meshFilter in meshFilters)
        {
            Mesh mesh = meshFilter.sharedMesh;
            if (mesh != null)
            {
                // Simplificar mesh (usar Unity Mesh Simplifier si está disponible)
                int targetTriangles = Mathf.RoundToInt(mesh.triangles.Length / 3 * quality);
                // Aquí iría la lógica de simplificación de mesh
            }
        }
        
        return lod;
    }
    
    /// <summary>
    /// Añade componentes específicos de nave
    /// </summary>
    private void AddShipComponents(GameObject ship, string shipType)
    {
        // Añadir ShipController
        ShipController shipController = ship.AddComponent<ShipController>();
        shipController.shipType = shipType;
        
        // Añadir ShipMovement
        ShipMovement shipMovement = ship.AddComponent<ShipMovement>();
        shipMovement.ConfigureMovement(shipType);
        
        // Añadir ShipCombat
        ShipCombat shipCombat = ship.AddComponent<ShipCombat>();
        shipCombat.ConfigureCombat(shipType);
        
        // Añadir ShipVisuals
        ShipVisuals shipVisuals = ship.AddComponent<ShipVisuals>();
        
        // Añadir WeaponSystem basado en el tipo de nave
        WeaponSystem weaponSystem = ship.AddComponent<WeaponSystem>();
        weaponSystem.ConfigureWeapons(shipType);
        
        // Añadir ShieldController
        ShieldController shieldController = ship.AddComponent<ShieldController>();
        shieldController.ConfigureShield(shipType);
    }
    
    /// <summary>
    /// Obtiene la masa de la nave basada en su tipo
    /// </summary>
    private float GetShipMass(string shipType)
    {
        switch (shipType.ToLower())
        {
            case "fighter":
                return 1000f;
            case "cruiser":
                return 5000f;
            case "battleship":
                return 10000f;
            case "carrier":
                return 15000f;
            default:
                return 2000f;
        }
    }
    
    /// <summary>
    /// Obtiene el color de emisión basado en el tipo de nave
    /// </summary>
    private Color GetShipEmissionColor(string shipType)
    {
        switch (shipType.ToLower())
        {
            case "fighter":
                return Color.cyan;
            case "cruiser":
                return Color.blue;
            case "battleship":
                return Color.red;
            case "carrier":
                return Color.green;
            default:
                return Color.white;
        }
    }
    
    /// <summary>
    /// Importa todas las naves de un directorio
    /// </summary>
    public async Task ImportAllShips()
    {
        string[] shipTypes = { "Fighter", "Cruiser", "Battleship", "Carrier" };
        
        foreach (string shipType in shipTypes)
        {
            string typePath = Path.Combine(glbBasePath, shipType);
            
            if (Directory.Exists(typePath))
            {
                string[] glbFiles = Directory.GetFiles(typePath, "*.glb");
                
                foreach (string glbFile in glbFiles)
                {
                    string shipName = Path.GetFileNameWithoutExtension(glbFile);
                    await ImportShip(shipType, shipName);
                }
            }
        }
        
        Debug.Log("All ships imported successfully");
    }
    
    /// <summary>
    /// Exporta configuración de naves a JSON
    /// </summary>
    public void ExportShipConfiguration()
    {
        var config = new ShipConfiguration
        {
            ships = shipDatabase.GetAllShips(),
            importSettings = new ImportSettings
            {
                generateColliders = generateColliders,
                optimizeMesh = optimizeMesh,
                generateLODs = generateLODs
            }
        };
        
        string json = JsonConvert.SerializeObject(config, Formatting.Indented);
        File.WriteAllText(Application.persistentDataPath + "/ship_config.json", json);
        
        Debug.Log("Ship configuration exported");
    }
    
    /// <summary>
    /// Importa configuración de naves desde JSON
    /// </summary>
    public void ImportShipConfiguration()
    {
        string path = Application.persistentDataPath + "/ship_config.json";
        
        if (File.Exists(path))
        {
            string json = File.ReadAllText(path);
            var config = JsonConvert.DeserializeObject<ShipConfiguration>(json);
            
            // Aplicar configuración
            generateColliders = config.importSettings.generateColliders;
            optimizeMesh = config.importSettings.optimizeMesh;
            generateLODs = config.importSettings.generateLODs;
            
            Debug.Log("Ship configuration imported");
        }
    }
}

[System.Serializable]
public class ShipConfiguration
{
    public ShipData[] ships;
    public ImportSettings importSettings;
}

[System.Serializable]
public class ImportSettings
{
    public bool generateColliders;
    public bool optimizeMesh;
    public bool generateLODs;
}
