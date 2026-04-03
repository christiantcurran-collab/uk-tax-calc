import SwiftUI
import UIKit

@MainActor
final class ScannerViewModel: ObservableObject {
    @Published var showCamera = false
    @Published var showPhotoPicker = false
    @Published var isProcessing = false
    @Published var scannedReceipt: Receipt?
    @Published var showError = false
    @Published var errorMessage = ""

    private let ocrService = OCRService()
    private let parser = ReceiptParser()

    func processImages(_ images: [UIImage]) async {
        guard !images.isEmpty else { return }

        isProcessing = true

        do {
            // Combine OCR text from all pages
            var allText = ""
            for image in images {
                let text = try await ocrService.recognizeText(in: image)
                allText += text + "\n"
            }

            // Parse the OCR text into a receipt
            var receipt = parser.parse(ocrText: allText)

            // Store the first image as thumbnail
            if let firstImage = images.first,
               let compressed = firstImage.jpegData(compressionQuality: 0.5) {
                receipt.imageData = compressed
            }

            scannedReceipt = receipt
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }

        isProcessing = false
    }

    func reset() {
        scannedReceipt = nil
        showCamera = false
        showPhotoPicker = false
        isProcessing = false
    }
}
