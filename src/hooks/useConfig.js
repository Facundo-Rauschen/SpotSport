import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react'; // Importación limpia en una sola línea
import { Alert } from 'react-native';
// Asegúrate de que esta ruta sea correcta según tu carpeta
import { borrarFotoUsuario, guardarFotoUsuario, obtenerFotoUsuario } from '../../src/database/db';

export const useConfig = (router) => {
  const auth = getAuth();
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const userEmail = auth.currentUser?.email || "Usuario";

  // 1. CARGAR FOTO: Se ejecuta al montar el hook
  useEffect(() => {
    if (auth.currentUser?.email) {
      const fotoGuardada = obtenerFotoUsuario(auth.currentUser.email);
      if (fotoGuardada) {
        setImagenPerfil(fotoGuardada);
      }
    }
  }, [auth.currentUser?.email]);

  const seleccionarImagen = async (tipo) => {
    // Pedir permisos
    const { status } = tipo === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos acceso para cambiar tu foto.");
      return;
    }

    // Abrir cámara o galería
    const result = tipo === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });

    if (!result.canceled) {
      const nuevaUri = result.assets[0].uri;
      
      // Actualizar estado visual
      setImagenPerfil(nuevaUri);

      // 2. GUARDAR EN SQLITE: Guardamos la URI vinculada al email
      if (auth.currentUser?.email) {
        guardarFotoUsuario(auth.currentUser.email, nuevaUri);
      }
    }
  };

  const eliminarImagenPerfil = () => {
    Alert.alert("Eliminar foto", "¿Quitar foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Eliminar", 
        style: "destructive", 
        onPress: () => {
          setImagenPerfil(null);
          // 3. BORRAR EN SQLITE
          if (auth.currentUser?.email) {
            borrarFotoUsuario(auth.currentUser.email);
          }
        } 
      }
    ]);
  };

  const handleSignOut = async () => {
    try {
      // Si quieres que Firebase realmente cierre sesión:
      // await auth.signOut();
      router.replace('/(auth)/Login'); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return { imagenPerfil, userEmail, seleccionarImagen, eliminarImagenPerfil, handleSignOut };
};