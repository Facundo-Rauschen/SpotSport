import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' // Un gris casi blanco, más moderno que el blanco puro
  },
  header: { 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 40, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F3F4',
  },
  avatarContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    marginBottom: 15,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  foto: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { color: '#FFF', fontSize: 44, fontWeight: 'bold' },
  cameraIconBadge: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    backgroundColor: '#1C1C1E', 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  deleteIconBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30', 
    width: 34, 
    height: 34, 
    borderRadius: 17,
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFF',
    zIndex: 10,
    elevation: 4,
  },
  userName: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginTop: 10 },
  userTag: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  
  // --- CUERPO ---
  body: { padding: 20 },
  sectionLabel: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#8E8E93', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4
  },
  footerText: { 
    textAlign: 'center', 
    color: '#C7C7CC', 
    fontSize: 12, 
    marginVertical: 40,
    fontWeight: '500'
  }
});