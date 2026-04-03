import Foundation

struct ReceiptItem: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var quantity: Double
    var unitPrice: Double

    init(
        id: UUID = UUID(),
        name: String,
        quantity: Double = 1,
        unitPrice: Double
    ) {
        self.id = id
        self.name = name
        self.quantity = quantity
        self.unitPrice = unitPrice
    }

    var totalPrice: Double {
        quantity * unitPrice
    }
}
