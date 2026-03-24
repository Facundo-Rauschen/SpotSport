import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerStyles as styles } from '../../src/styles/stylesRegister';

// Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/services/firebaseConfig';

export default function Registro() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const manejarRegistro = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Atención", "Por favor, completa todos los campos.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            
            Alert.alert("¡Éxito!", "Cuenta creada correctamente.", [
                { text: "Entrar", onPress: () => router.replace('/(tabs)/mapa') } 
            ]);
        } catch (error) {
            console.log("Error Registro:", error.code);
            let mensaje = "No se pudo crear la cuenta.";
            
            if (error.code === 'auth/email-already-in-use') {
                mensaje = "Este correo ya está registrado.";
            } else if (error.code === 'auth/invalid-email') {
                mensaje = "El formato del correo es inválido.";
            }
            
            Alert.alert("Error de Registro", mensaje);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* LOGO CIRCULAR */}
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../../assets/images/SpotSport.png')} 
                    style={styles.logo}
                />
            </View>

            <View style={styles.register}>
                <Text style={styles.title}>Crear Cuenta</Text>
                <Text style={styles.subtitle}>Completá tus datos para empezar</Text>

                <Text style={styles.texto}>Correo electrónico:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.texto}>Contraseña:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Text style={styles.texto}>Confirmar contraseña:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Repetí tu contraseña"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity 
                    style={[styles.buttonRegister, loading && { opacity: 0.7 }]} 
                    onPress={manejarRegistro}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>REGISTRARSE</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.push('/(auth)/Login')}
                    disabled={loading}
                >
                    <Text style={styles.linkText}>¿Ya tenés cuenta? Iniciá sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}