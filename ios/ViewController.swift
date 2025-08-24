import UIKit
import GoogleMobileAds

class ViewController: UIViewController {
    private var bannerView: GADBannerView!

    override func viewDidLoad() {
        super.viewDidLoad()

        bannerView = GADBannerView(adSize: kGADAdSizeBanner)
        bannerView.adUnitID = "CookifyAIca-app-pub-4657770701639357/6400506715"
        bannerView.rootViewController = self
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bannerView)

        NSLayoutConstraint.activate([
            bannerView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            bannerView.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])

        bannerView.load(GADRequest())
    }
}
