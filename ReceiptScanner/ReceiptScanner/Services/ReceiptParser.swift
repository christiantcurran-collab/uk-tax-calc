import Foundation

struct ReceiptParser {

    func parse(ocrText: String) -> Receipt {
        let lines = ocrText.components(separatedBy: "\n").map { $0.trimmingCharacters(in: .whitespaces) }

        let storeName = extractStoreName(from: lines)
        let date = extractDate(from: lines)
        let items = extractItems(from: lines)
        let total = extractTotal(from: lines)
        let subtotal = extractSubtotal(from: lines)
        let tax = extractTax(from: lines)
        let category = guessCategory(storeName: storeName, items: items)

        return Receipt(
            storeName: storeName,
            date: date,
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total ?? items.reduce(0) { $0 + $1.totalPrice },
            category: category,
            rawOCRText: ocrText
        )
    }

    private func extractStoreName(from lines: [String]) -> String {
        // The store name is typically in the first few non-empty lines
        for line in lines.prefix(5) {
            let cleaned = line.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !cleaned.isEmpty else { continue }
            // Skip lines that look like dates, addresses, or phone numbers
            if cleaned.range(of: #"^\d{2}[/\-]\d{2}[/\-]\d{2,4}"#, options: .regularExpression) != nil { continue }
            if cleaned.range(of: #"^\+?\d[\d\s\-]{8,}"#, options: .regularExpression) != nil { continue }
            if cleaned.count < 3 { continue }
            return cleaned
        }
        return "Unknown Store"
    }

    private func extractDate(from lines: [String]) -> Date {
        let datePatterns: [(pattern: String, format: String)] = [
            (#"\b(\d{2}/\d{2}/\d{4})\b"#, "dd/MM/yyyy"),
            (#"\b(\d{2}-\d{2}-\d{4})\b"#, "dd-MM-yyyy"),
            (#"\b(\d{2}/\d{2}/\d{2})\b"#, "dd/MM/yy"),
            (#"\b(\d{4}-\d{2}-\d{2})\b"#, "yyyy-MM-dd"),
            (#"\b(\d{1,2}\s+\w{3,9}\s+\d{4})\b"#, "d MMMM yyyy"),
            (#"\b(\d{1,2}\s+\w{3}\s+\d{4})\b"#, "d MMM yyyy"),
        ]

        let fullText = lines.joined(separator: " ")
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_GB")

        for (pattern, format) in datePatterns {
            if let range = fullText.range(of: pattern, options: .regularExpression) {
                let match = String(fullText[range])
                // Extract capture group if needed
                if let regex = try? NSRegularExpression(pattern: pattern),
                   let result = regex.firstMatch(in: fullText, range: NSRange(fullText.startIndex..., in: fullText)),
                   result.numberOfRanges > 1,
                   let captureRange = Range(result.range(at: 1), in: fullText) {
                    let dateString = String(fullText[captureRange])
                    formatter.dateFormat = format
                    if let date = formatter.date(from: dateString) {
                        return date
                    }
                } else {
                    formatter.dateFormat = format
                    if let date = formatter.date(from: match) {
                        return date
                    }
                }
            }
        }

        return Date()
    }

    private func extractItems(from lines: [String]) -> [ReceiptItem] {
        var items: [ReceiptItem] = []

        // Pattern: item name followed by a price (e.g., "Milk 2.49" or "Bread    £1.50")
        let pricePattern = #"^(.+?)\s+£?(\d+\.\d{2})\s*$"#

        for line in lines {
            let cleaned = line.trimmingCharacters(in: .whitespaces)
            guard !cleaned.isEmpty else { continue }

            // Skip total/subtotal/tax lines
            let lowerLine = cleaned.lowercased()
            if lowerLine.contains("total") || lowerLine.contains("subtotal") ||
               lowerLine.contains("sub total") || lowerLine.contains("vat") ||
               lowerLine.contains("tax") || lowerLine.contains("change") ||
               lowerLine.contains("cash") || lowerLine.contains("card") ||
               lowerLine.contains("payment") || lowerLine.contains("balance") ||
               lowerLine.contains("tendered") { continue }

            if let regex = try? NSRegularExpression(pattern: pricePattern),
               let match = regex.firstMatch(in: cleaned, range: NSRange(cleaned.startIndex..., in: cleaned)),
               match.numberOfRanges >= 3,
               let nameRange = Range(match.range(at: 1), in: cleaned),
               let priceRange = Range(match.range(at: 2), in: cleaned) {

                let name = String(cleaned[nameRange]).trimmingCharacters(in: .whitespaces)
                if let price = Double(String(cleaned[priceRange])), price > 0, price < 10000 {
                    // Check for quantity prefix like "2 x Milk" or "2x Milk"
                    let qtyPattern = #"^(\d+)\s*[xX]\s+(.+)$"#
                    if let qtyRegex = try? NSRegularExpression(pattern: qtyPattern),
                       let qtyMatch = qtyRegex.firstMatch(in: name, range: NSRange(name.startIndex..., in: name)),
                       qtyMatch.numberOfRanges >= 3,
                       let qtyRange = Range(qtyMatch.range(at: 1), in: name),
                       let itemNameRange = Range(qtyMatch.range(at: 2), in: name),
                       let qty = Double(String(name[qtyRange])) {
                        items.append(ReceiptItem(
                            name: String(name[itemNameRange]),
                            quantity: qty,
                            unitPrice: price / qty
                        ))
                    } else {
                        items.append(ReceiptItem(name: name, unitPrice: price))
                    }
                }
            }
        }

        return items
    }

    private func extractTotal(from lines: [String]) -> Double? {
        // Look for "TOTAL" line with a price
        let totalPattern = #"(?i)(?:grand\s+)?total\s*:?\s*£?(\d+\.\d{2})"#

        for line in lines.reversed() {
            if let regex = try? NSRegularExpression(pattern: totalPattern),
               let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
               match.numberOfRanges >= 2,
               let range = Range(match.range(at: 1), in: line) {
                return Double(String(line[range]))
            }
        }
        return nil
    }

    private func extractSubtotal(from lines: [String]) -> Double? {
        let pattern = #"(?i)sub\s*-?\s*total\s*:?\s*£?(\d+\.\d{2})"#
        for line in lines {
            if let regex = try? NSRegularExpression(pattern: pattern),
               let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
               match.numberOfRanges >= 2,
               let range = Range(match.range(at: 1), in: line) {
                return Double(String(line[range]))
            }
        }
        return nil
    }

    private func extractTax(from lines: [String]) -> Double? {
        let pattern = #"(?i)(?:vat|tax)\s*:?\s*£?(\d+\.\d{2})"#
        for line in lines {
            if let regex = try? NSRegularExpression(pattern: pattern),
               let match = regex.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)),
               match.numberOfRanges >= 2,
               let range = Range(match.range(at: 1), in: line) {
                return Double(String(line[range]))
            }
        }
        return nil
    }

    private func guessCategory(storeName: String, items: [ReceiptItem]) -> ReceiptCategory {
        let lower = storeName.lowercased()
        let groceryStores = ["tesco", "sainsbury", "asda", "aldi", "lidl", "morrisons", "waitrose", "co-op", "m&s food", "iceland"]
        let diningKeywords = ["restaurant", "cafe", "coffee", "pizza", "burger", "mcdonald", "nando", "greggs", "costa", "starbucks", "pret"]
        let transportKeywords = ["uber", "bolt", "taxi", "parking", "train", "bus", "fuel", "petrol", "bp", "shell", "esso"]
        let healthKeywords = ["pharmacy", "chemist", "boots", "superdrug", "hospital", "dental", "doctor"]

        if groceryStores.contains(where: { lower.contains($0) }) { return .groceries }
        if diningKeywords.contains(where: { lower.contains($0) }) { return .dining }
        if transportKeywords.contains(where: { lower.contains($0) }) { return .transport }
        if healthKeywords.contains(where: { lower.contains($0) }) { return .healthcare }

        return .other
    }
}
