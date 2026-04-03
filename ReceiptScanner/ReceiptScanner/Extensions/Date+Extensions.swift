import Foundation

extension Date {
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var startOfMonth: Date {
        let components = Calendar.current.dateComponents([.year, .month], from: self)
        return Calendar.current.date(from: components) ?? self
    }

    var endOfMonth: Date {
        guard let nextMonth = Calendar.current.date(byAdding: .month, value: 1, to: startOfMonth) else {
            return self
        }
        return Calendar.current.date(byAdding: .day, value: -1, to: nextMonth) ?? self
    }

    var startOfWeek: Date {
        let components = Calendar.current.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self)
        return Calendar.current.date(from: components) ?? self
    }

    func formatted(as style: DateFormatStyle) -> String {
        let formatter = DateFormatter()
        switch style {
        case .short:
            formatter.dateStyle = .short
        case .medium:
            formatter.dateStyle = .medium
        case .monthYear:
            formatter.dateFormat = "MMMM yyyy"
        case .dayMonthYear:
            formatter.dateFormat = "dd MMM yyyy"
        case .iso:
            formatter.dateFormat = "yyyy-MM-dd"
        }
        return formatter.string(from: self)
    }

    enum DateFormatStyle {
        case short, medium, monthYear, dayMonthYear, iso
    }
}
