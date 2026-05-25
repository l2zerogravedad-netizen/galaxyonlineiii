using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.IO;

#if UNITY_EDITOR
[CustomEditor(typeof(VFXManager))]
public class VFXSystemEditor : Editor
{
    private VFXManager vfxManager;
    private bool showEnginePresets = false;
    private bool showWeaponPresets = false;
    private bool showExplosionPresets = false;
    private Vector2 scrollPosition;
    
    private void OnEnable()
    {
        vfxManager = (VFXManager)target;
    }
    
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        
        EditorGUILayout.Space();
        EditorGUILayout.LabelField("VFX System Editor", EditorStyles.boldLabel);
        
        EditorGUILayout.Space();
        
        // Botones principales
        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button("Load VFX Config"))
        {
            vfxManager.LoadVFXConfiguration();
        }
        if (GUILayout.Button("Save VFX Config"))
        {
            vfxManager.SaveVFXConfiguration();
        }
        EditorGUILayout.EndHorizontal();
        
        EditorGUILayout.Space();
        
        // VFX Presets Editor
        scrollPosition = EditorGUILayout.BeginScrollView(scrollPosition);
        
        // Engine Presets
        showEnginePresets = EditorGUILayout.Foldout(showEnginePresets, "Engine Presets");
        if (showEnginePresets)
        {
            DrawEnginePresets();
        }
        
        // Weapon Presets
        showWeaponPresets = EditorGUILayout.Foldout(showWeaponPresets, "Weapon Presets");
        if (showWeaponPresets)
        {
            DrawWeaponPresets();
        }
        
        // Explosion Presets
        showExplosionPresets = EditorGUILayout.Foldout(showExplosionPresets, "Explosion Presets");
        if (showExplosionPresets)
        {
            DrawExplosionPresets();
        }
        
        EditorGUILayout.EndScrollView();
        
        EditorGUILayout.Space();
        
        // Herramientas VFX
        EditorGUILayout.LabelField("VFX Tools", EditorStyles.boldLabel);
        
        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button("Test Engine VFX"))
        {
            TestEngineVFX();
        }
        if (GUILayout.Button("Test Weapon VFX"))
        {
            TestWeaponVFX();
        }
        EditorGUILayout.EndHorizontal();
        
        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button("Test Explosion VFX"))
        {
            TestExplosionVFX();
        }
        if (GUILayout.Button("Clear All VFX"))
        {
            ClearAllVFX();
        }
        EditorGUILayout.EndHorizontal();
        
        if (GUI.changed)
        {
            EditorUtility.SetDirty(vfxManager);
        }
    }
    
    private void DrawEnginePresets()
    {
        EditorGUILayout.BeginVertical("box");
        
        // Botón para añadir nuevo preset
        if (GUILayout.Button("Add Engine Preset"))
        {
            AddEnginePreset();
        }
        
        // Dibujar presets existentes
        for (int i = 0; i < vfxManager.enginePresets.Length; i++)
        {
            DrawEnginePreset(i);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawEnginePreset(int index)
    {
        if (index >= vfxManager.enginePresets.Length) return;
        
        EditorGUILayout.BeginVertical("box");
        
        var preset = vfxManager.enginePresets[index];
        
        // Header con botones
        EditorGUILayout.BeginHorizontal();
        preset.name = EditorGUILayout.TextField("Name", preset.name);
        if (GUILayout.Button("▲", GUILayout.Width(25)))
        {
            MovePresetUp(index, vfxManager.enginePresets);
        }
        if (GUILayout.Button("▼", GUILayout.Width(25)))
        {
            MovePresetDown(index, vfxManager.enginePresets);
        }
        if (GUILayout.Button("X", GUILayout.Width(25)))
        {
            RemovePreset(index, vfxManager.enginePresets);
        }
        EditorGUILayout.EndHorizontal();
        
        // Prefab
        preset.prefab = (GameObject)EditorGUILayout.ObjectField("Prefab", preset.prefab, typeof(GameObject), false);
        
        // Parámetros
        preset.duration = EditorGUILayout.FloatField("Duration", preset.duration);
        preset.size = EditorGUILayout.FloatField("Size", preset.size);
        preset.color = EditorGUILayout.ColorField("Color", preset.color);
        
        // Parámetros avanzados
        if (EditorGUILayout.Foldout(true, "Advanced Parameters"))
        {
            preset.parameters.emissionRate = EditorGUILayout.FloatField("Emission Rate", preset.parameters.emissionRate);
            preset.parameters.startSize = EditorGUILayout.FloatField("Start Size", preset.parameters.startSize);
            preset.parameters.startSpeed = EditorGUILayout.FloatField("Start Speed", preset.parameters.startSpeed);
            preset.parameters.startColor = EditorGUILayout.ColorField("Start Color", preset.parameters.startColor);
            preset.parameters.lifetime = EditorGUILayout.FloatField("Lifetime", preset.parameters.lifetime);
        }
        
        // Botón de prueba
        if (GUILayout.Button("Test This Preset"))
        {
            TestEnginePreset(preset);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawWeaponPresets()
    {
        EditorGUILayout.BeginVertical("box");
        
        if (GUILayout.Button("Add Weapon Preset"))
        {
            AddWeaponPreset();
        }
        
        for (int i = 0; i < vfxManager.weaponPresets.Length; i++)
        {
            DrawWeaponPreset(i);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawWeaponPreset(int index)
    {
        if (index >= vfxManager.weaponPresets.Length) return;
        
        EditorGUILayout.BeginVertical("box");
        
        var preset = vfxManager.weaponPresets[index];
        
        EditorGUILayout.BeginHorizontal();
        preset.name = EditorGUILayout.TextField("Name", preset.name);
        if (GUILayout.Button("▲", GUILayout.Width(25)))
        {
            MovePresetUp(index, vfxManager.weaponPresets);
        }
        if (GUILayout.Button("▼", GUILayout.Width(25)))
        {
            MovePresetDown(index, vfxManager.weaponPresets);
        }
        if (GUILayout.Button("X", GUILayout.Width(25)))
        {
            RemovePreset(index, vfxManager.weaponPresets);
        }
        EditorGUILayout.EndHorizontal();
        
        preset.prefab = (GameObject)EditorGUILayout.ObjectField("Prefab", preset.prefab, typeof(GameObject), false);
        preset.duration = EditorGUILayout.FloatField("Duration", preset.duration);
        preset.size = EditorGUILayout.FloatField("Size", preset.size);
        preset.color = EditorGUILayout.ColorField("Color", preset.color);
        
        if (EditorGUILayout.Foldout(true, "Advanced Parameters"))
        {
            preset.parameters.emissionRate = EditorGUILayout.FloatField("Emission Rate", preset.parameters.emissionRate);
            preset.parameters.startSize = EditorGUILayout.FloatField("Start Size", preset.parameters.startSize);
            preset.parameters.startSpeed = EditorGUILayout.FloatField("Start Speed", preset.parameters.startSpeed);
            preset.parameters.startColor = EditorGUILayout.ColorField("Start Color", preset.parameters.startColor);
            preset.parameters.lifetime = EditorGUILayout.FloatField("Lifetime", preset.parameters.lifetime);
        }
        
        if (GUILayout.Button("Test This Preset"))
        {
            TestWeaponPreset(preset);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawExplosionPresets()
    {
        EditorGUILayout.BeginVertical("box");
        
        if (GUILayout.Button("Add Explosion Preset"))
        {
            AddExplosionPreset();
        }
        
        for (int i = 0; i < vfxManager.explosionPresets.Length; i++)
        {
            DrawExplosionPreset(i);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawExplosionPreset(int index)
    {
        if (index >= vfxManager.explosionPresets.Length) return;
        
        EditorGUILayout.BeginVertical("box");
        
        var preset = vfxManager.explosionPresets[index];
        
        EditorGUILayout.BeginHorizontal();
        preset.name = EditorGUILayout.TextField("Name", preset.name);
        if (GUILayout.Button("▲", GUILayout.Width(25)))
        {
            MovePresetUp(index, vfxManager.explosionPresets);
        }
        if (GUILayout.Button("▼", GUILayout.Width(25)))
        {
            MovePresetDown(index, vfxManager.explosionPresets);
        }
        if (GUILayout.Button("X", GUILayout.Width(25)))
        {
            RemovePreset(index, vfxManager.explosionPresets);
        }
        EditorGUILayout.EndHorizontal();
        
        preset.prefab = (GameObject)EditorGUILayout.ObjectField("Prefab", preset.prefab, typeof(GameObject), false);
        preset.duration = EditorGUILayout.FloatField("Duration", preset.duration);
        preset.size = EditorGUILayout.FloatField("Size", preset.size);
        preset.color = EditorGUILayout.ColorField("Color", preset.color);
        
        if (EditorGUILayout.Foldout(true, "Advanced Parameters"))
        {
            preset.parameters.emissionRate = EditorGUILayout.FloatField("Emission Rate", preset.parameters.emissionRate);
            preset.parameters.startSize = EditorGUILayout.FloatField("Start Size", preset.parameters.startSize);
            preset.parameters.startSpeed = EditorGUILayout.FloatField("Start Speed", preset.parameters.startSpeed);
            preset.parameters.startColor = EditorGUILayout.ColorField("Start Color", preset.parameters.startColor);
            preset.parameters.lifetime = EditorGUILayout.FloatField("Lifetime", preset.parameters.lifetime);
        }
        
        if (GUILayout.Button("Test This Preset"))
        {
            TestExplosionPreset(preset);
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void AddEnginePreset()
    {
        var newPresets = new List<VFXPreset>(vfxManager.enginePresets);
        newPresets.Add(new VFXPreset
        {
            name = "New Engine Preset",
            duration = 2f,
            size = 1f,
            color = Color.cyan,
            parameters = new VFXParameters()
        });
        vfxManager.enginePresets = newPresets.ToArray();
    }
    
    private void AddWeaponPreset()
    {
        var newPresets = new List<VFXPreset>(vfxManager.weaponPresets);
        newPresets.Add(new VFXPreset
        {
            name = "New Weapon Preset",
            duration = 1f,
            size = 0.5f,
            color = Color.red,
            parameters = new VFXParameters()
        });
        vfxManager.weaponPresets = newPresets.ToArray();
    }
    
    private void AddExplosionPreset()
    {
        var newPresets = new List<VFXPreset>(vfxManager.explosionPresets);
        newPresets.Add(new VFXPreset
        {
            name = "New Explosion Preset",
            duration = 3f,
            size = 2f,
            color = Color.orange,
            parameters = new VFXParameters()
        });
        vfxManager.explosionPresets = newPresets.ToArray();
    }
    
    private void MovePresetUp(int index, VFXPreset[] presets)
    {
        if (index > 0)
        {
            var temp = presets[index];
            presets[index] = presets[index - 1];
            presets[index - 1] = temp;
        }
    }
    
    private void MovePresetDown(int index, VFXPreset[] presets)
    {
        if (index < presets.Length - 1)
        {
            var temp = presets[index];
            presets[index] = presets[index + 1];
            presets[index + 1] = temp;
        }
    }
    
    private void RemovePreset(int index, VFXPreset[] presets)
    {
        var newPresets = new List<VFXPreset>(presets);
        newPresets.RemoveAt(index);
        
        if (presets == vfxManager.enginePresets)
            vfxManager.enginePresets = newPresets.ToArray();
        else if (presets == vfxManager.weaponPresets)
            vfxManager.weaponPresets = newPresets.ToArray();
        else if (presets == vfxManager.explosionPresets)
            vfxManager.explosionPresets = newPresets.ToArray();
    }
    
    private void TestEngineVFX()
    {
        if (vfxManager.enginePresets.Length > 0)
        {
            TestEnginePreset(vfxManager.enginePresets[0]);
        }
    }
    
    private void TestWeaponVFX()
    {
        if (vfxManager.weaponPresets.Length > 0)
        {
            TestWeaponPreset(vfxManager.weaponPresets[0]);
        }
    }
    
    private void TestExplosionVFX()
    {
        if (vfxManager.explosionPresets.Length > 0)
        {
            TestExplosionPreset(vfxManager.explosionPresets[0]);
        }
    }
    
    private void TestEnginePreset(VFXPreset preset)
    {
        Vector3 testPosition = SceneView.lastActiveSceneView.camera.transform.position + 
                              SceneView.lastActiveSceneView.camera.transform.forward * 10f;
        
        if (Application.isPlaying)
        {
            VFXManager.Instance.CreateEngineEffect(testPosition, Quaternion.identity, preset.name);
        }
        else
        {
            Debug.Log($"Test Engine VFX: {preset.name} at {testPosition}");
        }
    }
    
    private void TestWeaponPreset(VFXPreset preset)
    {
        Vector3 testPosition = SceneView.lastActiveSceneView.camera.transform.position + 
                              SceneView.lastActiveSceneView.camera.transform.forward * 10f;
        
        if (Application.isPlaying)
        {
            VFXManager.Instance.CreateWeaponEffect(testPosition, testPosition + Vector3.forward * 5f, WeaponType.Laser);
        }
        else
        {
            Debug.Log($"Test Weapon VFX: {preset.name} at {testPosition}");
        }
    }
    
    private void TestExplosionPreset(VFXPreset preset)
    {
        Vector3 testPosition = SceneView.lastActiveSceneView.camera.transform.position + 
                              SceneView.lastActiveSceneView.camera.transform.forward * 10f;
        
        if (Application.isPlaying)
        {
            VFXManager.Instance.CreateExplosion(testPosition, preset.size);
        }
        else
        {
            Debug.Log($"Test Explosion VFX: {preset.name} at {testPosition}");
        }
    }
    
    private void ClearAllVFX()
    {
        if (Application.isPlaying)
        {
            // Encontrar y destruir todos los VFX activos
            var vfxObjects = GameObject.FindGameObjectsWithTag("VFX");
            foreach (var vfx in vfxObjects)
            {
                DestroyImmediate(vfx);
            }
        }
        else
        {
            Debug.Log("Clear all VFX (only works in play mode)");
        }
    }
}

// Ventana de herramientas VFX
public class VFXToolsWindow : EditorWindow
{
    private VFXManager vfxManager;
    private Vector2 scrollPosition;
    private string searchFilter = "";
    
    [MenuItem("Tools/VFX Tools")]
    public static void ShowWindow()
    {
        GetWindow<VFXToolsWindow>("VFX Tools");
    }
    
    private void OnEnable()
    {
        vfxManager = FindObjectOfType<VFXManager>();
        if (vfxManager == null)
        {
            Debug.LogWarning("VFXManager not found in scene");
        }
    }
    
    private void OnGUI()
    {
        EditorGUILayout.LabelField("VFX Tools", EditorStyles.boldLabel);
        
        if (vfxManager == null)
        {
            EditorGUILayout.HelpBox("VFXManager not found in scene. Please add it to continue.", MessageType.Warning);
            return;
        }
        
        EditorGUILayout.Space();
        
        // Search filter
        searchFilter = EditorGUILayout.TextField("Search", searchFilter);
        
        EditorGUILayout.Space();
        
        scrollPosition = EditorGUILayout.BeginScrollView(scrollPosition);
        
        // Engine VFX
        DrawVFXCategory("Engine VFX", vfxManager.enginePresets);
        
        // Weapon VFX
        DrawVFXCategory("Weapon VFX", vfxManager.weaponPresets);
        
        // Explosion VFX
        DrawVFXCategory("Explosion VFX", vfxManager.explosionPresets);
        
        EditorGUILayout.EndScrollView();
        
        EditorGUILayout.Space();
        
        // Global controls
        EditorGUILayout.LabelField("Global Controls", EditorStyles.boldLabel);
        
        if (GUILayout.Button("Refresh VFX Manager"))
        {
            vfxManager = FindObjectOfType<VFXManager>();
        }
        
        if (GUILayout.Button("Export VFX Library"))
        {
            ExportVFXLibrary();
        }
        
        if (GUILayout.Button("Import VFX Library"))
        {
            ImportVFXLibrary();
        }
    }
    
    private void DrawVFXCategory(string categoryName, VFXPreset[] presets)
    {
        EditorGUILayout.LabelField(categoryName, EditorStyles.boldLabel);
        
        foreach (var preset in presets)
        {
            if (!string.IsNullOrEmpty(searchFilter) && !preset.name.ToLower().Contains(searchFilter.ToLower()))
                continue;
            
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField(preset.name, GUILayout.Width(150));
            
            if (GUILayout.Button("Test", GUILayout.Width(50)))
            {
                TestPreset(preset, categoryName);
            }
            
            if (GUILayout.Button("Edit", GUILayout.Width(50)))
            {
                SelectPreset(preset);
            }
            
            EditorGUILayout.EndHorizontal();
        }
        
        EditorGUILayout.Space();
    }
    
    private void TestPreset(VFXPreset preset, string category)
    {
        if (!Application.isPlaying)
        {
            Debug.LogWarning("VFX testing only works in play mode");
            return;
        }
        
        Vector3 testPosition = Camera.main.transform.position + Camera.main.transform.forward * 10f;
        
        switch (category)
        {
            case "Engine VFX":
                VFXManager.Instance.CreateEngineEffect(testPosition, Quaternion.identity, preset.name);
                break;
            case "Weapon VFX":
                VFXManager.Instance.CreateWeaponEffect(testPosition, testPosition + Vector3.forward * 5f, WeaponType.Laser);
                break;
            case "Explosion VFX":
                VFXManager.Instance.CreateExplosion(testPosition, preset.size);
                break;
        }
    }
    
    private void SelectPreset(VFXPreset preset)
    {
        Selection.activeObject = preset.prefab;
        EditorGUIUtility.PingObject(preset.prefab);
    }
    
    private void ExportVFXLibrary()
    {
        var library = new VFXLibrary
        {
            enginePresets = vfxManager.enginePresets,
            weaponPresets = vfxManager.weaponPresets,
            explosionPresets = vfxManager.explosionPresets,
            exportDate = System.DateTime.Now.ToString(),
            version = "1.0"
        };
        
        string path = EditorUtility.SaveFilePanel("Export VFX Library", "", "vfx_library", "json");
        
        if (!string.IsNullOrEmpty(path))
        {
            string json = JsonConvert.SerializeObject(library, Formatting.Indented);
            File.WriteAllText(path, json);
            
            Debug.Log($"VFX Library exported to: {path}");
        }
    }
    
    private void ImportVFXLibrary()
    {
        string path = EditorUtility.OpenFilePanel("Import VFX Library", "", "json");
        
        if (!string.IsNullOrEmpty(path) && File.Exists(path))
        {
            string json = File.ReadAllText(path);
            var library = JsonConvert.DeserializeObject<VFXLibrary>(json);
            
            vfxManager.enginePresets = library.enginePresets;
            vfxManager.weaponPresets = library.weaponPresets;
            vfxManager.explosionPresets = library.explosionPresets;
            
            Debug.Log($"VFX Library imported from: {path}");
            Debug.Log($"Version: {library.version}, Exported: {library.exportDate}");
        }
    }
}

[System.Serializable]
public class VFXLibrary
{
    public VFXPreset[] enginePresets;
    public VFXPreset[] weaponPresets;
    public VFXPreset[] explosionPresets;
    public string version;
    public string exportDate;
}

#endif
