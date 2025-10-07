import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard.jsx'
import DoughnutChart from '../components/DoughnutChart.jsx'
import LineChart from '../components/LineChart.jsx'
import BarChart from '../components/BarChart.jsx'
import StationsPage from '../components/StationsPage.jsx'
import RealtimeLoginGraph from '../components/RealtimeLoginGraph.jsx'
import RealtimeUmbrellaHistory from '../components/RealtimeUmbrellaHistory.jsx'
import RealtimeActivityFeed from '../components/RealtimeActivityFeed.jsx'
import RealtimeTransactionFeed from '../components/RealtimeTransactionFeed.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import { adminAPI } from '../lib/api.js'

export function Dashboard(){
  const { isConnected, userStats, transactions } = useRealtime()
  const [stats, setStats] = useState({})
  
  // Debug logging
  useEffect(() => {
    console.log('Dashboard - isConnected:', isConnected);
    console.log('Dashboard - userStats:', userStats);
    console.log('Dashboard - transactions:', transactions);
  }, [isConnected, userStats, transactions])

  // Fallback: Fetch stats directly if real-time fails
  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected && Object.keys(stats).length === 0) {
        try {
          console.log('🔄 Fetching stats via API fallback...');
          const response = await adminAPI.getStats();
          setStats(response.stats);
          console.log('✅ Stats fetched via API:', response.stats);
        } catch (error) {
          console.error('❌ Failed to fetch stats:', error);
        }
      }
    };

    fetchStats();
  }, [isConnected, stats])
  
  const [realTimeData, setRealTimeData] = useState({
    totalUmbrellas: 250,
    availableUmbrellas: 180,
    borrowedUmbrellas: 45,
    maintenanceUmbrellas: 15,
    dryingUmbrellas: 10,
    activeUsers: 0,
    totalTransactions: 0,
    monthlyRevenue: 45678,
    adRevenue: 12340,
    onlineStations: 28,
    offlineStations: 2
  })

  // Update real-time data from context
  useEffect(() => {
    const currentStats = userStats.active ? userStats : stats;
    setRealTimeData(prev => ({
      ...prev,
      activeUsers: currentStats.active || 0,
      totalTransactions: transactions.length || 0
    }))
  }, [userStats, stats, transactions])

  // Simulate umbrella status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        borrowedUmbrellas: prev.borrowedUmbrellas + Math.floor(Math.random() * 3) - 1,
        availableUmbrellas: prev.availableUmbrellas + Math.floor(Math.random() * 3) - 1
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Chart data
  const umbrellaStatusData = {
    labels: ['Available', 'Borrowed', 'Maintenance', 'Drying'],
    datasets: [{
      data: [realTimeData.availableUmbrellas, realTimeData.borrowedUmbrellas, realTimeData.maintenanceUmbrellas, realTimeData.dryingUmbrellas],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
      borderWidth: 0
    }]
  }

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Rental Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ad Revenue',
        data: [5000, 8000, 7000, 12000, 10000, 15000, 13000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Daily Active Users',
      data: [120, 190, 150, 220, 180, 280, 250],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: '#8b5cf6',
      borderWidth: 2
    }]
  }

  const stationStatusData = {
    labels: ['Online', 'Offline', 'Maintenance'],
    datasets: [{
      data: [realTimeData.onlineStations, realTimeData.offlineStations, 3],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0
    }]
  }

  const topStationsData = {
    labels: ['Main Gate', 'Library', 'Cafeteria', 'Sports Ground', 'Admin Block'],
    datasets: [{
      label: 'Usage Count',
      data: [450, 380, 320, 280, 240],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10b981',
      borderWidth: 2
    }]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Dashboard</h1>
          <p className="text-base-content/70 mt-1">Real-time insights and analytics</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <span className="text-sm text-base-content/50">
              Real-time data {isConnected ? 'active' : 'offline'}
            </span>
          </div>
        </div>
        <div className="text-sm text-base-content/70">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Umbrellas"
          value={realTimeData.totalUmbrellas}
          change="+5.2%"
          changeType="positive"
          icon="☂️"
          color="primary"
          trend={[20, 25, 22, 28, 30, 25, 32]}
        />
        <StatCard
          title="Active Users"
          value={realTimeData.activeUsers}
          change="+12.3%"
          changeType="positive"
          icon="👥"
          color="success"
          trend={[100, 120, 110, 140, 135, 150, 147]}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${realTimeData.monthlyRevenue.toLocaleString()}`}
          change="+8.7%"
          changeType="positive"
          icon="💰"
          color="warning"
          trend={[30, 35, 32, 40, 38, 45, 46]}
        />
        <StatCard
          title="Online Stations"
          value={`${realTimeData.onlineStations}/${realTimeData.onlineStations + realTimeData.offlineStations}`}
          change="99.3%"
          changeType="positive"
          icon="📍"
          color="info"
          trend={[28, 30, 29, 30, 28, 30, 28]}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DoughnutChart
          data={umbrellaStatusData}
          title="Umbrella Status Distribution"
          centerText={{
            value: realTimeData.totalUmbrellas,
            label: "Total"
          }}
        />
        <div className="lg:col-span-2">
          <LineChart
            data={revenueData}
            title="Revenue Trends (Last 7 Months)"
            height={300}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={userActivityData}
          title="Weekly User Activity"
          height={300}
        />
        <BarChart
          data={topStationsData}
          title="Top Performing Stations"
          height={300}
          horizontal={true}
        />
      </div>

      {/* Real-time Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RealtimeLoginGraph />
        <RealtimeUmbrellaHistory />
        <RealtimeActivityFeed />
      </div>

      {/* Live Status and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DoughnutChart
          data={stationStatusData}
          title="Station Status"
          centerText={{
            value: `${Math.round((realTimeData.onlineStations / (realTimeData.onlineStations + realTimeData.offlineStations)) * 100)}%`,
            label: "Uptime"
          }}
        />
        
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">🔍 Smart Insights</h3>
              <div className="space-y-4">
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <div className="font-bold">Peak Usage Alert</div>
                    <div className="text-sm">Main Gate station experiencing 85% capacity. Consider adding more umbrellas.</div>
                  </div>
                </div>
                
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <div className="font-bold">Revenue Growth</div>
                    <div className="text-sm">Monthly revenue up 8.7% compared to last month. Great performance!</div>
                  </div>
                </div>
                
                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <div>
                    <div className="font-bold">Maintenance Required</div>
                    <div className="text-sm">15 umbrellas need maintenance. Schedule service to maintain availability.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">⚡ Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Station
            </button>
            <button className="btn btn-secondary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Generate Report
            </button>
            <button className="btn btn-accent btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <button className="btn btn-info btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Users(){
  const { users: realtimeUsers, userStats, isConnected, transactions } = useRealtime()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [exportFormat, setExportFormat] = useState('csv')
  const [isExporting, setIsExporting] = useState(false)
  
  // Debug logging
  useEffect(() => {
    console.log('Users - isConnected:', isConnected);
    console.log('Users - userStats:', userStats);
    console.log('Users - realtimeUsers:', realtimeUsers);
  }, [isConnected, userStats, realtimeUsers])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  // Update users from real-time data
  useEffect(() => {
    console.log('🔄 Users component - realtimeUsers updated:', realtimeUsers);
    if (realtimeUsers && realtimeUsers.length > 0) {
      const formattedUsers = realtimeUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet?.balance || 0,
        status: user.role === 'blocked' ? 'blocked' : 'active',
        borrows: user.transactions?.filter(t => t.type === 'borrow').length || 0,
        penalties: user.transactions?.filter(t => t.type === 'penalty').length || 0,
        joinDate: new Date(user.createdAt).toISOString().split('T')[0]
      }))
      console.log('✅ Formatted users for display:', formattedUsers);
      setUsers(formattedUsers)
      setIsLoading(false)
    } else {
      console.log('⚠️ No real-time users data available');
      setIsLoading(false)
    }
  }, [realtimeUsers])

  // Fallback: Fetch users directly if real-time fails
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isConnected && users.length === 0) {
        try {
          console.log('🔄 Fetching users via API fallback...');
          const response = await adminAPI.getUsers();
          const formattedUsers = response.users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            wallet: user.wallet?.balance || 0,
            status: user.role === 'blocked' ? 'blocked' : 'active',
            borrows: user.transactions?.filter(t => t.type === 'borrow').length || 0,
            penalties: user.transactions?.filter(t => t.type === 'penalty').length || 0,
            joinDate: new Date(user.createdAt).toISOString().split('T')[0]
          }));
          setUsers(formattedUsers);
          console.log('✅ Users fetched via API:', formattedUsers);
        } catch (error) {
          console.error('❌ Failed to fetch users:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
  }, [isConnected, users.length])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
        : user
    ))
  }

  const addWalletBalance = (userId, amount) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, wallet: user.wallet + amount }
        : user
    ))
  }

  // Export functionality for users
  const exportUsersToCSV = () => {
    setIsExporting(true)
    const csvContent = [
      ['User ID', 'Name', 'Email', 'Role', 'Wallet Balance', 'Status', 'Borrows', 'Penalties', 'Join Date'],
      ...filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.wallet,
        user.status,
        user.borrows,
        user.penalties,
        user.joinDate
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const exportUsersToJSON = () => {
    setIsExporting(true)
    const jsonContent = JSON.stringify(filteredUsers, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const exportUsersToExcel = () => {
    setIsExporting(true)
    const table = document.createElement('table')
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Wallet Balance', 'Status', 'Borrows', 'Penalties', 'Join Date']
    const headerRow = document.createElement('tr')
    headers.forEach(header => {
      const th = document.createElement('th')
      th.textContent = header
      headerRow.appendChild(th)
    })
    table.appendChild(headerRow)
    
    filteredUsers.forEach(user => {
      const row = document.createElement('tr')
      const values = [user.id, user.name, user.email, user.role, user.wallet, user.status, user.borrows, user.penalties, user.joinDate]
      values.forEach(value => {
        const td = document.createElement('td')
        td.textContent = value
        row.appendChild(td)
      })
      table.appendChild(row)
    })
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${table.outerHTML}
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.xls`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const handleUserExport = () => {
    switch(exportFormat) {
      case 'csv': exportUsersToCSV(); break
      case 'json': exportUsersToJSON(); break
      case 'excel': exportUsersToExcel(); break
      default: exportUsersToCSV()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">User Management</h1>
          <p className="text-base-content/70 mt-1">Manage users, wallets, and access controls</p>
          <div className="hidden sm:flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1 py-1 rounded-full">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'} animate-pulse`}></span>
              <span className="text-xs text-base-content/70">{isConnected ? 'Connected' : 'Offline'}</span>
            </span>
            <span className="text-xs sm:text-sm text-base-content/50 whitespace-nowrap">
              {users.length} users loaded
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{userStats.total || users.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Active</div>
              <div className="stat-value text-success">{userStats.active || users.filter(u => u.status === 'active').length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">New Users</div>
              <div className="stat-value text-info">{userStats.newUsers || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Explorers</div>
              <div className="stat-value text-warning">{userStats.explorers || 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="select select-bordered select-sm"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
            </select>
            <button 
              className={`btn btn-primary btn-sm ${isExporting ? 'loading' : ''}`}
              onClick={handleUserExport}
              disabled={isExporting || users.length === 0}
            >
              {isExporting ? 'Exporting...' : 'Export Users'}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input 
                className="input input-bordered w-full" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="select select-bordered"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="new_user">New Users</option>
              <option value="existing_user">Existing Users</option>
              <option value="explorer">Explorers</option>
            </select>
            <select 
              className="select select-bordered"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>


      {/* Users Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Wallet</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <span className="loading loading-spinner"></span>
                        <span>Loading users from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="text-base-content/50">
                        No users found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-12">
                              <span className="text-xl">{user.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm opacity-50">{user.email}</div>
                            <div className="text-xs opacity-50">Joined: {user.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${
                          user.role === 'new_user' ? 'badge-info' :
                          user.role === 'existing_user' ? 'badge-success' :
                          'badge-warning'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-success">₹{user.wallet}</div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>Borrows: {user.borrows}</div>
                          <div className={user.penalties > 0 ? 'text-error' : 'text-success'}>
                            Penalties: {user.penalties}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${user.status === 'active' ? 'sm:badge-success' : 'badge-error'} ${user.status === 'active' ? 'badge-ghost sm:badge-success' : ''}`}>
                          {user.status}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => setSelectedUser(user)}
                          >
                            View
                          </button>
                          <button 
                            className={`btn btn-sm ${user.status === 'active' ? 'btn-error' : 'btn-success'}`}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Block' : 'Unblock'}
                          </button>
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => addWalletBalance(user.id, 50)}
                          >
                            Add ₹50
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">User Details - {selectedUser.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Role:</strong> {selectedUser.role}</div>
                <div><strong>Status:</strong> {selectedUser.status}</div>
                <div><strong>Join Date:</strong> {selectedUser.joinDate}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Wallet Balance:</strong> ₹{selectedUser.wallet}</div>
                <div><strong>Total Borrows:</strong> {selectedUser.borrows}</div>
                <div><strong>Penalties:</strong> {selectedUser.penalties}</div>
              </div>
            </div>

            <div className="divider">Recent Transactions</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Wallet Deposit</span>
                <span className="text-success">+₹100</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Umbrella Borrow</span>
                <span className="text-error">-₹10</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Late Return Penalty</span>
                <span className="text-error">-₹25</span>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedUser(null)}>Close</button>
              <button className="btn btn-primary">Edit User</button>
            </div>
          </div>
        </dialog>
      )}
  </div>
  )
}

export function Stations(){
  return <StationsPage />
}

export function Inventory(){
  // Local data; ensure stable initial render to avoid blink
  const [umbrellas, setUmbrellas] = useState([
    { id: 'UMB001', qrCode: 'QR001', station: 'Main Gate', status: 'available', condition: 'good', lastMaintenance: '2024-09-15', borrowCount: 45, adRevenue: 120 },
    { id: 'UMB002', qrCode: 'QR002', station: 'Library Block', status: 'borrowed', condition: 'good', lastMaintenance: '2024-09-10', borrowCount: 32, adRevenue: 85 },
    { id: 'UMB003', qrCode: 'QR003', station: 'Main Gate', status: 'maintenance', condition: 'damaged', lastMaintenance: '2024-08-20', borrowCount: 67, adRevenue: 200 },
    { id: 'UMB004', qrCode: 'QR004', station: 'Cafeteria', status: 'available', condition: 'fair', lastMaintenance: '2024-09-01', borrowCount: 28, adRevenue: 75 },
    { id: 'UMB005', qrCode: 'QR005', station: 'Sports Ground', status: 'drying', condition: 'good', lastMaintenance: '2024-09-12', borrowCount: 41, adRevenue: 110 }
  ])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCondition, setFilterCondition] = useState('all')
  const [selectedUmbrella, setSelectedUmbrella] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredUmbrellas = umbrellas.filter(umbrella => {
    const matchesStatus = filterStatus === 'all' || umbrella.status === filterStatus
    const matchesCondition = filterCondition === 'all' || umbrella.condition === filterCondition
    return matchesStatus && matchesCondition
  })

  const updateUmbrellaStatus = (umbrellaId, newStatus) => {
    setUmbrellas(umbrellas.map(umbrella => 
      umbrella.id === umbrellaId 
        ? { ...umbrella, status: newStatus }
        : umbrella
    ))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'badge-success'
      case 'borrowed': return 'badge-warning'
      case 'maintenance': return 'badge-error'
      case 'drying': return 'badge-info'
      default: return 'badge-ghost'
    }
  }

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'good': return 'text-success'
      case 'fair': return 'text-warning'
      case 'damaged': return 'text-error'
      default: return 'text-base-content'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Umbrella Inventory</h1>
          <p className="text-base-content/70 mt-1">Track and manage umbrella assets</p>
        </div>
        <div className="stats shadow w-full sm:w-auto">
          <div className="stat">
            <div className="stat-title">Total</div>
            <div className="stat-value text-primary">{umbrellas.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Available</div>
            <div className="stat-value text-success">{umbrellas.filter(u => u.status === 'available').length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">In Use</div>
            <div className="stat-value text-warning">{umbrellas.filter(u => u.status === 'borrowed').length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Maintenance</div>
            <div className="stat-value text-error">{umbrellas.filter(u => u.status === 'maintenance').length}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Umbrella
        </button>
        <button className="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import CSV
        </button>
        <button className="btn btn-accent">Generate QR Codes</button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <select 
              className="select select-bordered"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="maintenance">Maintenance</option>
              <option value="drying">Drying</option>
            </select>
            <select 
              className="select select-bordered"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="all">All Conditions</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Umbrellas Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra text-sm md:text-base">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">ID / QR Code</th>
                  <th>Station</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Usage</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUmbrellas.map(umbrella => (
                  <tr key={umbrella.id}>
                    <td>
                      <div>
                        <div className="font-bold break-all">{umbrella.id}</div>
                        <div className="text-xs opacity-50 break-all">{umbrella.qrCode}</div>
                      </div>
                    </td>
                    <td>{umbrella.station}</td>
                    <td>
                      <div className={`badge sm:${getStatusColor(umbrella.status)} ${getStatusColor(umbrella.status)==='badge-success' ? 'badge-ghost sm:badge-success' : ''}`}>
                        {umbrella.status}
                      </div>
                    </td>
                    <td>
                      <span className={getConditionColor(umbrella.condition)}>
                        {umbrella.condition}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>Borrows: {umbrella.borrowCount}</div>
                        <div className="text-xs opacity-50 whitespace-nowrap">Last: {umbrella.lastMaintenance}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-success">₹{umbrella.adRevenue}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => setSelectedUmbrella(umbrella)}
                        >
                          View
                        </button>
                        <div className="dropdown dropdown-end">
                          <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">⋮</div>
                          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow">
                            <li><a onClick={() => updateUmbrellaStatus(umbrella.id, 'maintenance')}>Send to Maintenance</a></li>
                            <li><a onClick={() => updateUmbrellaStatus(umbrella.id, 'available')}>Mark Available</a></li>
                            <li><a>Generate QR</a></li>
                            <li><a className="text-error">Remove</a></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Umbrella Modal */}
      {showAddModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Umbrella</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Umbrella ID</label>
                <input type="text" className="input input-bordered w-full" placeholder="UMB006" />
              </div>
              
              <div>
                <label className="label">QR Code</label>
                <input type="text" className="input input-bordered w-full" placeholder="QR006" />
              </div>
              
              <div>
                <label className="label">Assign to Station</label>
                <select className="select select-bordered w-full">
                  <option>Main Gate</option>
                  <option>Library Block</option>
                  <option>Cafeteria</option>
                  <option>Sports Ground</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary">Add Umbrella</button>
            </div>
          </div>
        </dialog>
      )}

      {/* Umbrella Detail Modal */}
      {selectedUmbrella && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Umbrella Details - {selectedUmbrella.id}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div><strong>ID:</strong> {selectedUmbrella.id}</div>
                <div><strong>QR Code:</strong> {selectedUmbrella.qrCode}</div>
                <div><strong>Station:</strong> {selectedUmbrella.station}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 badge sm:${getStatusColor(selectedUmbrella.status)} ${getStatusColor(selectedUmbrella.status)==='badge-success' ? 'badge-ghost sm:badge-success' : ''}`}>
                    {selectedUmbrella.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div><strong>Condition:</strong> 
                  <span className={`ml-2 ${getConditionColor(selectedUmbrella.condition)}`}>
                    {selectedUmbrella.condition}
                  </span>
                </div>
                <div><strong>Borrow Count:</strong> {selectedUmbrella.borrowCount}</div>
                <div><strong>Ad Revenue:</strong> ₹{selectedUmbrella.adRevenue}</div>
                <div><strong>Last Maintenance:</strong> {selectedUmbrella.lastMaintenance}</div>
              </div>
            </div>

            <div className="divider">Maintenance History</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Routine cleaning and inspection</span>
                <span className="text-sm text-base-content/70">2024-09-15</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Handle repair</span>
                <span className="text-sm text-base-content/70">2024-08-20</span>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedUmbrella(null)}>Close</button>
              <button className="btn btn-warning">Schedule Maintenance</button>
              <button className="btn btn-primary">Edit Details</button>
            </div>
          </div>
        </dialog>
      )}

      {/* (removed erroneous user summary block from Inventory) */}
    </div>
  )
}

export function Transactions(){
  const { transactions: realtimeTransactions, isConnected, users } = useRealtime()
  const [transactions, setTransactions] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [exportFormat, setExportFormat] = useState('csv')
  const [isExporting, setIsExporting] = useState(false)

  // Update transactions from real-time data
  useEffect(() => {
    if (realtimeTransactions && realtimeTransactions.length > 0) {
      const formattedTransactions = realtimeTransactions.map((txn, index) => ({
        id: `TXN${String(index + 1).padStart(3, '0')}`,
        user: txn.userName || 'Unknown User',
        type: txn.type,
        amount: txn.amount,
        status: 'completed', // Default status
        date: new Date(txn.createdAt).toLocaleString(),
        method: txn.meta?.method || 'wallet',
        reference: txn.meta?.reference || txn.type
      }))
      setTransactions(formattedTransactions)
    }
  }, [realtimeTransactions])

  // Fallback: Fetch transactions directly if real-time fails
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected && transactions.length === 0) {
        try {
          console.log('🔄 Fetching transactions via API fallback...');
          const response = await adminAPI.getTransactions();
          const formattedTransactions = response.transactions.map((txn, index) => ({
            id: `TXN${String(index + 1).padStart(3, '0')}`,
            user: txn.userName || 'Unknown User',
            type: txn.type,
            amount: txn.amount,
            status: 'completed',
            date: new Date(txn.createdAt).toLocaleString(),
            method: txn.meta?.method || 'wallet',
            reference: txn.meta?.reference || txn.type
          }));
          setTransactions(formattedTransactions);
          console.log('✅ Transactions fetched via API:', formattedTransactions);
        } catch (error) {
          console.error('❌ Failed to fetch transactions:', error);
        }
      }
    };

    fetchTransactions();
  }, [isConnected, transactions.length])

  const filteredTransactions = transactions.filter(txn => {
    const matchesType = filterType === 'all' || txn.type === filterType
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus
    return matchesType && matchesStatus
  })

  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit': return 'badge-success'
      case 'borrow': return 'badge-info'
      case 'penalty': return 'badge-error'
      case 'refund': return 'badge-warning'
      default: return 'badge-ghost'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'failed': return 'badge-error'
      default: return 'badge-ghost'
    }
  }

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const totalPenalties = Math.abs(transactions.filter(t => t.type === 'penalty' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))
  const totalRefunds = transactions.filter(t => t.type === 'refund' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const pendingRefunds = transactions.filter(t => t.type === 'refund' && t.status === 'pending').length

  // Export functionality
  const exportToCSV = () => {
    setIsExporting(true)
    const csvContent = [
      ['Transaction ID', 'User', 'Type', 'Amount', 'Status', 'Date', 'Method', 'Reference'],
      ...filteredTransactions.map(txn => [
        txn.id,
        txn.user,
        txn.type,
        txn.amount,
        txn.status,
        txn.date,
        txn.method,
        txn.reference
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const exportToJSON = () => {
    setIsExporting(true)
    const jsonContent = JSON.stringify(filteredTransactions, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const exportToExcel = () => {
    setIsExporting(true)
    // Simple Excel export using HTML table
    const table = document.createElement('table')
    const headers = ['Transaction ID', 'User', 'Type', 'Amount', 'Status', 'Date', 'Method', 'Reference']
    const headerRow = document.createElement('tr')
    headers.forEach(header => {
      const th = document.createElement('th')
      th.textContent = header
      headerRow.appendChild(th)
    })
    table.appendChild(headerRow)
    
    filteredTransactions.forEach(txn => {
      const row = document.createElement('tr')
      const values = [txn.id, txn.user, txn.type, txn.amount, txn.status, txn.date, txn.method, txn.reference]
      values.forEach(value => {
        const td = document.createElement('td')
        td.textContent = value
        row.appendChild(td)
      })
      table.appendChild(row)
    })
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${table.outerHTML}
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.xls`
    a.click()
    window.URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const handleExport = () => {
    switch(exportFormat) {
      case 'csv': exportToCSV(); break
      case 'json': exportToJSON(); break
      case 'excel': exportToExcel(); break
      default: exportToCSV()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Transaction Management</h1>
          <p className="text-base-content/70 mt-1">Monitor wallet operations and financial activities</p>
          <div className="hidden sm:flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1 py-1 rounded-full">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-error'} animate-pulse`}></span>
              <span className="text-xs text-base-content/70">{isConnected ? 'Connected' : 'Offline'}</span>
            </span>
            <span className="text-xs sm:text-sm text-base-content/50 whitespace-nowrap">
              {transactions.length} transactions loaded
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="select select-bordered select-sm"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>
          <button 
            className={`btn btn-primary btn-sm ${isExporting ? 'loading' : ''}`}
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Total Deposits</div>
              <div className="stat-value text-success">₹{totalDeposits}</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Penalties Collected</div>
              <div className="stat-value text-error">₹{totalPenalties}</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Refunds Processed</div>
              <div className="stat-value text-warning">₹{totalRefunds}</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Pending Refunds</div>
              <div className="stat-value text-info">{pendingRefunds}</div>
              <div className="stat-desc">Awaiting approval</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center">
            <select 
              className="select select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="borrow">Borrows</option>
              <option value="penalty">Penalties</option>
              <option value="refund">Refunds</option>
            </select>
            <select 
              className="select select-bordered"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/70">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>
              {isConnected && (
                <div className="flex items-center gap-1 text-success text-sm">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  Live updates
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td>
                      <div className="font-mono text-sm">{txn.id}</div>
                    </td>
                    <td>
                      <div className="font-medium">{txn.user}</div>
                    </td>
                    <td>
                      <div className={`badge ${getTypeColor(txn.type)}`}>
                        {txn.type}
                      </div>
                    </td>
                    <td>
                      <div className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-error'}`}>
                        {txn.amount > 0 ? '+' : ''}₹{txn.amount}
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{txn.date}</div>
                    </td>
                    <td>
                      <div className="text-sm">{txn.method}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => setSelectedTransaction(txn)}
                        >
                          View
                        </button>
                        {txn.status === 'pending' && txn.type === 'refund' && (
                          <div className="flex gap-1">
                            <button className="btn btn-sm btn-success">Approve</button>
                            <button className="btn btn-sm btn-error">Reject</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Transaction Details - {selectedTransaction.id}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div><strong>Transaction ID:</strong> {selectedTransaction.id}</div>
                <div><strong>User:</strong> {selectedTransaction.user}</div>
                <div><strong>Type:</strong> 
                  <span className={`ml-2 badge ${getTypeColor(selectedTransaction.type)}`}>
                    {selectedTransaction.type}
                  </span>
                </div>
                <div><strong>Amount:</strong> 
                  <span className={`ml-2 font-bold ${selectedTransaction.amount > 0 ? 'text-success' : 'text-error'}`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}₹{selectedTransaction.amount}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div><strong>Status:</strong> 
                  <span className={`ml-2 badge ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div><strong>Date:</strong> {selectedTransaction.date}</div>
                <div><strong>Payment Method:</strong> {selectedTransaction.method}</div>
                <div><strong>Reference:</strong> {selectedTransaction.reference}</div>
              </div>
            </div>

            <div className="divider">Transaction Timeline</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Transaction initiated</span>
                <span className="text-sm text-base-content/70">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Payment processed</span>
                <span className="text-sm text-base-content/70">{selectedTransaction.date}</span>
              </div>
              {selectedTransaction.status === 'completed' && (
                <div className="flex justify-between p-2 bg-success/20 rounded">
                  <span>Transaction completed</span>
                  <span className="text-sm text-base-content/70">{selectedTransaction.date}</span>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedTransaction(null)}>Close</button>
              {selectedTransaction.type === 'refund' && selectedTransaction.status === 'pending' && (
                <>
                  <button className="btn btn-error">Reject Refund</button>
                  <button className="btn btn-success">Approve Refund</button>
                </>
              )}
            </div>
          </div>
        </dialog>
      )}

      {/* Real-time Transaction Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeTransactionFeed maxItems={15} showUserInfo={true} />
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Transaction Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="text-success font-medium">Total Deposits</span>
                <span className="text-success font-bold">₹{totalDeposits}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-error/10 rounded-lg">
                <span className="text-error font-medium">Penalties Collected</span>
                <span className="text-error font-bold">₹{totalPenalties}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                <span className="text-warning font-medium">Refunds Processed</span>
                <span className="text-warning font-bold">₹{totalRefunds}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-info/10 rounded-lg">
                <span className="text-info font-medium">Pending Refunds</span>
                <span className="text-info font-bold">{pendingRefunds}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Ads(){
  const [ads, setAds] = useState([
    { id: 'AD001', title: 'Local Restaurant Promo', advertiser: 'Tasty Bites', status: 'active', impressions: 15420, clicks: 342, revenue: 1250, startDate: '2024-09-01', endDate: '2024-10-31', stations: ['Main Gate', 'Library Block'] },
    { id: 'AD002', title: 'College Bookstore Sale', advertiser: 'Campus Books', status: 'active', impressions: 8930, clicks: 178, revenue: 890, startDate: '2024-09-15', endDate: '2024-10-15', stations: ['Library Block', 'Admin Block'] },
    { id: 'AD003', title: 'Sports Equipment Discount', advertiser: 'SportZone', status: 'paused', impressions: 5240, clicks: 89, revenue: 445, startDate: '2024-08-20', endDate: '2024-09-20', stations: ['Sports Ground'] },
    { id: 'AD004', title: 'Food Delivery App', advertiser: 'QuickEats', status: 'active', impressions: 12680, clicks: 456, revenue: 1890, startDate: '2024-09-10', endDate: '2024-11-10', stations: ['Cafeteria', 'Main Gate'] }
  ])
  const [selectedAd, setSelectedAd] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const totalRevenue = ads.reduce((sum, ad) => sum + ad.revenue, 0)
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0)
  const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'badge-success'
      case 'paused': return 'badge-warning'
      case 'expired': return 'badge-error'
      default: return 'badge-ghost'
    }
  }

  const toggleAdStatus = (adId) => {
    setAds(ads.map(ad => 
      ad.id === adId 
        ? { ...ad, status: ad.status === 'active' ? 'paused' : 'active' }
        : ad
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Advertisement Management</h1>
          <p className="text-base-content/70 mt-1">Manage ads and track performance metrics</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value text-success">₹{totalRevenue}</div>
              <div className="stat-desc">This month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Impressions</div>
              <div className="stat-value text-primary">{totalImpressions.toLocaleString()}</div>
              <div className="stat-desc">Total views</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Clicks</div>
              <div className="stat-value text-info">{totalClicks}</div>
              <div className="stat-desc">User interactions</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">CTR</div>
              <div className="stat-value text-warning">{averageCTR}%</div>
              <div className="stat-desc">Click-through rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Upload Ad
        </button>
        <button className="btn btn-secondary">Performance Report</button>
        <button className="btn btn-accent">Revenue Analytics</button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ads.map(ad => (
          <div key={ad.id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">{ad.title}</h3>
                <div className={`badge ${getStatusColor(ad.status)}`}>
                  {ad.status}
                </div>
              </div>
              
              <p className="text-sm text-base-content/70 mb-4">Advertiser: {ad.advertiser}</p>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Impressions</div>
                  <div className="stat-value text-sm text-primary">{ad.impressions.toLocaleString()}</div>
                </div>
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Clicks</div>
                  <div className="stat-value text-sm text-info">{ad.clicks}</div>
                </div>
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Revenue</div>
                  <div className="stat-value text-sm text-success">₹{ad.revenue}</div>
                </div>
              </div>

              {/* Campaign Period */}
              <div className="text-xs text-base-content/50 mb-4">
                <div>Period: {ad.startDate} to {ad.endDate}</div>
                <div>Stations: {ad.stations.join(', ')}</div>
              </div>

              {/* Action Buttons */}
              <div className="card-actions justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => setSelectedAd(ad)}
                  >
                    Details
                  </button>
                  <button 
                    className={`btn btn-sm ${ad.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleAdStatus(ad.id)}
                  >
                    {ad.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                </div>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">⋮</div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow">
                    <li><a>Edit Campaign</a></li>
                    <li><a>Reassign Stations</a></li>
                    <li><a>Download Report</a></li>
                    <li><a className="text-error">Remove Ad</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Ad Modal */}
      {showUploadModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Upload New Advertisement</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ad Title</label>
                  <input type="text" className="input input-bordered w-full" placeholder="Enter ad title" />
                </div>
                <div>
                  <label className="label">Advertiser Name</label>
                  <input type="text" className="input input-bordered w-full" placeholder="Company/Brand name" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input input-bordered w-full" />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" className="input input-bordered w-full" />
                </div>
              </div>
              
              <div>
                <label className="label">Assign to Stations</label>
                <div className="flex flex-wrap gap-2">
                  {['Main Gate', 'Library Block', 'Cafeteria', 'Sports Ground', 'Admin Block'].map(station => (
                    <label key={station} className="label cursor-pointer">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                      <span className="label-text ml-2">{station}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label">Upload Ad Image</label>
                <input type="file" className="file-input file-input-bordered w-full" accept="image/*" />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary">Upload Ad</button>
            </div>
          </div>
        </dialog>
      )}

      {/* Ad Detail Modal */}
      {selectedAd && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">Advertisement Details - {selectedAd.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div><strong>Ad ID:</strong> {selectedAd.id}</div>
                <div><strong>Title:</strong> {selectedAd.title}</div>
                <div><strong>Advertiser:</strong> {selectedAd.advertiser}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 badge ${getStatusColor(selectedAd.status)}`}>
                    {selectedAd.status}
                  </span>
                </div>
                <div><strong>Campaign Period:</strong> {selectedAd.startDate} to {selectedAd.endDate}</div>
              </div>
              
              <div className="space-y-3">
                <div><strong>Impressions:</strong> {selectedAd.impressions.toLocaleString()}</div>
                <div><strong>Clicks:</strong> {selectedAd.clicks}</div>
                <div><strong>CTR:</strong> {((selectedAd.clicks / selectedAd.impressions) * 100).toFixed(2)}%</div>
                <div><strong>Revenue Generated:</strong> ₹{selectedAd.revenue}</div>
                <div><strong>Assigned Stations:</strong> {selectedAd.stations.join(', ')}</div>
              </div>
            </div>

            <div className="divider">Performance Analytics</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="stat bg-base-200 rounded p-4">
                <div className="stat-title">Daily Avg Impressions</div>
                <div className="stat-value text-primary">{Math.round(selectedAd.impressions / 30)}</div>
              </div>
              <div className="stat bg-base-200 rounded p-4">
                <div className="stat-title">Daily Avg Clicks</div>
                <div className="stat-value text-info">{Math.round(selectedAd.clicks / 30)}</div>
              </div>
              <div className="stat bg-base-200 rounded p-4">
                <div className="stat-title">Revenue per Click</div>
                <div className="stat-value text-success">₹{(selectedAd.revenue / selectedAd.clicks).toFixed(2)}</div>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedAd(null)}>Close</button>
              <button className="btn btn-warning">Edit Campaign</button>
              <button className="btn btn-primary">Download Report</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export function Reports(){
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedReport, setSelectedReport] = useState('usage')

  const reportData = {
    usage: {
      title: 'Usage Analytics',
      data: [
        { period: 'January', borrows: 1250, returns: 1240, penalties: 15 },
        { period: 'February', borrows: 1380, returns: 1375, penalties: 8 },
        { period: 'March', borrows: 1420, returns: 1410, penalties: 12 },
        { period: 'April', borrows: 1680, returns: 1670, penalties: 18 },
        { period: 'May', borrows: 1590, returns: 1585, penalties: 9 },
        { period: 'June', borrows: 1750, returns: 1745, penalties: 7 }
      ]
    },
    revenue: {
      title: 'Revenue Report',
      data: [
        { period: 'January', wallet: 12500, ads: 3200, penalties: 375 },
        { period: 'February', wallet: 13800, ads: 3800, penalties: 200 },
        { period: 'March', wallet: 14200, ads: 4100, penalties: 300 },
        { period: 'April', wallet: 16800, ads: 4500, penalties: 450 },
        { period: 'May', wallet: 15900, ads: 4200, penalties: 225 },
        { period: 'June', wallet: 17500, ads: 4800, penalties: 175 }
      ]
    },
    maintenance: {
      title: 'Maintenance Report',
      data: [
        { period: 'January', scheduled: 25, emergency: 8, cost: 1200 },
        { period: 'February', scheduled: 30, emergency: 5, cost: 1100 },
        { period: 'March', scheduled: 28, emergency: 12, cost: 1500 },
        { period: 'April', scheduled: 32, emergency: 6, cost: 1300 },
        { period: 'May', scheduled: 29, emergency: 9, cost: 1400 },
        { period: 'June', scheduled: 35, emergency: 4, cost: 1250 }
      ]
    }
  }

  const currentData = reportData[selectedReport]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Reports & Analytics</h1>
          <p className="text-base-content/70 mt-1">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary">Export All</button>
          <button className="btn btn-secondary">Schedule Report</button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <select 
              className="select select-bordered"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="usage">Usage Analytics</option>
              <option value="revenue">Revenue Report</option>
              <option value="maintenance">Maintenance Report</option>
            </select>
            <select 
              className="select select-bordered"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" className="input input-bordered" />
            <input type="date" className="input input-bordered" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">2,847</div>
              <div className="stat-desc">↗ 12% from last month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value text-success">₹89,420</div>
              <div className="stat-desc">↗ 8.7% from last month</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Active Stations</div>
              <div className="stat-value text-info">28/30</div>
              <div className="stat-desc">93.3% uptime</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Avg Daily Usage</div>
              <div className="stat-value text-warning">156</div>
              <div className="stat-desc">borrows per day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Report */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <h3 className="card-title text-xl">{currentData.title}</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-outline">Download PDF</button>
              <button className="btn btn-sm btn-outline">Download CSV</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Period</th>
                  {selectedReport === 'usage' && (
                    <>
                      <th>Borrows</th>
                      <th>Returns</th>
                      <th>Penalties</th>
                      <th>Return Rate</th>
                    </>
                  )}
                  {selectedReport === 'revenue' && (
                    <>
                      <th>Wallet Revenue</th>
                      <th>Ad Revenue</th>
                      <th>Penalty Revenue</th>
                      <th>Total</th>
                    </>
                  )}
                  {selectedReport === 'maintenance' && (
                    <>
                      <th>Scheduled</th>
                      <th>Emergency</th>
                      <th>Cost</th>
                      <th>Efficiency</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentData.data.map((row, index) => (
                  <tr key={index}>
                    <td className="font-medium">{row.period}</td>
                    {selectedReport === 'usage' && (
                      <>
                        <td>{row.borrows}</td>
                        <td>{row.returns}</td>
                        <td className="text-error">{row.penalties}</td>
                        <td className="text-success">{((row.returns / row.borrows) * 100).toFixed(1)}%</td>
                      </>
                    )}
                    {selectedReport === 'revenue' && (
                      <>
                        <td className="text-success">₹{row.wallet}</td>
                        <td className="text-info">₹{row.ads}</td>
                        <td className="text-warning">₹{row.penalties}</td>
                        <td className="font-bold">₹{row.wallet + row.ads + row.penalties}</td>
                      </>
                    )}
                    {selectedReport === 'maintenance' && (
                      <>
                        <td className="text-success">{row.scheduled}</td>
                        <td className="text-error">{row.emergency}</td>
                        <td>₹{row.cost}</td>
                        <td className="text-info">{((row.scheduled / (row.scheduled + row.emergency)) * 100).toFixed(1)}%</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title mb-4">📊 Key Insights</h3>
            <div className="space-y-3">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <div className="font-bold">Peak Usage Hours</div>
                  <div className="text-sm">8-10 AM and 5-7 PM show highest activity</div>
                </div>
              </div>
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold">Revenue Growth</div>
                  <div className="text-sm">Consistent 8-12% monthly growth trend</div>
                </div>
              </div>
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <div className="font-bold">Maintenance Alert</div>
                  <div className="text-sm">Emergency repairs increased by 15% this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title mb-4">🎯 Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="font-bold text-primary">Expand Popular Stations</div>
                <div className="text-sm">Main Gate and Library Block need more umbrellas</div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <div className="font-bold text-success">Optimize Ad Placement</div>
                <div className="text-sm">Cafeteria shows highest ad engagement rates</div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="font-bold text-warning">Preventive Maintenance</div>
                <div className="text-sm">Schedule more regular maintenance to reduce emergencies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Settings(){
  const [activeTab, setActiveTab] = useState('roles')
  const [policies, setPolicies] = useState({
    minWallet: 50,
    borrowDuration: 24,
    latePenalty: 25,
    damagePenalty: 100,
    maxBorrowTime: 72
  })
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Naveen.G', userId: 'NK3021T', role: 'super_admin', status: 'active', lastLogin: '2024-10-02 09:30' },
    { id: 2, name: 'Admin User', userId: 'ADMIN001', role: 'admin', status: 'active', lastLogin: '2024-10-01 14:20' }
  ])
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)

  const updatePolicy = (key, value) => {
    setPolicies(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">System Settings</h1>
          <p className="text-base-content/70 mt-1">Configure system policies and admin access</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <a 
          className={`tab ${activeTab === 'roles' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Admin Roles
        </a>
        <a 
          className={`tab ${activeTab === 'policies' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          System Policies
        </a>
        <a 
          className={`tab ${activeTab === 'notifications' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </a>
        <a 
          className={`tab ${activeTab === 'system' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Config
        </a>
      </div>

      {/* Admin Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Admin Management</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddAdminModal(true)}
            >
              Add New Admin
            </button>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Admin Details</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id}>
                        <td>
                          <div>
                            <div className="font-bold">{admin.name}</div>
                            <div className="text-sm opacity-50">{admin.userId}</div>
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${admin.role === 'super_admin' ? 'badge-error' : 'badge-info'}`}>
                            {admin.role.replace('_', ' ')}
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${admin.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                            {admin.status}
                          </div>
                        </td>
                        <td>{admin.lastLogin}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-info">Edit</button>
                            {admin.role !== 'super_admin' && (
                              <button className="btn btn-sm btn-error">Remove</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Super Admin Permissions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Full system access</li>
                  <li>Add/remove admins</li>
                  <li>Modify system policies</li>
                  <li>Access all reports</li>
                  <li>System configuration</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Admin Permissions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>User management</li>
                  <li>Station operations</li>
                  <li>Inventory management</li>
                  <li>Transaction monitoring</li>
                  <li>Basic reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">System Policies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">Wallet & Payment Policies</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Minimum Wallet Balance (₹)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={policies.minWallet}
                      onChange={(e) => updatePolicy('minWallet', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Borrow Cost per Hour (₹)</label>
                    <input type="number" className="input input-bordered w-full" defaultValue="10" />
                  </div>
                  <div>
                    <label className="label">Late Return Penalty (₹)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={policies.latePenalty}
                      onChange={(e) => updatePolicy('latePenalty', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">Borrow & Return Policies</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Standard Borrow Duration (hours)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={policies.borrowDuration}
                      onChange={(e) => updatePolicy('borrowDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Maximum Borrow Time (hours)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={policies.maxBorrowTime}
                      onChange={(e) => updatePolicy('maxBorrowTime', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Damage Penalty (₹)</label>
                    <input 
                      type="number" 
                      className="input input-bordered w-full" 
                      value={policies.damagePenalty}
                      onChange={(e) => updatePolicy('damagePenalty', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="card-title">Current Policy Summary</h3>
                <button className="btn btn-primary">Save Changes</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="stat bg-base-200 rounded p-4">
                  <div className="stat-title">Min Wallet</div>
                  <div className="stat-value text-primary">₹{policies.minWallet}</div>
                </div>
                <div className="stat bg-base-200 rounded p-4">
                  <div className="stat-title">Borrow Duration</div>
                  <div className="stat-value text-info">{policies.borrowDuration}h</div>
                </div>
                <div className="stat bg-base-200 rounded p-4">
                  <div className="stat-title">Late Penalty</div>
                  <div className="stat-value text-error">₹{policies.latePenalty}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Notification Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">Email Templates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Welcome Email Subject</label>
                    <input type="text" className="input input-bordered w-full" defaultValue="Welcome to NammaKoda!" />
                  </div>
                  <div>
                    <label className="label">Late Return Reminder</label>
                    <textarea className="textarea textarea-bordered w-full" rows="3" defaultValue="Your umbrella return is overdue. Please return it to avoid penalties."></textarea>
                  </div>
                  <div>
                    <label className="label">Penalty Notice</label>
                    <textarea className="textarea textarea-bordered w-full" rows="3" defaultValue="A penalty of ₹{amount} has been applied to your account for late return."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">SMS Templates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Borrow Confirmation</label>
                    <textarea className="textarea textarea-bordered w-full" rows="2" defaultValue="Umbrella borrowed successfully. Return by {time} to avoid penalty."></textarea>
                  </div>
                  <div>
                    <label className="label">Return Confirmation</label>
                    <textarea className="textarea textarea-bordered w-full" rows="2" defaultValue="Umbrella returned successfully. Thank you for using NammaKoda!"></textarea>
                  </div>
                  <div>
                    <label className="label">Low Balance Alert</label>
                    <textarea className="textarea textarea-bordered w-full" rows="2" defaultValue="Your wallet balance is low (₹{balance}). Please recharge to continue using the service."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title mb-4">Notification Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Send welcome emails</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">SMS notifications</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Late return reminders</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Penalty notifications</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Maintenance alerts</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">System status updates</span>
                      <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Config Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">System Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>System Version:</span>
                    <span className="font-bold">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Status:</span>
                    <span className="badge badge-success">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup:</span>
                    <span>2024-10-02 03:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sessions:</span>
                    <span className="font-bold">247</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title mb-4">System Actions</h3>
                <div className="space-y-3">
                  <button className="btn btn-info w-full">Create System Backup</button>
                  <button className="btn btn-warning w-full">Clear Cache</button>
                  <button className="btn btn-secondary w-full">Export Logs</button>
                  <button className="btn btn-error w-full">System Maintenance Mode</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title mb-4">API Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Payment Gateway API Key</label>
                  <input type="password" className="input input-bordered w-full" defaultValue="sk_test_***************" />
                </div>
                <div>
                  <label className="label">SMS Service API Key</label>
                  <input type="password" className="input input-bordered w-full" defaultValue="sms_***************" />
                </div>
                <div>
                  <label className="label">Email Service API Key</label>
                  <input type="password" className="input input-bordered w-full" defaultValue="email_***************" />
                </div>
                <div>
                  <label className="label">Maps API Key</label>
                  <input type="password" className="input input-bordered w-full" defaultValue="maps_***************" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Access Password</label>
                <input type="password" className="input input-bordered w-full" placeholder="Enter access password" />
              </div>
              <div>
                <label className="label">Admin Name</label>
                <input type="text" className="input input-bordered w-full" placeholder="Full name" />
              </div>
              <div>
                <label className="label">User ID</label>
                <input type="text" className="input input-bordered w-full" placeholder="Unique user ID" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input input-bordered w-full" placeholder="Admin password" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="select select-bordered w-full">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddAdminModal(false)}>Cancel</button>
              <button className="btn btn-primary">Add Admin</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export function AdminAddModal(){
  return <dialog id="addAdminModal" className="modal">
    <div className="modal-box">
      <h3 className="font-bold text-lg">Add New Admin</h3>
      <div className="py-2 space-y-2">
        <input id="adm_access" className="input input-bordered w-full" placeholder="Access Password" />
        <input id="adm_name" className="input input-bordered w-full" placeholder="Name" />
        <input id="adm_userid" className="input input-bordered w-full" placeholder="User ID" />
        <input id="adm_pass" className="input input-bordered w-full" placeholder="Password" />
      </div>
      <div className="modal-action">
        <form method="dialog">
          <button className="btn">Close</button>
        </form>
        <button className="btn btn-primary" id="adm_submit">Add</button>
      </div>
    </div>
  </dialog>
}


