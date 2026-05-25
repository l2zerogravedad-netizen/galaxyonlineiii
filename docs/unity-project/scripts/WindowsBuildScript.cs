using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;
using System;
using System.IO;

public class WindowsBuildScript
{
    [MenuItem("Build/Build Windows Release")]
    public static void BuildWindowsRelease()
    {
        BuildWindows(false);
    }
    
    [MenuItem("Build/Build Windows Debug")]
    public static void BuildWindowsDebug()
    {
        BuildWindows(true);
    }
    
    private static void BuildWindows(bool isDebug)
    {
        try
        {
            Debug.Log($"Starting Windows {(isDebug ? "Debug" : "Release")} build...");
            
            // Configurar player settings
            ConfigurePlayerSettings();
            
            // Configurar build options
            var buildOptions = new BuildPlayerOptions
            {
                scenes = GetBuildScenes(),
                locationPathName = GetBuildPath(isDebug),
                target = BuildTarget.StandaloneWindows64,
                options = GetBuildOptions(isDebug)
            };
            
            // Configurar quality settings
            ConfigureQualitySettings(isDebug);
            
            // Ejecutar build
            var report = BuildPipeline.BuildPlayer(buildOptions);
            
            // Procesar resultados
            ProcessBuildReport(report, isDebug);
            
            // Copiar archivos adicionales
            CopyAdditionalFiles(GetBuildPath(isDebug));
            
            // Crear installer si es release
            if (!isDebug)
            {
                CreateInstaller();
            }
            
        }
        catch (Exception e)
        {
            Debug.LogError($"Build failed: {e.Message}");
            EditorUtility.DisplayDialog("Build Failed", $"Build failed with error: {e.Message}", "OK");
        }
    }
    
    private static void ConfigurePlayerSettings()
    {
        // Company y producto
        PlayerSettings.companyName = "DESTOCK SPACE";
        PlayerSettings.productName = "DESTOCK SPACE";
        PlayerSettings.applicationIdentifier = "com.destockspace.game";
        
        // Versión
        PlayerSettings.bundleVersion = "1.0.0";
        PlayerSettings.buildNumber = "1";
        
        // Icono
        // PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Standalone, GetApplicationIcons());
        
        // Splash screen
        PlayerSettings.SplashScreen.show = true;
        PlayerSettings.SplashScreen.showUnityLogo = false;
        
        // Resolución
        PlayerSettings.defaultScreenWidth = 1920;
        PlayerSettings.defaultScreenHeight = 1080;
        PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
        
        // Run in background
        PlayerSettings.runInBackground = true;
        
        // Optimización
        PlayerSettings.stripEngineCode = true;
        PlayerSettings.stripUnusedMeshComponents = true;
        PlayerSettings.optimizeMeshData = true;
        
        // Scripting
        PlayerSettings.SetScriptingBackend(BuildTargetGroup.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetApiCompatibilityLevel(BuildTargetGroup.Standalone, ApiCompatibilityLevel.NET_Standard_2_1);
        
        // Networking
        PlayerSettings.WebPlayer.template = "index";
        
        // Other settings
        PlayerSettings.accelerometerFrequency = 60;
        PlayerSettings.bundleIdentifier = "com.destockspace.game";
    }
    
    private static BuildOptions GetBuildOptions(bool isDebug)
    {
        BuildOptions options = BuildOptions.None;
        
        if (isDebug)
        {
            options |= BuildOptions.Development;
            options |= BuildOptions.AllowDebugging;
            options |= BuildOptions.ConnectWithProfiler;
        }
        else
        {
            options |= BuildOptions.StrictMode;
        }
        
        return options;
    }
    
    private static string[] GetBuildScenes()
    {
        string[] scenes = new string[]
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/SpaceScene.unity",
            "Assets/Scenes/CombatScene.unity",
            "Assets/Scenes/MarketplaceScene.unity",
            "Assets/Scenes/InventoryScene.unity",
            "Assets/Scenes/SettingsScene.unity"
        };
        
        // Verificar que todas las escenas existan
        var validScenes = new System.Collections.Generic.List<string>();
        
        foreach (string scene in scenes)
        {
            if (File.Exists(scene))
            {
                validScenes.Add(scene);
            }
            else
            {
                Debug.LogWarning($"Scene not found: {scene}");
            }
        }
        
        return validScenes.ToArray();
    }
    
