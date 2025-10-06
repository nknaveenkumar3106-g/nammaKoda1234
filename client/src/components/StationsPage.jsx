import { useState } from 'react'

export default function StationsPage(){
  const [stations, setStations] = useState([
    { id: 1, name: 'Main Gate', location: 'Annai Mira College Entrance', status: 'online', umbrellas: { total: 10, available: 6, borrowed: 3, maintenance: 1 }, lastUpdate: '2 min ago', coordinates: [12.9406, 79.3211] },
    { id: 2, name: 'Library Block', location: 'Central Library', status: 'online', umbrellas: { total: 8, available: 5, borrowed: 2, maintenance: 1 }, lastUpdate: '1 min ago', coordinates: [12.9396, 79.3198] },
    { id: 3, name: 'Cafeteria', location: 'Food Court Area', status: 'offline', umbrellas: { total: 12, available: 0, borrowed: 0, maintenance: 0 }, lastUpdate: '15 min ago', coordinates: [12.9410, 79.3190] },
    { id: 4, name: 'Sports Ground', location: 'Play Field Side', status: 'online', umbrellas: { total: 6, available: 4, borrowed: 2, maintenance: 0 }, lastUpdate: '3 min ago', coordinates: [12.9392, 79.3220] },
    { id: 5, name: 'Admin Block', location: 'Front Office', status: 'online', umbrellas: { total: 8, available: 7, borrowed: 1, maintenance: 0 }, lastUpdate: '1 min ago', coordinates: [12.9409, 79.3200] }
  ])
  const [selectedStation, setSelectedStation] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStation, setNewStation] = useState({ name: '', location: '', totalUmbrellas: 8 })

  const toggleStationStatus = (stationId) => {
    setStations(stations.map(station => 
      station.id === stationId 
        ? { ...station, status: station.status === 'online' ? 'offline' : 'online' }
        : station
    ))
  }

  const addStation = () => {
    const station = {
      id: stations.length + 1,
      name: newStation.name,
      location: newStation.location,
      status: 'online',
      umbrellas: { total: newStation.totalUmbrellas, available: newStation.totalUmbrellas, borrowed: 0, maintenance: 0 },
      lastUpdate: 'Just now',
      coordinates: [12.9406 + Math.random() * 0.01, 79.3211 + Math.random() * 0.01]
    }
    setStations([...stations, station])
    setNewStation({ name: '', location: '', totalUmbrellas: 8 })
    setShowAddModal(false)
  }

  const removeStation = (stationId) => {
    setStations(stations.filter(station => station.id !== stationId))
  }

  const lockUnlockUmbrella = (stationId, action) => {
    alert(`${action} umbrella at ${stations.find(s => s.id === stationId)?.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Station Management</h1>
          <p className="text-base-content/70 mt-1">Monitor and control umbrella stations</p>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Stations</div>
            <div className="stat-value text-primary">{stations.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Online</div>
            <div className="stat-value text-success">{stations.filter(s => s.status === 'online').length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Offline</div>
            <div className="stat-value text-error">{stations.filter(s => s.status === 'offline').length}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Station
        </button>
        <button className="btn btn-secondary">Export Data</button>
        <button className="btn btn-accent">Generate Report</button>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map(station => (
          <div key={station.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">{station.name}</h3>
                <div className={`badge ${station.status === 'online' ? 'badge-success' : 'badge-error'} gap-2`}>
                  <div className={`w-2 h-2 rounded-full ${station.status === 'online' ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
                  {station.status}
                </div>
              </div>
              
              <p className="text-sm text-base-content/70 mb-4">{station.location}</p>
              
              {/* Umbrella Status */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Available</div>
                  <div className="stat-value text-lg text-success">{station.umbrellas.available}</div>
                </div>
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Borrowed</div>
                  <div className="stat-value text-lg text-warning">{station.umbrellas.borrowed}</div>
                </div>
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Maintenance</div>
                  <div className="stat-value text-lg text-error">{station.umbrellas.maintenance}</div>
                </div>
                <div className="stat bg-base-200 rounded p-2">
                  <div className="stat-title text-xs">Total</div>
                  <div className="stat-value text-lg text-primary">{station.umbrellas.total}</div>
                </div>
              </div>

              <div className="text-xs text-base-content/50 mb-4">
                Last update: {station.lastUpdate}
              </div>

              {/* Action Buttons */}
              <div className="card-actions justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => setSelectedStation(station)}
                  >
                    Details
                  </button>
                  <button 
                    className={`btn btn-sm ${station.status === 'online' ? 'btn-error' : 'btn-success'}`}
                    onClick={() => toggleStationStatus(station.id)}
                  >
                    {station.status === 'online' ? 'Offline' : 'Online'}
                  </button>
                </div>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">⋮</div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    <li><a onClick={() => lockUnlockUmbrella(station.id, 'Lock')}>Lock All</a></li>
                    <li><a onClick={() => lockUnlockUmbrella(station.id, 'Unlock')}>Unlock All</a></li>
                    <li><a>Send Alert</a></li>
                    <li><a onClick={() => removeStation(station.id)} className="text-error">Remove Station</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Station</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Station Name</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={newStation.name}
                  onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                  placeholder="e.g., Main Gate"
                />
              </div>
              
              <div>
                <label className="label">Location</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={newStation.location}
                  onChange={(e) => setNewStation({...newStation, location: e.target.value})}
                  placeholder="e.g., College Entrance"
                />
              </div>
              
              <div>
                <label className="label">Number of Umbrellas</label>
                <input 
                  type="number" 
                  className="input input-bordered w-full" 
                  value={newStation.totalUmbrellas}
                  onChange={(e) => setNewStation({...newStation, totalUmbrellas: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addStation}>Add Station</button>
            </div>
          </div>
        </dialog>
      )}

      {/* Station Detail Modal */}
      {selectedStation && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">Station Details - {selectedStation.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div><strong>Location:</strong> {selectedStation.location}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 badge ${selectedStation.status === 'online' ? 'badge-success' : 'badge-error'}`}>
                    {selectedStation.status}
                  </span>
                </div>
                <div><strong>Last Update:</strong> {selectedStation.lastUpdate}</div>
                <div><strong>Coordinates:</strong> {selectedStation.coordinates.join(', ')}</div>
              </div>
              
              <div className="space-y-4">
                <div><strong>Total Umbrellas:</strong> {selectedStation.umbrellas.total}</div>
                <div><strong>Available:</strong> <span className="text-success">{selectedStation.umbrellas.available}</span></div>
                <div><strong>Borrowed:</strong> <span className="text-warning">{selectedStation.umbrellas.borrowed}</span></div>
                <div><strong>In Maintenance:</strong> <span className="text-error">{selectedStation.umbrellas.maintenance}</span></div>
              </div>
            </div>

            <div className="divider">Recent Activity</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Umbrella borrowed by Rajesh Kumar</span>
                <span className="text-sm text-base-content/70">2 min ago</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Umbrella returned by Priya Sharma</span>
                <span className="text-sm text-base-content/70">5 min ago</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span>Maintenance completed on Umbrella #3</span>
                <span className="text-sm text-base-content/70">1 hour ago</span>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedStation(null)}>Close</button>
              <button className="btn btn-warning">Send Alert</button>
              <button className="btn btn-primary">Edit Station</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

