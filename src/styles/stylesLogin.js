import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2', // Un gris un poco más suave
        justifyContent: 'center',
        padding: 24,
    },
    // Estilo para que el logo flote sobre el cuadro
    logoContainer: {
        alignItems: 'center',
        zIndex: 2,           // Asegura que esté por encima de todo
        marginBottom: -60,   // "Mete" el logo dentro del cuadro blanco
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,    // Círculo perfecto
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#007AFF', // Azul deportivo
    },
    login: {
        backgroundColor: '#fff',
        padding: 30,
        paddingTop: 70,      // Espacio para que el logo no tape el texto
        borderRadius: 40,
        // Sombras
        elevation: 8,        // Para Android
        shadowColor: '#000', // Para iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 25,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    input: {
        height: 55,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        paddingHorizontal: 20,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
        color: '#333',
    },
    button: {
        height: 55,
        backgroundColor: '#007AFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 15,
    },
});