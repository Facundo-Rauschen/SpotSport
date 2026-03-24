import * as Ubicacion from 'expo-location';
import { useState } from 'react';

export const useUbicacionUsuario = () => {
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [error, setError] = useState(null);

  const obtenerUbicacion = async () => {
    try {
      // 1. Verificar si el servicio de GPS está encendido en el equipo
      const habilitado = await Ubicacion.hasServicesEnabledAsync();
      if (!habilitado) {
        setError("El GPS está desactivado. Por favor, encendelo.");
        return;
      }

      // 2. Pedir permisos
      let { status } = await Ubicacion.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Permiso de ubicación denegado por el usuario.");
        return;
      }

      // 3. Obtener coordenadas (con timeout por seguridad)
      let localizacion = await Ubicacion.getCurrentPositionAsync({
        accuracy: Ubicacion.Accuracy.Balanced,
      });

      setUbicacionActual({
        latitude: localizacion.coords.latitude,
        longitude: localizacion.coords.longitude,
        // Estos deltas controlan qué tan "cerca" se ve el mapa al iniciar
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      
    } catch (e) {
      console.error("Error obteniendo ubicación:", e);
      setError("No se pudo obtener la ubicación actual.");
    }
  };

  return { ubicacionActual, obtenerUbicacion, error };
};