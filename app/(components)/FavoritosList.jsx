import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux'; // Hook para leer de Redux
import { styles } from '../../src/styles/favoritosStyles';

export default function ListaFavoritos({ onSedePress }) {
  // Obtenemos los favoritos directamente desde el estado global (Redux)
  // 'favoritos' es el nombre que le pusimos en el contenedor.js
  // 'lista' es el array que definimos en favoritosSlice.js
  const sedesFavoritas = useSelector((state) => state.favoritos.lista);

  // Si no hay favoritos, no renderizamos nada
  if (!sedesFavoritas || sedesFavoritas.length === 0) return null;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Tus Sedes Favoritas</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contenidoScroll}
      >
        {sedesFavoritas.map((sede) => (
          <TouchableOpacity 
            key={sede.id.toString()} 
            style={styles.tarjeta}
            onPress={() => onSedePress(sede)}
            activeOpacity={0.7}
          >
            <View style={styles.circuloIcono}>
               <Text style={{fontSize: 18}}>⭐</Text> 
            </View>
            <Text style={styles.nombre} numberOfLines={1}>{sede.nombre}</Text>
            <Text style={styles.direccion} numberOfLines={1}>{sede.direccion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