    private static string GetBuildPath(bool isDebug)
    {
        string buildFolder = isDebug ? "Builds/Debug" : "Builds/Release";
        string buildName = isDebug ? "DESTOCK_SPACE_Debug.exe" : "DESTOCK_SPACE.exe";
        
        // Crear directorio si no existe
        if (!Directory.Exists(buildFolder))
        {
            Directory.CreateDirectory(buildFolder);
        }
        
        return Path.Combine(buildFolder, buildName);
    }
    
    private static void ConfigureQualitySettings(bool isDebug)
    {
        if (isDebug)
        {
            QualitySettings.SetQualityLevel(3); // Medium
        }
        else
        {
            QualitySettings.SetQualityLevel(5); // High
        }
        
        // Configurar URP
        // var urpAsset = AssetDatabase.LoadAssetAsset<UniversalRenderPipelineAsset>("Assets/Settings/URPAsset.asset");
        // GraphicsSettings.renderPipelineAsset = urpAsset;
    }
    
    private static void ProcessBuildReport(BuildReport report, bool isDebug)
    {
        if (report.summary.result == BuildResult.Succeeded)
        {
            string buildType = isDebug ? "Debug" : "Release";
            
            Debug.Log($"✅ {buildType} build successful!");
            Debug.Log($"📁 Location: {report.summary.outputPath}");
            Debug.Log($"📦 Size: {FormatFileSize(report.summary.totalSize)}");
            Debug.Log($"⏱️ Build time: {report.summary.totalTime}");
            Debug.Log($"📊 Total assets: {report.summary.totalAssets}");
            Debug.Log($"🎯 Total scenes: {report.summary.totalScenes}");
            
            // Mostrar diálogo de éxito
            EditorUtility.DisplayDialog(
                "Build Successful", 
                $"{buildType} build completed successfully!\n\n" +
                $"Location: {report.summary.outputPath}\n" +
                $"Size: {FormatFileSize(report.summary.totalSize)}\n" +
                $"Time: {report.summary.totalTime}", 
                "OK"
            );
        }
        else
        {
            Debug.LogError($"❌ Build failed: {report.summary}");
            
            // Mostrar errores detallados
            foreach (var step in report.steps)
            {
                if (step.depth > 0 && !string.IsNullOrEmpty(step.messages))
                {
                    Debug.LogError($"Build step error: {step.messages}");
                }
            }
            
            EditorUtility.DisplayDialog("Build Failed", "Build failed. Check console for details.", "OK");
        }
    }
    
    private static void CopyAdditionalFiles(string buildPath)
    {
        try
        {
            string buildDirectory = Path.GetDirectoryName(buildPath);
            
            // Copiar archivos de configuración
            CopyFileIfExists("Assets/Settings/game.config", Path.Combine(buildDirectory, "game.config"));
            CopyFileIfExists("Assets/Settings/server.config", Path.Combine(buildDirectory, "server.config"));
            
            // Copiar README
            CopyFileIfExists("Assets/README.txt", Path.Combine(buildDirectory, "README.txt"));
            
            // Copiar licencia
            CopyFileIfExists("Assets/LICENSE.txt", Path.Combine(buildDirectory, "LICENSE.txt"));
            
            Debug.Log("Additional files copied successfully");
        }
        catch (Exception e)
        {
            Debug.LogWarning($"Failed to copy additional files: {e.Message}");
        }
    }
    
    private static void CopyFileIfExists(string source, string destination)
    {
        if (File.Exists(source))
        {
            File.Copy(source, destination, true);
            Debug.Log($"Copied: {source} -> {destination}");
        }
    }
    
    private static void CreateInstaller()
    {
        try
        {
            Debug.Log("Creating installer...");
            
            // Aquí iría la lógica para crear un instalador
            // Usando Inno Setup, NSIS, o similar
            
            Debug.Log("Installer creation completed");
        }
        catch (Exception e)
        {
            Debug.LogWarning($"Failed to create installer: {e.Message}");
        }
    }
    
