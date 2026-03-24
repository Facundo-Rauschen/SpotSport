import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { db, obtenerMisReservasLocal } from '../../database/db';
import { cancelarReservaFirebase, crearReservaSegura } from '../../services/reservaService';
import { eliminarReservaRedux, setReservas } from '../../store/reservasSlice';

export const useReservaAction = (sede, setReservasFirebase) => {
  const dispatch = useDispatch();
  const auth = getAuth();
  const [estaReservando, setEstaReservando] = useState(false);

  const ejecutarReserva = async (canchaId, horaInicio, duracion, deporte) => {
    if (!canchaId || !horaInicio) return { success: false, message: "Faltan datos" };
    
    setEstaReservando(true);
    try {
      const hoyString = new Date().toISOString().split('T')[0];
      const fechaInicioStr = `${hoyString}T${horaInicio}`;
      
      // Cálculo de fin usando local ISO para evitar desfases
      const fechaFinObj = new Date(new Date(fechaInicioStr).getTime() + duracion * 60000);
      const fechaFinStr = fechaFinObj.toLocaleString('sv-SE').replace(' ', 'T').substring(0, 16);

      const nuevaReserva = {
        id: Date.now().toString(),
        cancha_id: String(canchaId),
        user_id: auth.currentUser.uid,
        inicio: fechaInicioStr,
        fin: fechaFinStr,
        estado: 'confirmado',
        nombre_sede: sede.nombre || 'Sede',
        deporte: deporte,
        duracion: Number(duracion)
      };

      const res = await crearReservaSegura(nuevaReserva);
      if (!res.success) throw new Error(res.message);

      // Actualizar estados
      setReservasFirebase(prev => [...prev, { ...nuevaReserva, id: res.id }]);
      db.runSync(
        'INSERT INTO reservas (id, cancha_id, user_id, inicio, fin, estado) VALUES (?, ?, ?, ?, ?, ?)',
        [nuevaReserva.id, nuevaReserva.cancha_id, nuevaReserva.user_id, fechaInicioStr, fechaFinStr, 'confirmado']
      );
      
      const locales = obtenerMisReservasLocal();
      dispatch(setReservas([...locales].sort((a, b) => a.inicio.localeCompare(b.inicio))));
      
      return { success: true };
    } catch (error) {
      Alert.alert("Error", error.message);
      return { success: false };
    } finally {
      setEstaReservando(false);
    }
  };

  const ejecutarCancelacion = (reservaId) => {
    Alert.alert("Cancelar Turno", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelarReservaFirebase(reservaId);
            db.runSync('DELETE FROM reservas WHERE id = ?', [String(reservaId)]);
            dispatch(eliminarReservaRedux(reservaId));
            setReservasFirebase(prev => prev.filter(r => r.id !== reservaId));
          } catch (e) {
            Alert.alert("Error", "No se pudo cancelar.");
          }
        }
      }
    ]);
  };

  return { estaReservando, ejecutarReserva, ejecutarCancelacion };
};