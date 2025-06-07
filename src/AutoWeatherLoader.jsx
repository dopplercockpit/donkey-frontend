// 📦 AUTO LOADER: Trigger on app load to fetch local weather without prompt input
import { useEffect, useState } from 'react';

export default function AutoWeatherLoader({ setAutoWeatherResult }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAutoWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Use the same base URL logic as the rest of the app
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        
        const response = await fetch(`${baseURL}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "Hey Mister Donkey, what's the weather right now where I am?",
            location: { lat, lon },
            auto: true
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Check if the result contains an error
        if (result.error) {
          throw new Error(result.error);
        }

        setAutoWeatherResult(result);
        console.log('🐴 Auto weather loaded successfully:', result);
        
      } catch (err) {
        console.error('🐴 Auto loader failed:', err);
        
        // Provide user-friendly error messages
        let errorMessage = "Donkey couldn't sniff your location right now. Try typing instead.";
        
        if (err.code === 1) { // PERMISSION_DENIED
          errorMessage = "Mister Donkey can't find your ass... location. Allow access!";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = "Your location is playing hide and seek. Try typing your city.";
        } else if (err.code === 3) { // TIMEOUT
          errorMessage = "Location lookup timed out. The donkey got distracted by carrots.";
        } else if (err.message.includes('HTTP')) {
          errorMessage = "Donkey's backend threw a hoof. Server might be napping.";
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Start the auto-loading process
    loadAutoWeather();
  }, [setAutoWeatherResult]);

  // Render loading state
  if (loading) {
    return (
      <div className="auto-loader-status" style={{ 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        color: '#666',
        margin: '0.5rem 0'
      }}>
        🐴 Sniffing the air...
      </div>
    );
  }

  // Render error state (if any)
  if (error) {
    return (
      <div className="auto-loader-error" style={{ 
        color: '#d32f2f', 
        fontWeight: 'bold', 
        fontSize: '0.9rem', 
        margin: '0.5rem 0',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  // Return null when successful (no visible component needed)
  return null;
}