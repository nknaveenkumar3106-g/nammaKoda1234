import { createContext, useContext, useEffect, useState } from 'react';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newUsers: 0,
    existingUsers: 0,
    explorers: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [umbrellaHistory, setUmbrellaHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.log('No admin token found');
      return;
    }

    console.log('Admin token found, connecting to real-time stream...');
    
    // Test the admin authentication first
    fetch(`/api/admin/test?token=${encodeURIComponent(token)}`)
      .then(response => response.json())
      .then(data => {
        console.log('Admin auth test result:', data);
        if (data.success) {
          console.log('Admin authentication successful, starting real-time stream...');
        }
      })
      .catch(err => {
        console.error('Admin auth test failed:', err);
      });

    // EventSource doesn't support custom headers, so we'll pass the token as a query parameter
    const eventSource = new EventSource(`/api/stream/admin?token=${encodeURIComponent(token)}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Real-time connection established');
    };

    eventSource.onmessage = (event) => {
      console.log('Real-time message:', event);
    };

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      setIsConnected(false);
    };

    eventSource.addEventListener('initial', (event) => {
      console.log('Received initial data:', event.data);
      const data = JSON.parse(event.data);
      console.log('Parsed initial data:', data);
      setUsers(data.users || []);
      setUserStats(data.stats || {});
      setTransactions(data.transactions || []);
    });

    eventSource.addEventListener('users', (event) => {
      const data = JSON.parse(event.data);
      setUsers(data.users || []);
      setUserStats(data.stats || {});
    });

    eventSource.addEventListener('transactions', (event) => {
      const data = JSON.parse(event.data);
      setTransactions(data.transactions || []);
    });

    eventSource.addEventListener('login', (event) => {
      const data = JSON.parse(event.data);
      setLoginActivity(prev => [data, ...prev].slice(0, 100)); // Keep last 100 logins
    });

    eventSource.addEventListener('umbrella', (event) => {
      const data = JSON.parse(event.data);
      setUmbrellaHistory(prev => [data, ...prev].slice(0, 100)); // Keep last 100 umbrella activities
    });

    eventSource.addEventListener('ping', (event) => {
      // Heartbeat received
    });

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  const value = {
    isConnected,
    users,
    userStats,
    transactions,
    loginActivity,
    umbrellaHistory,
    setUsers,
    setUserStats,
    setTransactions,
    setLoginActivity,
    setUmbrellaHistory
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
