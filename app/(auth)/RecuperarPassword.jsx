import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginStyles as styles } from '../../src/styles/stylesLogin';

// Firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../src/services/firebaseConfig';

export default function RecuperarPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRestablecer = async () => {
        if (email.trim() === '') {
            Alert.alert("Atención", "Por favor, ingresa tu correo electrónico.");
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            
            Alert.alert(
                "Correo enviado", 
                "Revisá tu bandeja de entrada para restablecer tu contraseña.",
                [{ text: "Entendido", onPress: () => router.back() }] 
            );

        } catch (error) {
            console.log("Error al restablecer:", error.code);
            
            let mensaje = "No pudimos enviar el correo.";
            if (error.code === 'auth/invalid-email') {
                mensaje = "El formato del correo no es válido.";
            } else if (error.code === 'auth/user-not-found') {
                mensaje = "No hay ninguna cuenta registrada con este correo.";
            }
            
            Alert.alert("Error", mensaje);
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

            <View style={styles.login}>
                <Text style={styles.title}>Recuperar Clave</Text>
                
                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 14 }}>
                    Ingresá tu correo y te enviaremos un enlace para que crees una nueva contraseña.
                </Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleRestablecer}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Enviar enlace</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.linkText}>Volver al inicio de sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}