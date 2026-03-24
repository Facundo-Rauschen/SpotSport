import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F3F4',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  info: { flex: 1 },
  headerFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sede: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', flexShrink: 1, marginRight: 8 },
  badgeDeporte: {
    backgroundColor: '#FBEEE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textoDeporte: { fontSize: 10, fontWeight: 'bold', color: '#E67E22', textTransform: 'uppercase' },
  fila: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  detalle: { fontSize: 13, color: '#7F8C8D', marginLeft: 4 },
  contenedorEstado: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  puntoEstado: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  textoEstado: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  botonEliminar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#F2F3F4',
    marginLeft: 10,
  },
  labelEliminar: {
    fontSize: 9,
    color: '#E74C3C',
    marginTop: 4,
    fontWeight: 'bold'
  }
});