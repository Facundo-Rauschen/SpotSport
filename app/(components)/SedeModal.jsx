import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useReservaSede } from '../../src/hooks/useReservaSede.js';
import { styles } from '../../src/styles/sedeModalStyles.js';


export default function DetalleSedeModal({ visible, onClose, sede, onDataChange }) {

  const {
    deporte, setDeporte, canchasSede, canchaSeleccionada, setCanchaSeleccionada,
    horaInicio, setHoraInicio, duracion, setDuracion, estaCargando, estaReservando,
    esFavorito, alternarFavorito, calcularIntervalos, ejecutarReserva
  } = useReservaSede(visible, sede, onClose);

  // Función corregida para manejar la respuesta del hook
  const manejarConfirmacionReserva = async () => {
    try {
      const resultado = await ejecutarReserva();
      
      if (resultado?.success) {
        Alert.alert("¡Éxito!", "Tu reserva ha sido confirmada correctamente.");
        if (onDataChange) onDataChange(); // Notifica a la pantalla padre para recargar la lista
        onClose(); // Cierra el modal solo si salió bien
      } else if (resultado?.message) {
        Alert.alert("No se pudo reservar", resultado.message);
      }
    } catch (error) {
      console.error("Error en manejarConfirmacionReserva:", error);
      Alert.alert("Error", "Ocurrió un problema inesperado al procesar la reserva.");
    }
  };

  if (!visible || !sede?.id) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.capaFondo}>
        <View style={styles.contenidoModal}>
          <View style={styles.indicadorArrastre} />
          
          {/* Encabezado con Favorito */}
          <View style={styles.encabezado}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.tituloSede}>{sede.nombre}</Text>
                <TouchableOpacity onPress={alternarFavorito} style={styles.botonFavorito}>
                  <Ionicons 
                    name={esFavorito ? "star" : "star-outline"} 
                    size={24} 
                    color={esFavorito ? "#F1C40F" : "#BDC3C7"} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitulo}>{sede.direccion}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.botonCerrar}>
              <Ionicons name="close" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          </View>

          {/* Selector de Deporte */}
          <View style={styles.barraNavegacion}>
            {['Fútbol', 'Padel', 'Voley'].map((item) => (
              <Pressable 
                key={item} 
                onPress={() => { setDeporte(item); setCanchaSeleccionada(null); }}
                style={[styles.itemNav, deporte === item && styles.itemNavActivo]}
              >
                <Text style={[styles.textoNav, deporte === item && styles.textoNavActivo]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {/* Listado de Canchas y Horarios */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
            {canchasSede.filter(c => c.deporte === deporte).map((cancha) => (
              <View key={cancha.id} style={styles.envolturaCancha}>
                <TouchableOpacity 
                  onPress={() => setCanchaSeleccionada(cancha.id === canchaSeleccionada ? null : cancha.id)}
                  style={[styles.tarjetaCancha, canchaSeleccionada === cancha.id && styles.tarjetaCanchaActiva]}>
                  <View style={styles.infoCancha}>
                    <Text style={styles.nombreCancha}>{cancha.nombre_cancha}</Text>
                    <Text style={styles.precioCancha}>${cancha.precio_media_hora} <Text style={{fontWeight: 'normal'}}>x 30 min</Text></Text>
                  </View>
                  <Ionicons name={canchaSeleccionada === cancha.id ? "chevron-up" : "chevron-down"} size={20} color="#BDC3C7" />
                </TouchableOpacity>

                {canchaSeleccionada === cancha.id && (
                  <View style={styles.seccionHorarios}>
                    <Text style={styles.etiquetaSeccion}>Horarios disponibles</Text>
                    {estaCargando ? <ActivityIndicator size="small" color="#E74C3C" /> : (
                      <View style={styles.cuadriculaHorarios}>
                        {calcularIntervalos(cancha.id).map((item) => (
                          <TouchableOpacity 
                            key={item.hora} 
                            disabled={!item.disponible} 
                            onPress={() => setHoraInicio(item.hora)}
                            style={[
                              styles.celdaHora, 
                              !item.disponible ? styles.horaOcupada : (horaInicio === item.hora ? styles.horaSeleccionada : styles.horaLibre)
                            ]}
                          >
                            <Text style={[
                              styles.textoHora, 
                              !item.disponible && { color: '#A93226' }, 
                              horaInicio === item.hora && { color: '#FFF' }
                            ]}>
                              {item.hora}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Pie de Confirmación */}
          {horaInicio && (
            <View style={styles.pieConfirmacion}>
              <Text style={styles.etiquetaPie}>Duración del turno</Text>
              <View style={styles.contenedorDuracion}>
                {[60, 90, 120].map((m) => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.chipDuracion, duracion === m && styles.chipDuracionActivo]} 
                    onPress={() => setDuracion(m)}
                  >
                    <Text style={[styles.textoDuracion, duracion === m && styles.textoDuracionActivo]}>{m/60}h</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={[styles.btnReservar, estaReservando && { opacity: 0.7 }]} 
                onPress={manejarConfirmacionReserva} 
                disabled={estaReservando}
              >
                {estaReservando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.textoBtnReservar}>Confirmar {horaInicio} hs</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
