import UIKit
import PDFKit

struct PDFReportGenerator {

    func generateReport(
        title: String,
        dateRange: ClosedRange<Date>,
        receipts: [Receipt],
        spendingByCategory: [ReceiptCategory: Double],
        totalSpending: Double
    ) -> Data {
        let pageWidth: CGFloat = 595.2  // A4
        let pageHeight: CGFloat = 841.8
        let margin: CGFloat = 50
        let contentWidth = pageWidth - margin * 2

        let pdfRenderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight))

        let data = pdfRenderer.pdfData { context in
            context.beginPage()
            var yPosition: CGFloat = margin

            // Title
            let titleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 24),
                .foregroundColor: UIColor.label
            ]
            let titleString = NSAttributedString(string: title, attributes: titleAttrs)
            titleString.draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 40

            // Date range
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .medium
            let dateRangeText = "\(dateFormatter.string(from: dateRange.lowerBound)) - \(dateFormatter.string(from: dateRange.upperBound))"
            let dateAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 14),
                .foregroundColor: UIColor.secondaryLabel
            ]
            NSAttributedString(string: dateRangeText, attributes: dateAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 30

            // Separator
            yPosition = drawSeparator(context: context.cgContext, y: yPosition, margin: margin, width: contentWidth)

            // Summary section
            let sectionAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 18),
                .foregroundColor: UIColor.label
            ]
            NSAttributedString(string: "Summary", attributes: sectionAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 30

            let bodyAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 12),
                .foregroundColor: UIColor.label
            ]
            let boldBodyAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 12),
                .foregroundColor: UIColor.label
            ]

            NSAttributedString(string: "Total Receipts: \(receipts.count)", attributes: bodyAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 20

            let totalText = String(format: "Total Spending: £%.2f", totalSpending)
            NSAttributedString(string: totalText, attributes: boldBodyAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 30

            // Spending by category
            yPosition = drawSeparator(context: context.cgContext, y: yPosition, margin: margin, width: contentWidth)
            NSAttributedString(string: "Spending by Category", attributes: sectionAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 30

            let sortedCategories = spendingByCategory.sorted { $0.value > $1.value }
            for (category, amount) in sortedCategories {
                let text = String(format: "%@: £%.2f", category.rawValue, amount)
                NSAttributedString(string: text, attributes: bodyAttrs)
                    .draw(at: CGPoint(x: margin + 10, y: yPosition))
                yPosition += 20

                if yPosition > pageHeight - margin - 40 {
                    context.beginPage()
                    yPosition = margin
                }
            }
            yPosition += 10

            // Receipts list
            yPosition = drawSeparator(context: context.cgContext, y: yPosition, margin: margin, width: contentWidth)
            NSAttributedString(string: "Receipt Details", attributes: sectionAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
            yPosition += 30

            // Table header
            yPosition = drawTableHeader(y: yPosition, margin: margin, attrs: boldBodyAttrs)

            for receipt in receipts.sorted(by: { $0.date > $1.date }) {
                if yPosition > pageHeight - margin - 40 {
                    context.beginPage()
                    yPosition = margin
                    yPosition = drawTableHeader(y: yPosition, margin: margin, attrs: boldBodyAttrs)
                }

                let dateStr = receipt.date.formatted(as: .dayMonthYear)
                NSAttributedString(string: dateStr, attributes: bodyAttrs)
                    .draw(at: CGPoint(x: margin, y: yPosition))

                let storeName = receipt.storeName.prefix(25)
                NSAttributedString(string: String(storeName), attributes: bodyAttrs)
                    .draw(at: CGPoint(x: margin + 100, y: yPosition))

                NSAttributedString(string: receipt.category.rawValue, attributes: bodyAttrs)
                    .draw(at: CGPoint(x: margin + 280, y: yPosition))

                let amountStr = String(format: "£%.2f", receipt.total)
                NSAttributedString(string: amountStr, attributes: bodyAttrs)
                    .draw(at: CGPoint(x: margin + 410, y: yPosition))

                yPosition += 20
            }

            // Footer
            yPosition += 20
            if yPosition > pageHeight - margin - 40 {
                context.beginPage()
                yPosition = margin
            }
            let footerAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.italicSystemFont(ofSize: 10),
                .foregroundColor: UIColor.tertiaryLabel
            ]
            let footerText = "Generated by Receipt Scanner on \(Date().formatted(as: .dayMonthYear))"
            NSAttributedString(string: footerText, attributes: footerAttrs)
                .draw(at: CGPoint(x: margin, y: yPosition))
        }

        return data
    }

    private func drawSeparator(context: CGContext, y: CGFloat, margin: CGFloat, width: CGFloat) -> CGFloat {
        context.setStrokeColor(UIColor.separator.cgColor)
        context.setLineWidth(0.5)
        context.move(to: CGPoint(x: margin, y: y))
        context.addLine(to: CGPoint(x: margin + width, y: y))
        context.strokePath()
        return y + 15
    }

    private func drawTableHeader(y: CGFloat, margin: CGFloat, attrs: [NSAttributedString.Key: Any]) -> CGFloat {
        NSAttributedString(string: "Date", attributes: attrs)
            .draw(at: CGPoint(x: margin, y: y))
        NSAttributedString(string: "Store", attributes: attrs)
            .draw(at: CGPoint(x: margin + 100, y: y))
        NSAttributedString(string: "Category", attributes: attrs)
            .draw(at: CGPoint(x: margin + 280, y: y))
        NSAttributedString(string: "Amount", attributes: attrs)
            .draw(at: CGPoint(x: margin + 410, y: y))
        return y + 25
    }
}
