import { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext.jsx';

export default function RealtimeTransactionFeed({ maxItems = 10, showUserInfo = true }) {
  const { transactions, users, isConnected } = useRealtime();
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Get recent transactions and sort by date
      const recent = transactions
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, maxItems)
        .map(txn => ({
          ...txn,
          userName: txn.userName || 'Unknown User',
          userEmail: txn.userEmail || '',
          timeAgo: getTimeAgo(txn.createdAt),
          icon: getTransactionIcon(txn.type),
          color: getTransactionColor(txn.type)
        }));
      
      setRecentTransactions(recent);
    }
  }, [transactions, maxItems]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return '💰';
      case 'borrow': return '☂️';
      case 'penalty': return '⚠️';
      case 'refund': return '↩️';
      case 'return': return '✅';
      default: return '📝';
    }
  };

  const getTransactionColor = (type) => {
    switch(type) {
      case 'deposit': return 'text-success';
      case 'borrow': return 'text-info';
      case 'penalty': return 'text-error';
      case 'refund': return 'text-warning';
      case 'return': return 'text-success';
      default: return 'text-base-content';
    }
  };

  const formatAmount = (amount) => {
    return `${amount > 0 ? '+' : ''}₹${Math.abs(amount)}`;
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">Real-time Transactions</h3>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1 text-success text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                Live
              </div>
            )}
            <div className="badge badge-outline">
              {recentTransactions.length} recent
            </div>
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((txn, index) => (
              <div key={txn._id || index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                <div className="text-2xl">{txn.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {showUserInfo ? txn.userName : 'Transaction'}
                    </span>
                    <span className="text-xs text-base-content/50">{txn.timeAgo}</span>
                  </div>
                  <div className={`text-sm ${txn.color} font-medium`}>
                    {txn.type === 'borrow' ? 'Borrowed an umbrella' :
                     txn.type === 'deposit' ? 'Added wallet balance' :
                     txn.type === 'penalty' ? 'Penalty applied' :
                     txn.type === 'refund' ? 'Refund processed' :
                     txn.type === 'return' ? 'Umbrella returned' :
                     txn.type}
                  </div>
                  {showUserInfo && txn.userEmail && (
                    <div className="text-xs text-base-content/50 truncate">
                      {txn.userEmail}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${txn.amount > 0 ? 'text-success' : 'text-error'}`}>
                    {formatAmount(txn.amount)}
                  </div>
                  {txn.stationName && (
                    <div className="text-xs text-base-content/50">
                      {txn.stationName}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-base-content/50">
              <div className="text-4xl mb-2">📊</div>
              <div>No recent transactions</div>
              <div className="text-sm">Transactions will appear here in real-time</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-base-content/70">
            {isConnected ? 'Real-time updates active' : 'Connection offline - showing cached data'}
          </div>
        </div>
      </div>
    </div>
  );
}

