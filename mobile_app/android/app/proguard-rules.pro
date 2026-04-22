# Keep core annotation metadata used by Android and plugins.
-keepattributes RuntimeVisibleAnnotations,RuntimeInvisibleAnnotations,AnnotationDefault,InnerClasses,EnclosingMethod,Signature

# Keep Flutter bootstrap/plugin registration intact.
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugins.GeneratedPluginRegistrant { *; }

# Keep Android entry points and classes referenced from the manifest.
-keep class com.example.mobile_app.MainActivity { *; }
-keep class * extends io.flutter.embedding.android.FlutterActivity

# Keep Kotlin metadata to avoid issues in reflection-based libraries.
-keep class kotlin.Metadata { *; }

# RootBeer and Android framework checks are used directly, but keep package names stable.
-keep class com.scottyab.rootbeer.** { *; }

# Avoid noisy warnings from Flutter/plugin transitive dependencies during shrinking.
-dontwarn io.flutter.embedding.**
-dontwarn io.flutter.plugin.**
