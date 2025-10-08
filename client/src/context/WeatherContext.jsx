import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const WeatherContext = createContext({ condition: 'unknown', temperatureC: null })

export function WeatherProvider({ children }){
  const [state, setState] = useState({ condition: 'unknown', temperatureC: null })

  useEffect(()=>{
    let cancelled = false
    async function fetchWeather(lat, lon){
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,weathercode&timezone=auto`
        const { data } = await axios.get(url)
        const temp = data?.current?.temperature_2m
        const rain = data?.current?.rain || 0
        const precip = data?.current?.precipitation || 0
        const code = data?.current?.weathercode
        // Simplified weather logic: rain only for temp < 18°C, sunny otherwise
        const isRainy = temp < 18
        const condition = isRainy ? 'rainy' : 'sunny'
        if(!cancelled) setState({ condition, temperatureC: typeof temp==='number' ? Math.round(temp) : null })
      } catch {
        if(!cancelled) setState((s)=>({ ...s }))
      }
    }
    function onPos({ coords }){ fetchWeather(coords.latitude, coords.longitude) }
    function onErr(){
      // default to Kodai Kanal coords approx
      fetchWeather(10.2381, 77.4892)
    }
    if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(onPos, onErr, { timeout: 5000 }) }
    else onErr()
    return ()=>{ cancelled = true }
  },[])

  return (
    <WeatherContext.Provider value={state}>{children}</WeatherContext.Provider>
  )
}

export function useWeather(){
  return useContext(WeatherContext)
}



