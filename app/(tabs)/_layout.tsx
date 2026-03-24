import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#E74C3C', 
        tabBarInactiveTintColor: '#95A5A6', // Agregamos color inactivo para visibilidad
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 65, // Un poco más de altura para comodidad
          paddingBottom: 10,
          paddingTop: 5
        }
      }}
    >
      <Tabs.Screen
        name="mapa" 
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservasYFavoritos" 
        options={{
          title: 'Turnos', // Título más corto para que no se encime en móviles chicos
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuraciones" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}