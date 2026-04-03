import SwiftUI

struct ReceiptListView: View {
    @EnvironmentObject var store: ReceiptStore
    @State private var showScanner = false
    @State private var searchText = ""
    @State private var selectedCategory: ReceiptCategory?

    var filteredReceipts: [Receipt] {
        var result = store.receipts

        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }

        if !searchText.isEmpty {
            result = result.filter {
                $0.storeName.localizedCaseInsensitiveContains(searchText) ||
                $0.items.contains { $0.name.localizedCaseInsensitiveContains(searchText) }
            }
        }

        return result
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.receipts.isEmpty {
                    emptyStateView
                } else {
                    receiptsList
                }
            }
            .navigationTitle("Receipts")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showScanner = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search receipts")
            .fullScreenCover(isPresented: $showScanner) {
                ScannerView()
            }
        }
    }

    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("No Receipts", systemImage: "doc.text.viewfinder")
        } description: {
            Text("Scan your first receipt to start tracking expenses.")
        } actions: {
            Button("Scan Receipt") {
                showScanner = true
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private var receiptsList: some View {
        List {
            // Category filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    FilterChip(title: "All", isSelected: selectedCategory == nil) {
                        selectedCategory = nil
                    }
                    ForEach(ReceiptCategory.allCases) { category in
                        FilterChip(
                            title: category.rawValue,
                            isSelected: selectedCategory == category
                        ) {
                            selectedCategory = category
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .listRowInsets(EdgeInsets())
            .listRowSeparator(.hidden)

            // Receipts grouped by month
            ForEach(groupedByMonth, id: \.key) { month, receipts in
                Section(month) {
                    ForEach(receipts) { receipt in
                        NavigationLink(value: receipt) {
                            ReceiptRow(receipt: receipt)
                        }
                    }
                    .onDelete { offsets in
                        let receiptsToDelete = offsets.map { receipts[$0] }
                        for receipt in receiptsToDelete {
                            store.deleteReceipt(receipt)
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationDestination(for: Receipt.self) { receipt in
            ReceiptDetailView(receipt: receipt)
        }
    }

    private var groupedByMonth: [(key: String, value: [Receipt])] {
        let grouped = Dictionary(grouping: filteredReceipts) { receipt in
            receipt.date.formatted(as: .monthYear)
        }
        return grouped.sorted { $0.value.first?.date ?? Date() > $1.value.first?.date ?? Date() }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }
}

struct ReceiptRow: View {
    let receipt: Receipt

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: receipt.category.systemImage)
                .font(.title3)
                .foregroundStyle(.accent)
                .frame(width: 36, height: 36)
                .background(.accent.opacity(0.12))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(receipt.storeName)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)
                Text(receipt.date.formatted(as: .dayMonthYear))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(String(format: "£%.2f", receipt.total))
                .font(.subheadline.weight(.semibold))
        }
        .padding(.vertical, 2)
    }
}
