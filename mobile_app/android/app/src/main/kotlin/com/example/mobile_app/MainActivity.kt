package com.example.mobile_app

import android.content.pm.PackageManager
import android.content.pm.Signature
import android.content.pm.ApplicationInfo
import android.os.Build
import android.os.Bundle
import android.os.Debug
import android.provider.Settings
import com.scottyab.rootbeer.RootBeer
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.security.MessageDigest

class MainActivity : FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (isDebuggerThreat()) {
            SecurityBlockedActivity.start(
                this,
                listOf("Se ha detectado una sesion de depuracion externa."),
            )
            finish()
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "healthy_app/security",
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "isDeviceRooted" -> result.success(isDeviceRooted())
                "isAppTampered" -> result.success(isAppTampered())
                "getSecurityThreats" -> result.success(getSecurityThreats())
                "isInsecureEnvironment" -> result.success(isInsecureEnvironment())
                else -> result.notImplemented()
            }
        }
    }

    private fun isInsecureEnvironment(): Boolean {
        return getSecurityThreats().isNotEmpty()
    }

    private fun getSecurityThreats(): List<String> {
        val threats = mutableListOf<String>()

        if (isDeviceRooted()) {
            threats.add("Se han detectado privilegios de root o binarios de superusuario.")
        }
        if (isAppTampered()) {
            threats.add("La firma de la aplicacion no coincide con la esperada.")
        }
        if (isEmulatorThreat()) {
            threats.add("La aplicacion se esta ejecutando en un emulador o entorno virtualizado.")
        }
        if (isDebuggerThreat()) {
            threats.add("Se ha detectado una sesion de depuracion externa.")
        }
        if (isAppDebuggableThreat()) {
            threats.add("La aplicacion se esta ejecutando como debuggable fuera de desarrollo.")
        }
        if (isAdbEnabledThreat()) {
            threats.add("ADB esta habilitado en un entorno endurecido.")
        }

        return threats
    }

    private fun isAppTampered(): Boolean {
        val expectedHash = BuildConfig.EXPECTED_CERT_SHA256.uppercase()
        val currentHashes = getSigningCertificateHashes()

        if (currentHashes.isEmpty()) {
            return true
        }

        return currentHashes.none { it == expectedHash }
    }

    private fun isDeviceRooted(): Boolean {
        val rootBeer = RootBeer(this)
        val hasSuBinary =
            File("/system/xbin/su").exists() ||
                File("/system/bin/su").exists() ||
                File("/sbin/su").exists()

        return hasSuBinary ||
            rootBeer.detectRootManagementApps() ||
            rootBeer.detectPotentiallyDangerousApps() ||
            rootBeer.checkForBinary("su") ||
            rootBeer.checkForDangerousProps() ||
            rootBeer.checkForRWPaths() ||
            rootBeer.detectTestKeys() ||
            rootBeer.checkSuExists() ||
            rootBeer.checkForMagiskBinary() ||
            rootBeer.isRooted
    }

    private fun isEmulatorThreat(): Boolean {
        return Build.FINGERPRINT.startsWith("generic") ||
            Build.FINGERPRINT.startsWith("unknown") ||
            Build.MODEL.contains("google_sdk") ||
            Build.MODEL.contains("Emulator") ||
            Build.MODEL.contains("Android SDK built for x86") ||
            Build.MANUFACTURER.contains("Genymotion") ||
            (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
            Build.PRODUCT == "google_sdk" ||
            Build.HARDWARE.contains("goldfish") ||
            Build.HARDWARE.contains("ranchu")
    }

    private fun isAppDebuggableThreat(): Boolean {
        if (BuildConfig.DEBUG) {
            return false
        }
        return (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
    }

    private fun isAdbEnabledThreat(): Boolean {
        if (BuildConfig.DEBUG) {
            return false
        }
        return try {
            Settings.Global.getInt(contentResolver, Settings.Global.ADB_ENABLED, 0) == 1
        } catch (_: Exception) {
            false
        }
    }

    private fun isDebuggerThreat(): Boolean {
        return !BuildConfig.DEBUG && Debug.isDebuggerConnected()
    }

    private fun getSigningCertificateHashes(): List<String> {
        return try {
            val signatures =
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    val packageInfo =
                        packageManager.getPackageInfo(
                            packageName,
                            PackageManager.GET_SIGNING_CERTIFICATES,
                        )
                    val signingInfo = packageInfo.signingInfo ?: return emptyList()
                    if (signingInfo.hasMultipleSigners()) {
                        signingInfo.apkContentsSigners.toList()
                    } else {
                        signingInfo.signingCertificateHistory.toList()
                    }
                } else {
                    @Suppress("DEPRECATION")
                    val packageInfo =
                        packageManager.getPackageInfo(
                            packageName,
                            PackageManager.GET_SIGNATURES,
                        )
                    @Suppress("DEPRECATION")
                    packageInfo.signatures?.toList().orEmpty()
                }

            signatures.map { signature -> sha256(signature) }
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun sha256(signature: Signature): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val bytes = digest.digest(signature.toByteArray())
        return bytes.joinToString(":") { byte -> "%02X".format(byte) }
    }
}
