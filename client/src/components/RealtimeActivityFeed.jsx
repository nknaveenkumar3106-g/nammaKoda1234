import { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext.jsx';

export default function RealtimeActivityFeed() {
  const { transactions, users, isConnected } = useRealtime();
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    // Combine recent transactions and user activities
    const activities = [];
    
    // Add recent transactions
    transactions.slice(0, 10).forEach(txn => {
      activities.push({
        id: `txn-${txn._id || Date.now()}`,
        type: 'transaction',
        user: txn.userName || 'Unknown User',
        action: txn.type,
        amount: txn.amount,
        timestamp: txn.createdAt,
        icon: txn.type === 'borrow' ? '☂️' : txn.type === 'deposit' ? '💰' : '⚠️',
        color: txn.type === 'borrow' ? 'text-info' : txn.type === 'deposit' ? 'text-success' : 'text-error'
      });
    });

    // Add recent user registrations
    users.slice(0, 5).forEach(user => {
      if (user.createdAt) {
        activities.push({
          id: `user-${user._id}`,
          type: 'user',
          user: user.name,
          action: 'registered',
          timestamp: user.createdAt,
          icon: '👤',
          color: 'text-primary'
        });
      }
    });

    // Sort by timestamp and take most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    setActivityFeed(sortedActivities);
  }, [transactions, users]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">Activity Feed</h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activityFeed.length > 0 ? (
            activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
                <div className="text-xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{activity.user}</span>
                    <span className="text-xs text-base-content/50">{getTimeAgo(activity.timestamp)}</span>
                  </div>
                  <div className={`text-sm ${activity.color}`}>
                    {activity.action === 'borrow' ? 'Borrowed an umbrella' :
                     activity.action === 'deposit' ? 'Added wallet balance' :
                     activity.action === 'penalty' ? 'Penalty applied' :
                     activity.action === 'registered' ? 'New user registered' :
                     activity.action}
                    {activity.amount && (
                      <span className="ml-1 font-bold">
                        ({activity.amount > 0 ? '+' : ''}₹{Math.abs(activity.amount)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-base-content/50">
              <div className="text-4xl mb-2">📊</div>
              <div>No recent activity</div>
              <div className="text-sm">Activity will appear here in real-time</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-base-content/70">
            Showing last {activityFeed.length} activities
          </div>
        </div>
      </div>
    </div>
  );
}
