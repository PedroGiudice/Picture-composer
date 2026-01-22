package com.hotcocoa.desktop

import android.os.Bundle
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge display for CSS env(safe-area-inset-*) to work
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }
}
