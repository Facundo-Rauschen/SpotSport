import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginStyles as styles } from '../../src/styles/stylesLogin';

// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../src/services/firebaseConfig';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '') {
            Alert.alert("Atención", "Por favor, completa todos los campos.");
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)/mapa');

        } catch (error) {
            // USAMOS console.log EN VEZ DE console.error PARA EVITAR EL CALLSTACK GIGANTE
            console.log("Aviso de Auth:", error.code);

            let message = "Ocurrió un error inesperado.";

            // Mapeo de errores comunes para que el usuario entienda qué pasó
            switch (error.code) {
                case 'auth/invalid-credential':
                    message = "El correo o la contraseña son incorrectos. Verificalos e intenta de nuevo.";
                    break;
                case 'auth/invalid-email':
                    message = "El formato del correo no es válido.";
                    break;
                case 'auth/user-disabled':
                    message = "Esta cuenta ha sido deshabilitada.";
                    break;
                case 'auth/too-many-requests':
                    message = "Demasiados intentos fallidos. Por seguridad, intenta más tarde.";
                    break;
                case 'auth/network-request-failed':
                    message = "No hay conexión a internet.";
                    break;
                default:
                    message = "No pudimos iniciar sesión en este momento.";
            }

            Alert.alert("Acceso denegado", message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/images/SpotSport.png')}
                    style={styles.logo}
                />
            </View>

            <View style={styles.login}>
                <Text style={styles.title}>Bienvenido</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/RecuperarPassword')}>
                    <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
                    <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}