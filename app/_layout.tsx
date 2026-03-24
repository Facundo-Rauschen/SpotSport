import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider } from 'react-redux'; // 1. Importamos el Provider
import { contenedor } from '../src/store/store'; // 2. Importamos tu Store

// Importamos las funciones de DB y Sync
import { inicializarBaseDeDatos } from '../src/database/db';
import { seedFirebase } from '../src/services/seederFirebase';

export default function RootLayout() {
  useEffect(() => {
    // 1. Preparamos la estructura de 3 tablas en SQLite
    inicializarBaseDeDatos();

    // 2. Sincronización inicial
    (async () => {
      try {
        await seedFirebase();
      } catch (e) {
        console.log("No se pudo sincronizar en el arranque (Modo Offline)");
      }
    })();
  }, []);

  return (
    // 3. ENVOLVEMOS TODO EL STACK CON EL PROVIDER
    <Provider store={contenedor}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="(auth)" 
          options={{ animation: 'fade' }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ gestureEnabled: false }} 
        />
      </Stack>
    </Provider>
  );
}