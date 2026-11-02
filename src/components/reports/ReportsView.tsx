import React, { useState, useMemo } from 'react';
import { Download, Printer, FileText, CheckCircle, Clock, AlertTriangle, IndianRupee } from 'lucide-react';
import { useLibraryData } from '../../context/LibraryDataContext';
import { calculateOverdueAndFine } from '../../utils/libraryRules';

export const ReportsView: React.FC = () => {
  const { books, members, transactions, settings } = useLibraryData();
  const [activeReport, setActiveReport] = useState<'issued' | 'available' | 'overdue' | 'fines'>('issued');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute report datasets
  const issuedReportData = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'issued')
      .map((t) => {
        const book = books.find((b) => b.id === t.book_id);
        const member = members.find((m) => m.id === t.member_id);
        const { overdueDays } = calculateOverdueAndFine(t.due_date, todayStr, settings.fine_per_day);
        return {
          id: t.id,
          title: book?.title || 'Unknown',
          isbn: book?.isbn || '—',
          borrower: member?.name || 'Reader',
          memberCode: member?.member_code || '—',
          issueDate: t.issue_date,
          dueDate: t.due_date,
          status: overdueDays > 0 ? `${overdueDays}d Overdue` : 'Active',
        };
      });
  }, [transactions, books, members, settings, todayStr]);

  const availableReportData = useMemo(() => {
    return books
      .filter((b) => b.available_copies > 0)
      .map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        shelfLocation: b.shelf_location,
        available: b.available_copies,
        total: b.total_copies,
      }));
  }, [books]);

  const overdueReportData = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'issued')
      .map((t) => {
        const book = books.find((b) => b.id === t.book_id);
        const member = members.find((m) => m.id === t.member_id);
        const { overdueDays, fineAmount } = calculateOverdueAndFine(t.due_date, todayStr, settings.fine_per_day);
        return {
          id: t.id,
          title: book?.title || 'Unknown',
          borrower: member?.name || 'Reader',
          memberCode: member?.member_code || '—',
          phone: member?.phone || '—',
          dueDate: t.due_date,
          overdueDays,
          fineAmount: `₹${fineAmount}`,
        };
      })
      .filter((item) => item.overdueDays > 0);
  }, [transactions, books, members, settings, todayStr]);

  const finesReportData = useMemo(() => {
    return transactions
      .filter((t) => t.fine_amount > 0)
      .map((t) => {
        const book = books.find((b) => b.id === t.book_id);
        const member = members.find((m) => m.id === t.member_id);
        return {
          id: t.id,
          title: book?.title || 'Unknown',
          borrower: member?.name || 'Reader',
          memberCode: member?.member_code || '—',
          fineAmount: `₹${t.fine_amount}`,
          status: t.fine_paid ? 'Collected / Settled' : 'Pending Payment',
          date: t.return_date || t.due_date,
        };
      });
  }, [transactions, books, members]);

  // Export to CSV
  const handleExportCSV = () => {
    let rows: Record<string, any>[] = [];
    let filename = `library_report_${activeReport}_${todayStr}.csv`;

    if (activeReport === 'issued') rows = issuedReportData;
    else if (activeReport === 'available') rows = availableReportData;
    else if (activeReport === 'overdue') rows = overdueReportData;
    else if (activeReport === 'fines') rows = finesReportData;

    if (rows.length === 0) {
      alert('No data rows to export for this report.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print formatted report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-850">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 dark:text-stone-100">
            Statistical Audits &amp; Reports
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Export official records to CSV or generate clean printable archival formats
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#C8962E]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#12372A] hover:bg-[#1A4D3B] text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#C8962E]" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveReport('issued')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeReport === 'issued'
              ? 'bg-[#12372A] text-white border-[#12372A] shadow-sm'
              : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">Circulation</span>
            <Clock className="w-4 h-4 opacity-75" />
          </div>
          <div className="font-serif text-lg font-medium">{issuedReportData.length} Issued</div>
          <div className="text-[11px] opacity-75 mt-0.5 font-mono">Currently out on loan</div>
        </button>

        <button
          onClick={() => setActiveReport('available')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeReport === 'available'
              ? 'bg-[#12372A] text-white border-[#12372A] shadow-sm'
              : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">Inventory</span>
            <CheckCircle className="w-4 h-4 opacity-75" />
          </div>
          <div className="font-serif text-lg font-medium">{availableReportData.length} Titles</div>
          <div className="text-[11px] opacity-75 mt-0.5 font-mono">Available on shelf</div>
        </button>

        <button
          onClick={() => setActiveReport('overdue')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeReport === 'overdue'
              ? 'bg-[#B84034] text-white border-[#B84034] shadow-sm'
              : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">Delinquent</span>
            <AlertTriangle className="w-4 h-4 opacity-75" />
          </div>
          <div className="font-serif text-lg font-medium">{overdueReportData.length} Overdue</div>
          <div className="text-[11px] opacity-75 mt-0.5 font-mono">Action &amp; fines pending</div>
        </button>

        <button
          onClick={() => setActiveReport('fines')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeReport === 'fines'
              ? 'bg-[#C8962E] text-stone-950 border-[#C8962E] shadow-sm'
              : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">Revenue</span>
            <IndianRupee className="w-4 h-4 opacity-75" />
          </div>
          <div className="font-serif text-lg font-medium">{finesReportData.length} Records</div>
          <div className="text-[11px] opacity-75 mt-0.5 font-mono">Fines ledger</div>
        </button>
      </div>

      {/* Render Table for Selected Report */}
      <div className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-[#161C19]/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-stone-100/50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
            {activeReport.toUpperCase()} REPORT TABLE
          </span>
          <span className="text-stone-500">As of: {todayStr}</span>
        </div>

        <div className="overflow-x-auto">
          {activeReport === 'issued' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase text-stone-500">
                <tr>
                  <th className="py-2.5 px-4">TX ID</th>
                  <th className="py-2.5 px-4">Book Title</th>
                  <th className="py-2.5 px-4">ISBN</th>
                  <th className="py-2.5 px-4">Borrower</th>
                  <th className="py-2.5 px-4">Card ID</th>
                  <th className="py-2.5 px-4">Issue Date</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {issuedReportData.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-4 font-semibold">{row.id}</td>
                    <td className="py-2.5 px-4 font-serif text-sm font-medium">{row.title}</td>
                    <td className="py-2.5 px-4 text-stone-500">{row.isbn}</td>
                    <td className="py-2.5 px-4">{row.borrower}</td>
                    <td className="py-2.5 px-4 text-stone-500">{row.memberCode}</td>
                    <td className="py-2.5 px-4">{row.issueDate}</td>
                    <td className="py-2.5 px-4 font-semibold">{row.dueDate}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'available' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase text-stone-500">
                <tr>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Author</th>
                  <th className="py-2.5 px-4">ISBN</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Shelf Loc</th>
                  <th className="py-2.5 px-4 text-right">Available / Total Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {availableReportData.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-4 font-serif text-sm font-medium">{row.title}</td>
                    <td className="py-2.5 px-4 text-stone-700 dark:text-stone-300">{row.author}</td>
                    <td className="py-2.5 px-4 text-stone-500">{row.isbn}</td>
                    <td className="py-2.5 px-4">{row.category}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#12372A] dark:text-emerald-400">
                      {row.shelfLocation}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                      {row.available} of {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'overdue' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase text-stone-500">
                <tr>
                  <th className="py-2.5 px-4">TX ID</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Borrower</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Days Overdue</th>
                  <th className="py-2.5 px-4 text-right">Accrued Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {overdueReportData.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-4 font-semibold">{row.id}</td>
                    <td className="py-2.5 px-4 font-serif text-sm font-medium">{row.title}</td>
                    <td className="py-2.5 px-4">
                      {row.borrower} ({row.memberCode})
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">{row.phone}</td>
                    <td className="py-2.5 px-4 text-stone-500">{row.dueDate}</td>
                    <td className="py-2.5 px-4 text-rose-600 font-bold">{row.overdueDays} days</td>
                    <td className="py-2.5 px-4 text-right font-bold text-rose-600">{row.fineAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'fines' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase text-stone-500">
                <tr>
                  <th className="py-2.5 px-4">TX ID</th>
                  <th className="py-2.5 px-4">Book Title</th>
                  <th className="py-2.5 px-4">Borrower</th>
                  <th className="py-2.5 px-4">Fine Amount</th>
                  <th className="py-2.5 px-4">Settlement Status</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                {finesReportData.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-4 font-semibold">{row.id}</td>
                    <td className="py-2.5 px-4 font-serif text-sm font-medium">{row.title}</td>
                    <td className="py-2.5 px-4">
                      {row.borrower} ({row.memberCode})
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                      {row.fineAmount}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status.includes('Collected')
                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-stone-500">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
