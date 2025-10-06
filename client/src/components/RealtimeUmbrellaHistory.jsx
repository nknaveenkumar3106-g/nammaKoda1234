import { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext.jsx';

export default function RealtimeUmbrellaHistory() {
  const { umbrellaHistory, transactions, isConnected } = useRealtime();
  const [umbrellaData, setUmbrellaData] = useState([]);

  useEffect(() => {
    // Process umbrella-related transactions
    const umbrellaTransactions = transactions.filter(txn => 
      txn.type === 'borrow' || txn.type === 'penalty'
    ).slice(0, 20); // Show last 20 umbrella activities

    setUmbrellaData(umbrellaTransactions);
  }, [transactions, umbrellaHistory]);

  const getActivityIcon = (type) => {
    switch(type) {
      case 'borrow': return '☂️';
      case 'penalty': return '⚠️';
      case 'return': return '✅';
      default: return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'borrow': return 'text-info';
      case 'penalty': return 'text-error';
      case 'return': return 'text-success';
      default: return 'text-base-content';
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">Umbrella Activity</h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {umbrellaData.length > 0 ? (
            umbrellaData.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.userName || 'Unknown User'}</span>
                    <span className={`text-sm ${getActivityColor(activity.type)}`}>
                      {activity.type === 'borrow' ? 'Borrowed' : 
                       activity.type === 'penalty' ? 'Penalty Applied' : 
                       activity.type}
                    </span>
                  </div>
                  <div className="text-sm text-base-content/70">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                  {activity.amount && (
                    <div className={`text-sm font-bold ${activity.amount > 0 ? 'text-success' : 'text-error'}`}>
                      {activity.amount > 0 ? '+' : ''}₹{Math.abs(activity.amount)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-base-content/50">
              <div className="text-4xl mb-2">☂️</div>
              <div>No umbrella activity yet</div>
              <div className="text-sm">Activity will appear here in real-time</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Total Borrows</div>
            <div className="stat-value text-sm text-info">
              {transactions.filter(t => t.type === 'borrow').length}
            </div>
          </div>
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Active Borrows</div>
            <div className="stat-value text-sm text-warning">
              {transactions.filter(t => t.type === 'borrow').length - 
               transactions.filter(t => t.type === 'penalty').length}
            </div>
          </div>
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Penalties</div>
            <div className="stat-value text-sm text-error">
              {transactions.filter(t => t.type === 'penalty').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
