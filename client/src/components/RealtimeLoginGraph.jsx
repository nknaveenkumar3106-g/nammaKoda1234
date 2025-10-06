import { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext.jsx';

export default function RealtimeLoginGraph() {
  const { loginActivity, isConnected } = useRealtime();
  const [loginData, setLoginData] = useState({
    labels: [],
    datasets: [{
      label: 'Logins per Hour',
      data: [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }]
  });

  useEffect(() => {
    // Process login activity data
    const now = new Date();
    const hours = [];
    const loginCounts = [];

    // Create data for last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      hours.push(hourStr);
      
      // Count logins in this hour
      const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const count = loginActivity.filter(login => {
        const loginTime = new Date(login.timestamp || login.createdAt);
        return loginTime >= hourStart && loginTime < hourEnd;
      }).length;
      
      loginCounts.push(count);
    }

    setLoginData({
      labels: hours,
      datasets: [{
        label: 'Logins per Hour',
        data: loginCounts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  }, [loginActivity]);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-lg">Login Activity</h3>
        </div>
        
        <div className="h-64">
          <canvas id="loginChart"></canvas>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Total Logins</div>
            <div className="stat-value text-sm text-primary">{loginActivity.length}</div>
          </div>
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Last Hour</div>
            <div className="stat-value text-sm text-success">
              {loginActivity.filter(login => {
                const loginTime = new Date(login.timestamp || login.createdAt);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return loginTime > oneHourAgo;
              }).length}
            </div>
          </div>
          <div className="stat bg-base-200 rounded p-2">
            <div className="stat-title text-xs">Peak Hour</div>
            <div className="stat-value text-sm text-warning">
              {Math.max(...loginData.datasets[0].data)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
