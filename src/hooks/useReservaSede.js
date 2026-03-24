import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  useCanchaReservas,
  useReservaAction,
  useSedeDetails
} from './reservaHooks'; // Asegurate de tener el index.js en esa carpeta

export const useReservaSede = (visible, sede, onClose) => {
  // --- ESTADOS DE UI ---
  const [deporte, setDeporte] = useState('Fútbol');
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [duracion, setDuracion] = useState(60);

  // --- COMPOSICIÓN DE LOGICA (Sub-Hooks) ---
  
  // 1. Gestión de Sede y Favoritos
  const { canchasSede, esFavorito, alternarFavorito } = useSedeDetails(visible, sede);

  // 2. Gestión de Horarios y Reservas de Firebase
  const { 
    reservasFirebase, 
    setReservasFirebase, 
    estaCargando, 
    calcularIntervalos 
  } = useCanchaReservas(visible, canchaSeleccionada);

  // 3. Acciones de Escritura (Crear/Cancelar)
  const { 
    estaReservando, 
    ejecutarReserva, 
    ejecutarCancelacion 
  } = useReservaAction(sede, setReservasFirebase);

  // --- EFECTOS ---

  // Limpiar selección cuando cambia la sede o se abre/cierra el modal
  useEffect(() => {
    if (visible) {
      setCanchaSeleccionada(null);
      setHoraInicio(null);
      setDuracion(60);
    }
  }, [sede, visible]);

  // --- MANEJADORES DE EVENTOS ---

  const manejarReserva = async () => {
    // Validaciones previas antes de disparar la acción
    if (!canchaSeleccionada) {
      Alert.alert("Atención", "Por favor, selecciona una cancha.");
      return;
    }
    if (!horaInicio) {
      Alert.alert("Atención", "Por favor, selecciona un horario.");
      return;
    }

    const res = await ejecutarReserva(canchaSeleccionada, horaInicio, duracion, deporte);

    if (res.success) {
      // Buscamos el nombre de la cancha para un mensaje más personalizado
      const nombreCancha = canchasSede.find(c => String(c.id) === String(canchaSeleccionada))?.nombre || 'la cancha';
      
      Alert.alert(
        "¡Reserva Exitosa!",
        `Tu turno en ${nombreCancha} (${sede.nombre}) para las ${horaInicio}hs ha sido confirmado.`,
        [{ 
          text: "Excelente", 
          onPress: () => {
            if (onClose) onClose(); // Cerramos el modal
          } 
        }]
      );
    }
    // El 'else' no es necesario porque useReservaAction ya dispara su propio Alert en caso de error técnico.
  };

  // --- RETORNO DE INTERFAZ ---
  return {
    // Estados
    deporte,
    setDeporte,
    canchasSede,
    canchaSeleccionada,
    setCanchaSeleccionada,
    horaInicio,
    setHoraInicio,
    duracion,
    setDuracion,
    estaCargando,
    estaReservando,
    esFavorito,
    
    // Funciones
    alternarFavorito,
    calcularIntervalos,
    ejecutarReserva: manejarReserva, // Exportamos la versión con Alert y cierre
    ejecutarCancelacion
  };
};