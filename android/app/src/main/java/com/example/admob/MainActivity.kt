package com.example.admob

import android.os.Bundle
import android.view.Gravity
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds

class MainActivity : AppCompatActivity() {
    private lateinit var adView: AdView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = FrameLayout(this)
        setContentView(layout)

        // Initialize Mobile Ads SDK
        MobileAds.initialize(this)

        adView = AdView(this).apply {
            adUnitId = "CookifyAIca-app-pub-4657770701639357/5885517308"
            setAdSize(AdSize.BANNER)
        }

        val params = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
        )
        layout.addView(adView, params)

        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)
    }
}
