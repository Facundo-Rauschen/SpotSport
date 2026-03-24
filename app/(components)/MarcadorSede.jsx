import { Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { styles } from '../../src/styles/marcadorSedeStyles';


const MarcadorSede = ({ sede, alPresionar }) => {
  const esFavorito = sede.es_favorito === 1;

  return (
    <Marker
      key={sede.id.toString()}
      coordinate={{
        latitude: Number(sede.lat),
        longitude: Number(sede.lng)
      }}
      // Usamos el pin por defecto de Google/Apple Maps
      // Cambiamos el color: Dorado para favoritos, Rojo para el resto
      pinColor={esFavorito ? "#F1C40F" : "#E74C3C"}
    >
      {/* El Callout sigue siendo necesario para interactuar */}
      <Callout onPress={() => alPresionar(sede)}>
        <View style={styles.globo}>
          <Text style={styles.titulo}>{sede.nombre}</Text>
          <Text style={styles.subtitulo}>{sede.direccion}</Text>
          <Text style={styles.accion}>Toca para reservar</Text>
        </View>
      </Callout>
    </Marker>
  );
};

export default MarcadorSede;