import { useState } from 'react';
import { 
  Receipt, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Calendar
} from 'lucide-react';
import './PaymentHistory.css';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
}

export default function PaymentHistory() {
  const [filter, setFilter] = useState<'all' | 'payment' | 'refund' | 'withdrawal' | 'deposit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions: Transaction[] = [
    { id: '1', type: 'payment', amount: -45.00, description: 'Order #ORD-001 - Organic Tomatoes', date: '2026-01-30', status: 'completed', orderId: 'ORD-001' },
    { id: '2', type: 'deposit', amount: 100.00, description: 'Wallet top-up via EcoCash', date: '2026-01-29', status: 'completed' },
    { id: '3', type: 'refund', amount: 25.00, description: 'Refund for Order #ORD-098', date: '2026-01-28', status: 'completed', orderId: 'ORD-098' },
    { id: '4', type: 'withdrawal', amount: -50.00, description: 'Withdrawal to bank account', date: '2026-01-27', status: 'pending' },
    { id: '5', type: 'payment', amount: -120.00, description: 'Order #ORD-002 - Broiler Chickens', date: '2026-01-26', status: 'completed', orderId: 'ORD-002' },
    { id: '6', type: 'payment', amount: -35.00, description: 'Order #ORD-003 - Fresh Eggs', date: '2026-01-25', status: 'failed', orderId: 'ORD-003' },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
      case 'withdrawal':
        return <ArrowUpRight size={16} className="icon-out" />;
      case 'refund':
      case 'deposit':
        return <ArrowDownLeft size={16} className="icon-in" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  const downloadStatement = () => {
    // Generate CSV
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type,
      t.description,
      t.amount.toFixed(2),
      t.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makefarmhub_statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payment-history">
      <div className="history-header">
        <h2><Receipt size={24} /> Payment History</h2>
        <button className="btn-download" onClick={downloadStatement}>
          <Download size={18} /> Download Statement
        </button>
      </div>

      <div className="history-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {(['all', 'payment', 'refund', 'deposit', 'withdrawal'] as const).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {getTypeIcon(transaction.type)}
              </div>
              <div className="transaction-info">
                <span className="transaction-desc">{transaction.description}</span>
                <span className="transaction-date">
                  <Calendar size={12} /> {transaction.date}
                </span>
              </div>
              <div className="transaction-amount">
                <span className={transaction.amount >= 0 ? 'positive' : 'negative'}>
                  {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </span>
                <span className={`transaction-status ${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">
            <Receipt size={48} />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
