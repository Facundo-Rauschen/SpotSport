import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  contenedor: { 
    marginBottom: 25 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2C3E50', 
    marginBottom: 12 
  },
  contenidoScroll: { 
    paddingBottom: 5, 
    paddingLeft: 2 
  }, 
  tarjeta: { 
    backgroundColor: 'white', 
    width: 120, 
    padding: 12, 
    borderRadius: 20, 
    marginRight: 12, 
    alignItems: 'center', 
    // Sombras para Android
    elevation: 3,
    // Sombras para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  circuloIcono: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#FEF9E7', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  iconoEmoji: {
    fontSize: 18
  },
  nombre: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#2C3E50', 
    textAlign: 'center' 
  },
  direccion: { 
    fontSize: 10, 
    color: '#95A5A6', 
    textAlign: 'center', 
    marginTop: 2 
  }
});