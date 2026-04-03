import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            ReceiptListView()
                .tabItem {
                    Label("Receipts", systemImage: "doc.text")
                }
                .tag(0)

            ReportView()
                .tabItem {
                    Label("Reports", systemImage: "chart.pie")
                }
                .tag(1)
        }
        .tint(.accent)
    }
}
