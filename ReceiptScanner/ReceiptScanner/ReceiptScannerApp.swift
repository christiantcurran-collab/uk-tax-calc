import SwiftUI

@main
struct ReceiptScannerApp: App {
    @StateObject private var store = ReceiptStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
