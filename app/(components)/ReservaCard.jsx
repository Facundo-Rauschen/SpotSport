import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../src/styles/reservaSedeStyles';


export default function ReservaCard({ item, onCancelar }) { // <--- Recibimos onCancelar
  if (!item) return null;

  // Formateo de Inicio
  const fechaInicio = new Date(item.inicio);
  const fechaLegible = fechaInicio.toLocaleDateString('es-AR');
  const horaInicio = fechaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Formateo de Fin
  const fechaFin = new Date(item.fin);
  const horaFin = fechaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.tarjeta}>
      <View style={styles.info}>
        <View style={styles.headerFila}>
          <Text style={styles.sede} numberOfLines={1}>
            {item.nombre_sede || 'Sede desconocida'}
          </Text>
          {/* Badge de Deporte */}
          <View style={styles.badgeDeporte}>
             <Text style={styles.textoDeporte}>{item.deporte}</Text>
          </View>
        </View>
        
        <View style={styles.fila}>
          <Ionicons name="calendar-outline" size={14} color="#7F8C8D" />
          <Text style={styles.detalle}>{fechaLegible}</Text>
          
          <Ionicons name="time-outline" size={14} color="#7F8C8D" style={{ marginLeft: 10 }} />
          <Text style={styles.detalle}>{horaInicio} - {horaFin} hs</Text>
        </View>

        <View style={styles.contenedorEstado}>
          <View style={[styles.puntoEstado, { backgroundColor: item.estado === 'confirmado' ? '#27AE60' : '#E74C3C' }]} />
          <Text style={[styles.textoEstado, { color: item.estado === 'confirmado' ? '#27AE60' : '#E74C3C' }]}>
            {item.estado?.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {/* BOTÓN DE CANCELAR */}
      <TouchableOpacity 
        style={styles.botonEliminar} 
        onPress={() => onCancelar(item.id)} // <--- Ejecutamos la función del hook
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
        <Text style={styles.labelEliminar}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

