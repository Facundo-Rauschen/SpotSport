import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  remove,
  set
} from 'firebase/database';
import { database } from './firebaseConfig';

/**
 * Obtiene las reservas de una cancha específica desde Realtime Database
 */
export const obtenerReservasPorCanchaFirebase = async (canchaId) => {
  try {
    const reservasRef = ref(database, 'reservas');
    
    // IMPORTANTE: Si tus IDs de cancha en Firebase son Strings, quita el Number()
    // Si son números, mantenlo. Generalmente en SQLite son Strings.
    const consulta = query(
      reservasRef, 
      orderByChild('cancha_id'), 
      equalTo(canchaId) 
    );

    const snapshot = await get(consulta);

    if (snapshot.exists()) {
      const reservas = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        reservas.push({
          id: childSnapshot.key,
          ...data
        });
      });
      return reservas;
    } 
    return [];
  } catch (error) {
    console.error("❌ Error al obtener reservas desde Realtime:", error);
    return [];
  }
};

/**
 * Lógica para verificar si un horario choca con otro existente
 */
export const verificarSolapamiento = (inicioNuevo, finNuevo, reservasExistentes) => {
  const A = new Date(inicioNuevo).getTime();
  const B = new Date(finNuevo).getTime();

  const choque = reservasExistentes.find(reserva => {
    // Si la reserva está cancelada, no debería bloquear el horario
    if (reserva.estado === 'cancelado') return false;

    const C = new Date(reserva.inicio).getTime();
    const D = new Date(reserva.fin).getTime();
    
    // Fórmula de solapamiento: (InicioA < FinB) y (InicioB < FinA)
    return A < D && C < B;
  });

  return !!choque;
};

/**
 * Crea una reserva con ID único (push) y validación de choque
 */
import { limitToLast, orderByKey } from 'firebase/database';

export const crearReservaSegura = async (nuevaReserva) => {
  console.log("🚀 Iniciando crearReservaSegura con datos:", nuevaReserva);

  try {
    const reservasRef = ref(database, 'reservas');
    
    // 1. Buscamos el último ID
    console.log("--- PASO 1: Buscando último ID en /reservas ---");
    const consultaUltimo = query(reservasRef, orderByKey(), limitToLast(1));
    const snapshot = await get(consultaUltimo);
    
    let nuevoId = 1;
    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data).map(Number).filter(n => !isNaN(n));
      console.log("IDs encontrados en Firebase:", keys);
      if (keys.length > 0) {
        nuevoId = Math.max(...keys) + 1;
      }
    }
    console.log("📌 ID asignado para la nueva reserva:", nuevoId);

    // 2. Verificación de solapamiento
    console.log("--- PASO 2: Verificando solapamiento para cancha:", nuevaReserva.cancha_id);
    const existentes = await obtenerReservasPorCanchaFirebase(nuevaReserva.cancha_id);
    console.log(`Reservas existentes encontradas (${existentes.length}):`, existentes);

    const hayChoque = verificarSolapamiento(nuevaReserva.inicio, nuevaReserva.fin, existentes);
    if (hayChoque) {
      console.warn("⚠️ Choque de horarios detectado. Cancelando operación.");
      return { success: false, message: "Este horario se superpone con otro, por favor elegir otro horario." };
    }

    // 3. Preparación del objeto
    const reservaParaGuardar = {
      user_id: nuevaReserva.user_id || nuevaReserva.userId,
      cancha_id: nuevaReserva.cancha_id,
      nombre_sede: nuevaReserva.nombre_sede,
      deporte: nuevaReserva.deporte,
      inicio: nuevaReserva.inicio,
      fin: nuevaReserva.fin,
      duracion: nuevaReserva.duracion,
      estado: 'confirmado'
    };

    // Validar si campos críticos son undefined (Firebase lanzará error si lo son)
    console.log("--- PASO 3: Objeto final a guardar:", reservaParaGuardar);
    if (!reservaParaGuardar.user_id) console.error("❌ ERROR: user_id es undefined");
    if (!reservaParaGuardar.inicio) console.error("❌ ERROR: inicio es undefined");

    // 4. Intento de escritura
    console.log("--- PASO 4: Escribiendo en Firebase... ---");
    await set(ref(database, `reservas/${nuevoId}`), reservaParaGuardar);
    
    console.log("✅ RESERVA EXITOSA. ID:", nuevoId);
    return { success: true, id: nuevoId };

  } catch (error) {
    console.error("❌ ERROR CRÍTICO en crearReservaSegura:");
    console.error("Mensaje:", error.message);
    if (error.message.includes("PERMISSION_DENIED")) {
      console.error("👉 Causa probable: Tus reglas de Firebase requieren Auth y el usuario no está logueado.");
    }
    return { success: false, message: "Error de conexión con el servidor." };
  }
};

/**
 * Cancela una reserva eliminándola de Realtime Database
 */
export const cancelarReservaFirebase = async (reservaId) => {
  try {
    if (!reservaId) {
      console.error("❌ No se recibió reservaId para cancelar");
      return { success: false, message: "ID no válido" };
    }

    const reservaRef = ref(database, `reservas/${reservaId}`);
    
    // remove() es la forma modular de eliminar un nodo
    await remove(reservaRef);

    console.log(`✅ Reserva ${reservaId} cancelada exitosamente.`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al cancelar en Realtime:", error);
    return { success: false, message: error.message };
  }
};