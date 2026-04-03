import SwiftUI

struct ReportView: View {
    @EnvironmentObject var store: ReceiptStore
    @StateObject private var viewModel = ReportViewModel()
    @State private var showShareSheet = false
    @State private var pdfURL: URL?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Date range picker
                    dateRangePicker

                    if filteredReceipts.isEmpty {
                        ContentUnavailableView(
                            "No Receipts",
                            systemImage: "doc.text",
                            description: Text("No receipts found for this period.")
                        )
                        .padding(.top, 40)
                    } else {
                        // Summary cards
                        summaryCards

                        // Category breakdown
                        categoryBreakdown

                        // Top spending
                        topStores
                    }
                }
                .padding()
            }
            .navigationTitle("Reports")
            .toolbar {
                if !filteredReceipts.isEmpty {
                    ToolbarItem(placement: .primaryAction) {
                        Button {
                            exportPDF()
                        } label: {
                            Image(systemName: "square.and.arrow.up")
                        }
                    }
                }
            }
            .sheet(isPresented: $showShareSheet) {
                if let url = pdfURL {
                    ShareSheet(items: [url])
                }
            }
        }
    }

    private var filteredReceipts: [Receipt] {
        store.receipts(in: viewModel.startDate...viewModel.endDate)
    }

    private var spendingByCategory: [ReceiptCategory: Double] {
        store.spendingByCategory(in: viewModel.startDate...viewModel.endDate)
    }

    private var totalSpending: Double {
        store.totalSpending(in: viewModel.startDate...viewModel.endDate)
    }

    private var dateRangePicker: some View {
        VStack(spacing: 12) {
            // Quick range buttons
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(ReportViewModel.DateRange.allCases) { range in
                        Button {
                            viewModel.selectRange(range)
                        } label: {
                            Text(range.rawValue)
                                .font(.subheadline)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(viewModel.selectedRange == range ? Color.accentColor : Color(.systemGray5))
                                .foregroundStyle(viewModel.selectedRange == range ? .white : .primary)
                                .clipShape(Capsule())
                        }
                    }
                }
            }

            // Custom date pickers
            if viewModel.selectedRange == .custom {
                HStack {
                    DatePicker("From", selection: $viewModel.startDate, displayedComponents: .date)
                        .labelsHidden()
                    Text("to")
                        .foregroundStyle(.secondary)
                    DatePicker("To", selection: $viewModel.endDate, displayedComponents: .date)
                        .labelsHidden()
                }
            }
        }
    }

    private var summaryCards: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            SummaryCard(
                title: "Total Spent",
                value: String(format: "£%.2f", totalSpending),
                icon: "sterling.sign.circle.fill",
                color: .blue
            )
            SummaryCard(
                title: "Receipts",
                value: "\(filteredReceipts.count)",
                icon: "doc.text.fill",
                color: .green
            )
            SummaryCard(
                title: "Average",
                value: String(format: "£%.2f", filteredReceipts.isEmpty ? 0 : totalSpending / Double(filteredReceipts.count)),
                icon: "chart.bar.fill",
                color: .orange
            )
            SummaryCard(
                title: "Categories",
                value: "\(spendingByCategory.count)",
                icon: "square.grid.2x2.fill",
                color: .purple
            )
        }
    }

    private var categoryBreakdown: some View {
        GroupBox {
            VStack(spacing: 12) {
                ForEach(spendingByCategory.sorted { $0.value > $1.value }, id: \.key) { category, amount in
                    HStack {
                        Image(systemName: category.systemImage)
                            .foregroundStyle(.accent)
                            .frame(width: 24)

                        Text(category.rawValue)
                            .font(.subheadline)

                        Spacer()

                        Text(String(format: "£%.2f", amount))
                            .font(.subheadline.weight(.medium))
                    }

                    if totalSpending > 0 {
                        GeometryReader { geometry in
                            RoundedRectangle(cornerRadius: 4)
                                .fill(.accent.opacity(0.2))
                                .frame(width: geometry.size.width)
                                .overlay(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(.accent)
                                        .frame(width: geometry.size.width * CGFloat(amount / totalSpending))
                                }
                        }
                        .frame(height: 6)
                    }
                }
            }
        } label: {
            Label("Spending by Category", systemImage: "chart.pie.fill")
        }
    }

    private var topStores: some View {
        let storeSpending = Dictionary(grouping: filteredReceipts) { $0.storeName }
            .mapValues { $0.reduce(0) { $0 + $1.total } }
            .sorted { $0.value > $1.value }
            .prefix(5)

        return GroupBox {
            VStack(spacing: 8) {
                ForEach(Array(storeSpending), id: \.key) { store, amount in
                    HStack {
                        Text(store)
                            .font(.subheadline)
                            .lineLimit(1)
                        Spacer()
                        Text(String(format: "£%.2f", amount))
                            .font(.subheadline.weight(.medium))
                    }
                }
            }
        } label: {
            Label("Top Stores", systemImage: "building.2.fill")
        }
    }

    private func exportPDF() {
        let generator = PDFReportGenerator()
        let data = generator.generateReport(
            title: "Expense Report",
            dateRange: viewModel.startDate...viewModel.endDate,
            receipts: filteredReceipts,
            spendingByCategory: spendingByCategory,
            totalSpending: totalSpending
        )

        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("ExpenseReport.pdf")
        try? data.write(to: tempURL)
        pdfURL = tempURL
        showShareSheet = true
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title2.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
