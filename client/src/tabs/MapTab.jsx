import { useEffect, useRef, useState } from 'react'
import { walletAPI, showToast } from '../lib/api.js'
import AdPlaceholder from '../components/AdPlaceholder.jsx'

// Redesigned Map tab with header, mini preview, station cards, and legend

export default function MapTab(){
  const mapRef = useRef(null)
  const CENTER = [12.9406, 79.3211] // Annai Mira College exact

  useEffect(()=>{
    async function ensureLeaflet(){
      if(!window.L){
        await new Promise((res)=>{ const link=document.createElement('link'); link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link); link.onload=res })
        await new Promise((res)=>{ const script=document.createElement('script'); script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; document.body.appendChild(script); script.onload=res })
      }
    }
    let mapInstance
    ensureLeaflet().then(()=>{
      const L = window.L
      if(!mapRef.current) return
      // Prevent double-initialization in StrictMode or remounts
      if(mapRef.current._leaflet_id){
        // Already initialized; reuse existing map instance
        mapInstance = mapRef.current._leaflet_map
      } else {
        // Center at Annai Mira College, Ranipet (exact from shared link)
        mapInstance = L.map(mapRef.current).setView(CENTER, 17)
        // attach for reuse
        mapRef.current._leaflet_map = mapInstance
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(mapInstance)
        // Primary marker exactly at center
        L.marker(CENTER).addTo(mapInstance).bindPopup('<b>Annai Mira College</b><br/>Center point').openPopup()
      }
      // Ensure sizing after render
      setTimeout(()=> mapInstance && mapInstance.invalidateSize(), 200)
      // Sample Tamil Nadu locations - Annai Mira College (Ranipet) vicinity
      const locations = [
        { id: 1, name: 'Main Gate', subtitle: 'Annai Mira College Entrance', dist: '0.0 km', coords: CENTER, slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'borrowed'}] },
        { id: 2, name: 'Library Block', subtitle: 'Central Library', dist: '0.2 km', coords: [12.9396, 79.3198], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}] },
        { id: 3, name: 'Cafeteria', subtitle: 'Food Court Area', dist: '0.25 km', coords: [12.9410, 79.3190], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'drying'}] },
        { id: 4, name: 'Sports Ground', subtitle: 'Play Field Side', dist: '0.35 km', coords: [12.9392, 79.3220], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}] },
        { id: 5, name: 'Admin Block', subtitle: 'Front Office', dist: '0.18 km', coords: [12.9409, 79.3200], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}] },
        { id: 6, name: 'Parking Lot', subtitle: 'Visitor Parking', dist: '0.28 km', coords: [12.9398, 79.3216], slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'available'}] },
        { id: 7, name: 'Hostel Gate', subtitle: 'Student Hostel', dist: '0.45 km', coords: [12.9416, 79.3219], slots:[{label:'Slot A',status:'drying'},{label:'Slot B',status:'available'}] },
        { id: 8, name: 'Auditorium', subtitle: 'Event Hall', dist: '0.5 km', coords: [12.9402, 79.3187], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}] },
        { id: 9, name: 'Lab Complex', subtitle: 'Science Labs', dist: '0.32 km', coords: [12.9390, 79.3208], slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'available'}] },
        { id: 10, name: 'Play Court', subtitle: 'Indoor Sports', dist: '0.6 km', coords: [12.9418, 79.3198], slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}] }
      ]
      locations.forEach(loc=>{
        const hasAvailable = loc.slots.some(s=>s.status==='available')
        const hasDry = loc.slots.some(s=>s.status==='drying')
        const color = hasAvailable ? 'green' : hasDry ? 'orange' : 'red'
        const icon = L.divIcon({ className: 'custom-pin', html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px ${color}"></div>` })
        const marker = L.marker(loc.coords, { icon }).addTo(mapInstance)
        marker.bindPopup(`<div class="font-bold">${loc.name}</div>`) 
      })
    })
    return ()=>{
      try{
        const L = window.L
        if(L && mapRef.current && mapRef.current._leaflet_map){
          mapRef.current._leaflet_map.remove()
          delete mapRef.current._leaflet_map
        }
      }catch{}
    }
  },[])

  const [borrowed, setBorrowed] = useState(()=> Boolean(localStorage.getItem('borrowedUntil')))
  // Sync borrowed state with server to avoid stale local-only state
  useEffect(()=>{
    (async ()=>{
      try{
        const latest = await walletAPI.getBalance()
        if(latest?.currentBorrow?.active){
          const dueTs = new Date(latest.currentBorrow.dueAt || Date.now()).getTime()
          localStorage.setItem('borrowedUntil', String(dueTs))
          setBorrowed(true)
        } else {
          localStorage.removeItem('borrowedUntil')
          setBorrowed(false)
        }
      }catch{}
    })()
  },[])
  const stations = [
    { id:1, name:'Main Gate', subtitle:'Annai Mira College Entrance', dist:'0.1 km', slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'borrowed'}]},
    { id:2, name:'Library Block', subtitle:'Central Library', dist:'0.2 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}]},
    { id:3, name:'Cafeteria', subtitle:'Food Court Area', dist:'0.25 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'drying'}]},
    { id:4, name:'Sports Ground', subtitle:'Play Field Side', dist:'0.35 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}]},
    { id:5, name:'Admin Block', subtitle:'Front Office', dist:'0.18 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}]},
    { id:6, name:'Parking Lot', subtitle:'Visitor Parking', dist:'0.28 km', slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'available'}]},
    { id:7, name:'Hostel Gate', subtitle:'Student Hostel', dist:'0.45 km', slots:[{label:'Slot A',status:'drying'},{label:'Slot B',status:'available'}]},
    { id:8, name:'Auditorium', subtitle:'Event Hall', dist:'0.50 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}]},
    { id:9, name:'Lab Complex', subtitle:'Science Labs', dist:'0.32 km', slots:[{label:'Slot A',status:'borrowed'},{label:'Slot B',status:'available'}]},
    { id:10, name:'Play Court', subtitle:'Indoor Sports', dist:'0.60 km', slots:[{label:'Slot A',status:'available'},{label:'Slot B',status:'available'}]},
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="glass-strong rounded-2xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={()=>history.back()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="font-bold">Umbrella Stations</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={()=>location.reload()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path></svg>
        </button>
      </div>

      {/* Map container moved to the top */}
      <div className="glass-strong rounded-2xl p-3">
        <div className="text-xs opacity-70">Center: 12.940, 79.320 (Annai Mira College area)</div>
        <div className="w-full h-[60vh] rounded-xl overflow-hidden border mt-2" ref={mapRef}></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stations.map(s=>{
          const availableCount = s.slots.filter(sl=>sl.status==='available').length
          const canBorrow = availableCount>0 && !borrowed
          return (
            <div key={s.id} className="glass-strong rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{s.name}</div>
                  <div className="text-xs opacity-70">{s.subtitle}</div>
                  <div className="text-xs opacity-70">📍 {s.dist}</div>
                </div>
                <button className="btn btn-circle btn-ghost btn-xs">✈️</button>
              </div>
              <div className="mt-3 text-sm font-semibold">Umbrella Slots</div>
              <div className="flex gap-4 mt-2">
                {s.slots.map(sl=> (
                  <div key={sl.label} className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full grid place-items-center text-white ${sl.status==='available' ? 'bg-green-500' : sl.status==='borrowed' ? 'bg-red-500' : 'bg-yellow-400'}`}>☂️</span>
                    <div className="text-xs">
                      <div className="opacity-80">{sl.label}</div>
                      <div className={`${sl.status==='available' ? 'text-green-600' : sl.status==='borrowed' ? 'text-red-500' : 'text-yellow-500'}`}>{sl.status.charAt(0).toUpperCase()+sl.status.slice(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-3 text-sm ${availableCount>0 ? 'text-green-600' : 'text-red-500'}`}>{availableCount} available</div>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn btn-primary btn-sm" disabled={!canBorrow} onClick={async ()=>{
                  try{
                    const resp = await walletAPI.borrow(String(s.id), s.name)
                    const dueTs = new Date(resp.currentBorrow?.dueAt || Date.now()+2*60*60*1000).getTime()
                    localStorage.setItem('borrowedUntil', String(dueTs))
                    setBorrowed(true)
                    showToast('Borrow started. Timer will appear on Home.', 'success')
                  }catch(err){
                    const status = err?.response?.status
                    const msg = err?.response?.data?.error
                    if(status===409){
                      showToast(msg || 'You already have an active borrow. Return from Home tab.', 'error')
                    } else if(status===402){
                      showToast(msg || 'Insufficient balance (need 50 coins).', 'error')
                    } else {
                      showToast(msg || 'Borrow failed', 'error')
                    }
                  }
                }}>Borrow from here</button>
                {borrowed && <span className="badge badge-warning">Borrow active</span>}
              </div>
            </div>
          )
        })}
      </div>

      <AdPlaceholder />

      <div className="glass-strong rounded-2xl p-3 text-sm">
        <div className="font-semibold mb-2">Status Legend</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Available</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Borrowed</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Drying</div>
        </div>
      </div>

      <AdPlaceholder />
    </div>
  )
}


