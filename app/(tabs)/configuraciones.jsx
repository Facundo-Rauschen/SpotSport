import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { OptionItem } from '../(components)/OptionItem';
import { useConfig } from '../../src/hooks/useConfig';
import { styles } from '../../src/styles/configStyles';

export default function SettingsScreen() {
  const router = useRouter();
  const { imagenPerfil, userEmail, seleccionarImagen, eliminarImagenPerfil, handleSignOut } = useConfig(router);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          
          {/* Círculo de Avatar y Foto */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => Alert.alert("Foto", "Elegí una opción", [
              { text: "Cámara", onPress: () => seleccionarImagen('camera') },
              { text: "Galería", onPress: () => seleccionarImagen('library') },
              { text: "Cancelar", style: "cancel" }
            ])}
          >
            <View style={styles.avatar}>
              {imagenPerfil ? (
                <Image source={{ uri: imagenPerfil }} style={styles.foto} />
              ) : (
                <Text style={styles.avatarText}>{userEmail?.[0]?.toUpperCase()}</Text>
              )}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* El tachito rojo: Solo si imagenPerfil NO es null */}
          {imagenPerfil && (
            <TouchableOpacity style={styles.deleteIconBadge} onPress={eliminarImagenPerfil}>
              <Ionicons name="trash" size={16} color="#FFF" />
            </TouchableOpacity>
          )}

        </View>

        <Text style={styles.userName}>Mi Cuenta</Text>
        <Text style={styles.userTag}>{userEmail}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Soporte</Text>
        <OptionItem icon="chatbubbles-outline" title="Soporte" onPress={() => Linking.openURL('mailto:soporte@spotsport.com')} />
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Cuenta</Text>
        <OptionItem icon="log-out-outline" title="Cerrar Sesión" onPress={handleSignOut} isDestructive />
      </View>
      <Text style={styles.footerText}>SpotSport v1.0.2</Text>
    </ScrollView>
  );
}