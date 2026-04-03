import SwiftUI

struct ScannerView: View {
    @StateObject private var viewModel = ScannerViewModel()
    @EnvironmentObject var store: ReceiptStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if viewModel.isProcessing {
                    processingView
                } else if let receipt = viewModel.scannedReceipt {
                    receiptPreview(receipt)
                } else {
                    scanOptionsView
                }
            }
            .padding()
            .navigationTitle("Scan Receipt")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .sheet(isPresented: $viewModel.showCamera) {
                CameraView { images in
                    Task {
                        await viewModel.processImages(images)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                ImagePicker { image in
                    Task {
                        await viewModel.processImages([image])
                    }
                }
            }
            .alert("Scan Error", isPresented: $viewModel.showError) {
                Button("OK") {}
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }

    private var scanOptionsView: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "doc.text.viewfinder")
                .font(.system(size: 80))
                .foregroundStyle(.accent)

            Text("Scan a Receipt")
                .font(.title2.bold())

            Text("Use your camera to scan a receipt or choose an image from your photo library.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            Button {
                viewModel.showCamera = true
            } label: {
                Label("Scan with Camera", systemImage: "camera.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.accent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button {
                viewModel.showPhotoPicker = true
            } label: {
                Label("Choose from Photos", systemImage: "photo.on.rectangle")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.accent.opacity(0.15))
                    .foregroundStyle(.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private var processingView: some View {
        VStack(spacing: 16) {
            Spacer()
            ProgressView()
                .scaleEffect(1.5)
            Text("Processing receipt...")
                .font(.headline)
            Text("Extracting text with OCR")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
        }
    }

    private func receiptPreview(_ receipt: Receipt) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .font(.title2)
                    Text("Receipt Scanned")
                        .font(.title3.bold())
                }

                GroupBox("Details") {
                    VStack(alignment: .leading, spacing: 8) {
                        detailRow("Store", receipt.storeName)
                        detailRow("Date", receipt.date.formatted(as: .dayMonthYear))
                        detailRow("Category", receipt.category.rawValue)
                        detailRow("Items", "\(receipt.items.count)")
                        detailRow("Total", String(format: "£%.2f", receipt.total))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                if !receipt.items.isEmpty {
                    GroupBox("Items Found") {
                        VStack(alignment: .leading, spacing: 4) {
                            ForEach(receipt.items) { item in
                                HStack {
                                    Text(item.name)
                                        .lineLimit(1)
                                    Spacer()
                                    Text(String(format: "£%.2f", item.totalPrice))
                                        .foregroundStyle(.secondary)
                                }
                                .font(.subheadline)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }

                HStack(spacing: 12) {
                    Button {
                        store.addReceipt(receipt)
                        dismiss()
                    } label: {
                        Label("Save", systemImage: "checkmark")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.accent)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Button {
                        viewModel.reset()
                    } label: {
                        Label("Rescan", systemImage: "arrow.counterclockwise")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.secondary.opacity(0.15))
                            .foregroundStyle(.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
        }
    }

    private func detailRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
        .font(.subheadline)
    }
}
