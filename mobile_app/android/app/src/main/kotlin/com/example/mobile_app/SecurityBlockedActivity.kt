package com.example.mobile_app

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.system.exitProcess

class SecurityBlockedActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val reasons =
            intent.getStringArrayListExtra(EXTRA_REASONS)
                ?.joinToString("\n\n")
                ?: "Se ha detectado un evento de seguridad."

        val root =
            LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                setPadding(48, 48, 48, 48)
            }

        val title =
            TextView(this).apply {
                text = "Entorno inseguro detectado"
                gravity = Gravity.CENTER
                textSize = 24f
                setTypeface(typeface, Typeface.BOLD)
            }

        val message =
            TextView(this).apply {
                text = "$reasons\n\nLa aplicacion se cerrara de forma segura."
                gravity = Gravity.CENTER
                textSize = 16f
            }

        val closeButton =
            Button(this).apply {
                text = "Cerrar aplicacion"
                setOnClickListener { closeApp() }
            }

        root.addView(title)
        root.addView(message)
        root.addView(closeButton)

        setContentView(root)

        Handler(Looper.getMainLooper()).postDelayed({ closeApp() }, 3000)
    }

    private fun closeApp() {
        finishAffinity()
        finishAndRemoveTask()
        exitProcess(0)
    }

    companion object {
        private const val EXTRA_REASONS = "security_reasons"

        fun start(context: Context, reasons: List<String>) {
            val intent =
                Intent(context, SecurityBlockedActivity::class.java).apply {
                    putStringArrayListExtra(EXTRA_REASONS, ArrayList(reasons))
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                }
            context.startActivity(intent)
        }
    }
}
