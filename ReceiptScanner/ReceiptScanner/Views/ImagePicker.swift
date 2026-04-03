import SwiftUI
import PhotosUI

struct ImagePicker: UIViewControllerRepresentable {
    let onImageSelected: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.selectionLimit = 1
        config.filter = .images
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onImageSelected: onImageSelected, dismiss: dismiss)
    }

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let onImageSelected: (UIImage) -> Void
        let dismiss: DismissAction

        init(onImageSelected: @escaping (UIImage) -> Void, dismiss: DismissAction) {
            self.onImageSelected = onImageSelected
            self.dismiss = dismiss
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            dismiss()

            guard let result = results.first else { return }

            result.itemProvider.loadObject(ofClass: UIImage.self) { [weak self] object, error in
                if let image = object as? UIImage {
                    DispatchQueue.main.async {
                        self?.onImageSelected(image)
                    }
                }
            }
        }
    }
}