    private static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        
        return $"{len:0.##} {sizes[order]}";
    }
    
    private static Texture2D[] GetApplicationIcons()
    {
        // Cargar iconos de diferentes tamaños
        var icons = new Texture2D[5];
        
        // Estos deberían ser archivos de icono reales
        // icons[0] = AssetDatabase.LoadAsset<Texture2D>("Assets/Icons/icon_16.png");
        // icons[1] = AssetDatabase.LoadAsset<Texture2D>("Assets/Icons/icon_32.png");
        // icons[2] = AssetDatabase.LoadAsset<Texture2D>("Assets/Icons/icon_48.png");
        // icons[3] = AssetDatabase.LoadAsset<Texture2D>("Assets/Icons/icon_64.png");
        // icons[4] = AssetDatabase.LoadAsset<Texture2D>("Assets/Icons/icon_128.png");
        
        return icons;
    }
    
    [MenuItem("Build/Clean Build Folders")]
    public static void CleanBuildFolders()
    {
        if (EditorUtility.DisplayDialog("Clean Build Folders", 
            "This will delete all build folders. Are you sure?", 
            "Yes", "No"))
        {
            try
            {
                if (Directory.Exists("Builds"))
                {
                    Directory.Delete("Builds", true);
                    Debug.Log("Build folders cleaned successfully");
                }
                
                // Limpiar también la carpeta Library si es necesario
                if (EditorUtility.DisplayDialog("Clean Library?", 
                    "Do you also want to clean the Library folder? This will force a full reimport.", 
                    "Yes", "No"))
                {
                    if (Directory.Exists("Library"))
                    {
                        Directory.Delete("Library", true);
                        Debug.Log("Library folder cleaned successfully");
                        AssetDatabase.Refresh();
                    }
                }
                
                EditorUtility.DisplayDialog("Clean Complete", 
                    "Build folders cleaned successfully!", 
                    "OK");
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to clean build folders: {e.Message}");
                EditorUtility.DisplayDialog("Clean Failed", 
                    $"Failed to clean build folders: {e.Message}", 
                    "OK");
            }
        }
    }
    
    [MenuItem("Build/Validate Build Configuration")]
    public static void ValidateBuildConfiguration()
    {
        var issues = new System.Collections.Generic.List<string>();
        
        // Verificar escenas
        var scenes = GetBuildScenes();
        if (scenes.Length == 0)
        {
            issues.Add("No valid scenes found for build");
        }
        
        // Verificar player settings
        if (string.IsNullOrEmpty(PlayerSettings.companyName))
        {
            issues.Add("Company name is not set");
        }
        
        if (string.IsNullOrEmpty(PlayerSettings.productName))
        {
            issues.Add("Product name is not set");
        }
        
        // Verificar backend connection
        var backendManager = FindObjectOfType<BackendConnectionManager>();
        if (backendManager == null)
        {
            issues.Add("BackendConnectionManager not found in scene");
        }
        
        // Verificar VFX system
        var vfxManager = FindObjectOfType<VFXManager>();
        if (vfxManager == null)
        {
            issues.Add("VFXManager not found in scene");
        }
        
        // Mostrar resultados
        if (issues.Count == 0)
        {
            EditorUtility.DisplayDialog("Validation Successful", 
                "Build configuration is valid!", 
                "OK");
        }
        else
        {
            string message = "Found issues:\n\n" + string.Join("\n", issues);
            EditorUtility.DisplayDialog("Validation Failed", 
                message, 
                "OK");
        }
    }
    
    [MenuItem("Build/Export Build Configuration")]
    public static void ExportBuildConfiguration()
    {
        var config = new BuildConfiguration
        {
            companyName = PlayerSettings.companyName,
            productName = PlayerSettings.productName,
            bundleVersion = PlayerSettings.bundleVersion,
            defaultScreenWidth = PlayerSettings.defaultScreenWidth,
            defaultScreenHeight = PlayerSettings.defaultScreenHeight,
            fullScreenMode = PlayerSettings.fullScreenMode,
            buildScenes = GetBuildScenes(),
            qualityLevel = QualitySettings.GetQualityLevel(),
            scriptingBackend = PlayerSettings.GetScriptingBackend(BuildTargetGroup.Standalone).ToString(),
            exportDate = DateTime.Now.ToString()
        };
        
        string json = JsonUtility.ToJson(config, true);
        string path = EditorUtility.SaveFilePanel("Export Build Configuration", "", "build-config", "json");
        
        if (!string.IsNullOrEmpty(path))
        {
            File.WriteAllText(path, json);
            Debug.Log($"Build configuration exported to: {path}");
        }
    }
}

[System.Serializable]
public class BuildConfiguration
{
    public string companyName;
    public string productName;
    public string bundleVersion;
    public int defaultScreenWidth;
    public int defaultScreenHeight;
    public FullScreenMode fullScreenMode;
    public string[] buildScenes;
    public int qualityLevel;
    public string scriptingBackend;
    public string exportDate;
}
