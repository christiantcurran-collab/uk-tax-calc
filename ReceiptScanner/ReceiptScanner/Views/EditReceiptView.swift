import SwiftUI

struct EditReceiptView: View {
    @EnvironmentObject var store: ReceiptStore
    @Environment(\.dismiss) private var dismiss

    @State private var storeName: String
    @State private var date: Date
    @State private var total: String
    @State private var subtotal: String
    @State private var tax: String
    @State private var category: ReceiptCategory
    @State private var notes: String
    @State private var items: [ReceiptItem]

    private let receipt: Receipt

    init(receipt: Receipt) {
        self.receipt = receipt
        _storeName = State(initialValue: receipt.storeName)
        _date = State(initialValue: receipt.date)
        _total = State(initialValue: String(format: "%.2f", receipt.total))
        _subtotal = State(initialValue: receipt.subtotal.map { String(format: "%.2f", $0) } ?? "")
        _tax = State(initialValue: receipt.tax.map { String(format: "%.2f", $0) } ?? "")
        _category = State(initialValue: receipt.category)
        _notes = State(initialValue: receipt.notes)
        _items = State(initialValue: receipt.items)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Store Details") {
                    TextField("Store Name", text: $storeName)
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    Picker("Category", selection: $category) {
                        ForEach(ReceiptCategory.allCases) { cat in
                            Label(cat.rawValue, systemImage: cat.systemImage)
                                .tag(cat)
                        }
                    }
                }

                Section("Amounts") {
                    HStack {
                        Text("£")
                        TextField("Total", text: $total)
                            .keyboardType(.decimalPad)
                    }
                    HStack {
                        Text("£")
                        TextField("Subtotal (optional)", text: $subtotal)
                            .keyboardType(.decimalPad)
                    }
                    HStack {
                        Text("£")
                        TextField("VAT (optional)", text: $tax)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Items") {
                    ForEach($items) { $item in
                        HStack {
                            TextField("Item", text: $item.name)
                            Spacer()
                            TextField("Price", value: $item.unitPrice, format: .currency(code: "GBP"))
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                                .frame(width: 100)
                        }
                    }
                    .onDelete { offsets in
                        items.remove(atOffsets: offsets)
                    }

                    Button {
                        items.append(ReceiptItem(name: "", unitPrice: 0))
                    } label: {
                        Label("Add Item", systemImage: "plus")
                    }
                }

                Section("Notes") {
                    TextEditor(text: $notes)
                        .frame(minHeight: 60)
                }
            }
            .navigationTitle("Edit Receipt")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveReceipt()
                        dismiss()
                    }
                    .disabled(storeName.isEmpty || total.isEmpty)
                }
            }
        }
    }

    private func saveReceipt() {
        var updated = receipt
        updated.storeName = storeName
        updated.date = date
        updated.total = Double(total) ?? receipt.total
        updated.subtotal = Double(subtotal)
        updated.tax = Double(tax)
        updated.category = category
        updated.notes = notes
        updated.items = items.filter { !$0.name.isEmpty }
        store.updateReceipt(updated)
    }
}
