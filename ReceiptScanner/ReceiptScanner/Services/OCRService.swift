import Vision
import UIKit

actor OCRService {

    enum OCRError: LocalizedError {
        case imageConversionFailed
        case recognitionFailed(String)

        var errorDescription: String? {
            switch self {
            case .imageConversionFailed:
                return "Failed to convert image for OCR processing."
            case .recognitionFailed(let message):
                return "Text recognition failed: \(message)"
            }
        }
    }

    func recognizeText(in image: UIImage) async throws -> String {
        guard let cgImage = image.cgImage else {
            throw OCRError.imageConversionFailed
        }

        return try await withCheckedThrowingContinuation { continuation in
            let request = VNRecognizeTextRequest { request, error in
                if let error = error {
                    continuation.resume(throwing: OCRError.recognitionFailed(error.localizedDescription))
                    return
                }

                guard let observations = request.results as? [VNRecognizedTextObservation] else {
                    continuation.resume(returning: "")
                    return
                }

                let recognizedStrings = observations.compactMap { observation in
                    observation.topCandidates(1).first?.string
                }

                let fullText = recognizedStrings.joined(separator: "\n")
                continuation.resume(returning: fullText)
            }

            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true
            request.recognitionLanguages = ["en-GB", "en-US"]

            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: OCRError.recognitionFailed(error.localizedDescription))
            }
        }
    }
}
