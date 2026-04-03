import Foundation

@MainActor
final class ReportViewModel: ObservableObject {
    @Published var startDate: Date
    @Published var endDate: Date
    @Published var selectedRange: DateRange = .thisMonth

    enum DateRange: String, CaseIterable, Identifiable {
        case thisWeek = "This Week"
        case thisMonth = "This Month"
        case lastMonth = "Last Month"
        case last3Months = "3 Months"
        case thisYear = "This Year"
        case custom = "Custom"

        var id: String { rawValue }
    }

    init() {
        let now = Date()
        self.startDate = now.startOfMonth
        self.endDate = now
    }

    func selectRange(_ range: DateRange) {
        selectedRange = range
        let now = Date()
        let calendar = Calendar.current

        switch range {
        case .thisWeek:
            startDate = now.startOfWeek
            endDate = now
        case .thisMonth:
            startDate = now.startOfMonth
            endDate = now
        case .lastMonth:
            let lastMonth = calendar.date(byAdding: .month, value: -1, to: now)!
            startDate = lastMonth.startOfMonth
            endDate = lastMonth.endOfMonth
        case .last3Months:
            startDate = calendar.date(byAdding: .month, value: -3, to: now)!
            endDate = now
        case .thisYear:
            let components = calendar.dateComponents([.year], from: now)
            startDate = calendar.date(from: components)!
            endDate = now
        case .custom:
            break
        }
    }
}
