import { useState, useRef, useCallback } from 'react';
import riderService from '../services/rider.service.js';
import toast from 'react-hot-toast';

const POST_INTERVAL_MS = 5000;

const useLocation = () => {
  const [isTracking,    setIsTracking]    = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [error,         setError]         = useState('');

  const watchIdRef      = useRef(null);
  const lastPostTimeRef = useRef(0);

  const postLocation = useCallback(async (lat, lng) => {
    const now = Date.now();
    if (now - lastPostTimeRef.current < POST_INTERVAL_MS) return;
    lastPostTimeRef.current = now;

    try {
      // Now calls /api/rider/location instead of /api/location/update
      await riderService.updateLocation({ lat, lng });
    } catch (err) {
      console.error('Failed to post location:', err.message);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      toast.error('Geolocation not supported');
      return;
    }

    setError('');
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCurrentCoords({ lat, lng });
        postLocation(lat, lng);
      },
      (err) => {
        console.error('Geolocation error:', err.message);
        setError(err.message);
        toast.error('Location error: ' + err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout:            10000,
        maximumAge:         0,
      }
    );
  }, [postLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentCoords(null);
  }, []);

  return {
    isTracking,
    currentCoords,
    error,
    startTracking,
    stopTracking,
  };
};

export default useLocation;