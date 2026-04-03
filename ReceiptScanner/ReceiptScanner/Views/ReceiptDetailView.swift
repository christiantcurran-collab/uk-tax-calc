import SwiftUI

struct ReceiptDetailView: View {
    let receipt: Receipt
    @EnvironmentObject var store: ReceiptStore
    @State private var showEditSheet = false
    @State private var showDeleteConfirmation = false
    @State private var showRawText = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                headerSection

                // Items
                if !receipt.items.isEmpty {
                    itemsSection
                }

                // Totals
                totalsSection

                // Raw OCR text
                if !receipt.rawOCRText.isEmpty {
                    rawTextSection
                }

                // Notes
                if !receipt.notes.isEmpty {
                    notesSection
                }
            }
            .padding()
        }
        .navigationTitle("Receipt")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button {
                        showEditSheet = true
                    } label: {
                        Label("Edit", systemImage: "pencil")
                    }

                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showEditSheet) {
            EditReceiptView(receipt: receipt)
        }
        .confirmationDialog("Delete Receipt?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                store.deleteReceipt(receipt)
                dismiss()
            }
        } message: {
            Text("This action cannot be undone.")
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: receipt.category.systemImage)
                    .font(.title2)
                    .foregroundStyle(.accent)
                    .frame(width: 44, height: 44)
                    .background(.accent.opacity(0.12))
                    .clipShape(Circle())

                VStack(alignment: .leading) {
                    Text(receipt.storeName)
                        .font(.title2.bold())
                    Text(receipt.date.formatted(as: .dayMonthYear))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            HStack {
                Label(receipt.category.rawValue, systemImage: receipt.category.systemImage)
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.accent.opacity(0.12))
                    .foregroundStyle(.accent)
                    .clipShape(Capsule())
            }
        }
    }

    private var itemsSection: some View {
        GroupBox {
            VStack(spacing: 0) {
                ForEach(Array(receipt.items.enumerated()), id: \.element.id) { index, item in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(item.name)
                                .font(.subheadline)
                            if item.quantity != 1 {
                                Text("\(Int(item.quantity)) x £\(String(format: "%.2f", item.unitPrice))")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                        Text(String(format: "£%.2f", item.totalPrice))
                            .font(.subheadline.weight(.medium))
                    }
                    .padding(.vertical, 6)

                    if index < receipt.items.count - 1 {
                        Divider()
                    }
                }
            }
        } label: {
            Label("Items (\(receipt.items.count))", systemImage: "list.bullet")
        }
    }

    private var totalsSection: some View {
        GroupBox {
            VStack(spacing: 8) {
                if let subtotal = receipt.subtotal {
                    totalRow("Subtotal", value: subtotal)
                }
                if let tax = receipt.tax {
                    totalRow("VAT", value: tax)
                }
                Divider()
                HStack {
                    Text("Total")
                        .font(.headline)
                    Spacer()
                    Text(String(format: "£%.2f", receipt.total))
                        .font(.title3.bold())
                        .foregroundStyle(.accent)
                }
            }
        } label: {
            Label("Totals", systemImage: "sterling.sign.circle")
        }
    }

    private var rawTextSection: some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 8) {
                Button {
                    showRawText.toggle()
                } label: {
                    HStack {
                        Text(showRawText ? "Hide OCR Text" : "Show OCR Text")
                            .font(.subheadline)
                        Spacer()
                        Image(systemName: showRawText ? "chevron.up" : "chevron.down")
                    }
                }

                if showRawText {
                    Text(receipt.rawOCRText)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                        .textSelection(.enabled)
                }
            }
        } label: {
            Label("OCR Data", systemImage: "text.viewfinder")
        }
    }

    private var notesSection: some View {
        GroupBox {
            Text(receipt.notes)
                .font(.subheadline)
        } label: {
            Label("Notes", systemImage: "note.text")
        }
    }

    private func totalRow(_ label: String, value: Double) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(String(format: "£%.2f", value))
        }
        .font(.subheadline)
    }
}
