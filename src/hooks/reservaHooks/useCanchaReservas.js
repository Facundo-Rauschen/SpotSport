import { useEffect, useState } from 'react';
import { obtenerReservasPorCanchaFirebase } from '../../services/reservaService';

export const useCanchaReservas = (visible, canchaSeleccionada) => {
  const [reservasFirebase, setReservasFirebase] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  useEffect(() => {
    if (visible && canchaSeleccionada) {
      const cargarReservas = async () => {
        setEstaCargando(true);
        try {
          const data = await obtenerReservasPorCanchaFirebase(String(canchaSeleccionada));
          setReservasFirebase(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("❌ Error cargando reservas:", error);
        } finally {
          setEstaCargando(false);
        }
      };
      cargarReservas();
    }
  }, [canchaSeleccionada, visible]);

  const calcularIntervalos = (canchaId) => {
    const ahora = new Date();
    const hoyStringLocal = ahora.toISOString().split('T')[0];
    
    // Procesar ocupados
    const ocupados = reservasFirebase
      .filter(r => String(r.cancha_id || r.canchaId) === String(canchaId) && r.inicio?.includes(hoyStringLocal))
      .map(r => ({
        inicio: r.inicio.split('T')[1]?.substring(0, 5),
        fin: r.fin.split('T')[1]?.substring(0, 5)
      }));

    const tiempoActualEnMinutos = (ahora.getHours() * 60) + ahora.getMinutes();
    const intervalos = [];

    for (let h = 8; h <= 22; h += 0.5) {
      const hora = Math.floor(h);
      const min = (h % 1 === 0) ? 0 : 30;
      const horaStr = `${hora.toString().padStart(2, '0')}:${min === 0 ? "00" : "30"}`;
      const tiempoTurnoEnMinutos = (hora * 60) + min;

      // Filtro de limpieza: si ya pasó, no se muestra
      if (tiempoTurnoEnMinutos >= tiempoActualEnMinutos) {
        const estaOcupado = ocupados.some(r => horaStr >= r.inicio && horaStr < r.fin);
        intervalos.push({ hora: horaStr, disponible: !estaOcupado });
      }
    }
    return intervalos;
  };

  return { reservasFirebase, setReservasFirebase, estaCargando, calcularIntervalos };
};