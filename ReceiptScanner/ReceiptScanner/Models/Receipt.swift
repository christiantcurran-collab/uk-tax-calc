import Foundation

struct Receipt: Identifiable, Codable, Hashable {
    let id: UUID
    var storeName: String
    var date: Date
    var items: [ReceiptItem]
    var subtotal: Double?
    var tax: Double?
    var total: Double
    var category: ReceiptCategory
    var notes: String
    var rawOCRText: String
    var imageData: Data?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        storeName: String = "Unknown Store",
        date: Date = Date(),
        items: [ReceiptItem] = [],
        subtotal: Double? = nil,
        tax: Double? = nil,
        total: Double = 0,
        category: ReceiptCategory = .other,
        notes: String = "",
        rawOCRText: String = "",
        imageData: Data? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.storeName = storeName
        self.date = date
        self.items = items
        self.subtotal = subtotal
        self.tax = tax
        self.total = total
        self.category = category
        self.notes = notes
        self.rawOCRText = rawOCRText
        self.imageData = imageData
        self.createdAt = createdAt
    }

    var computedSubtotal: Double {
        items.reduce(0) { $0 + $1.totalPrice }
    }
}

enum ReceiptCategory: String, Codable, CaseIterable, Identifiable {
    case groceries = "Groceries"
    case dining = "Dining"
    case transport = "Transport"
    case utilities = "Utilities"
    case entertainment = "Entertainment"
    case healthcare = "Healthcare"
    case shopping = "Shopping"
    case business = "Business"
    case other = "Other"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .groceries: return "cart.fill"
        case .dining: return "fork.knife"
        case .transport: return "car.fill"
        case .utilities: return "bolt.fill"
        case .entertainment: return "tv.fill"
        case .healthcare: return "heart.fill"
        case .shopping: return "bag.fill"
        case .business: return "briefcase.fill"
        case .other: return "doc.fill"
        }
    }
}
