import Foundation

@MainActor
final class ReceiptStore: ObservableObject {
    @Published var receipts: [Receipt] = []

    private let saveKey = "saved_receipts"
    private let fileManager = FileManager.default

    private var documentsDirectory: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private var receiptsFileURL: URL {
        documentsDirectory.appendingPathComponent("receipts.json")
    }

    init() {
        loadReceipts()
    }

    func addReceipt(_ receipt: Receipt) {
        receipts.insert(receipt, at: 0)
        saveReceipts()
    }

    func updateReceipt(_ receipt: Receipt) {
        if let index = receipts.firstIndex(where: { $0.id == receipt.id }) {
            receipts[index] = receipt
            saveReceipts()
        }
    }

    func deleteReceipt(_ receipt: Receipt) {
        receipts.removeAll { $0.id == receipt.id }
        saveReceipts()
    }

    func deleteReceipts(at offsets: IndexSet) {
        receipts.remove(atOffsets: offsets)
        saveReceipts()
    }

    func receipts(in dateRange: ClosedRange<Date>) -> [Receipt] {
        receipts.filter { dateRange.contains($0.date) }
    }

    func receipts(for category: ReceiptCategory) -> [Receipt] {
        receipts.filter { $0.category == category }
    }

    func totalSpending(in dateRange: ClosedRange<Date>) -> Double {
        receipts(in: dateRange).reduce(0) { $0 + $1.total }
    }

    func spendingByCategory(in dateRange: ClosedRange<Date>) -> [ReceiptCategory: Double] {
        var result: [ReceiptCategory: Double] = [:]
        for receipt in receipts(in: dateRange) {
            result[receipt.category, default: 0] += receipt.total
        }
        return result
    }

    private func saveReceipts() {
        do {
            let data = try JSONEncoder().encode(receipts)
            try data.write(to: receiptsFileURL, options: .atomic)
        } catch {
            print("Failed to save receipts: \(error.localizedDescription)")
        }
    }

    private func loadReceipts() {
        guard fileManager.fileExists(atPath: receiptsFileURL.path) else { return }
        do {
            let data = try Data(contentsOf: receiptsFileURL)
            receipts = try JSONDecoder().decode([Receipt].self, from: data)
        } catch {
            print("Failed to load receipts: \(error.localizedDescription)")
        }
    }
}
