import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Logo from "../components/Logo";
import { loginUsuario } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);

    try {
      const usuario = await loginUsuario({
        email: email.trim().toLowerCase(),
        hash_senha: password,
      });

      if (usuario && usuario.id) {
        await signIn(usuario);
        // Navegar para a tela do mapa após login bem-sucedido
        navigation.replace("Map");
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      // Mensagens específicas para diferentes tipos de erro
      if (error.message) {
        if (error.message.includes("Usuário não encontrado")) {
          errorMessage = "Usuário não encontrado. Verifique o email e tente novamente.";
        } else if (error.message.includes("Senha incorreta")) {
          errorMessage = "Senha incorreta. Tente novamente.";
        } else if (error.message.includes("Erro de conexão")) {
          errorMessage = "Erro de conexão. Verifique se o servidor está rodando.";
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert("Erro ao fazer login", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção Superior com logo e fundo amarelo */}
        <View style={styles.headerSection}>
          <Logo size={60} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fujão</Text>
            <Text style={styles.headerSubtitle}>
              Faça login para acessar a sua conta
            </Text>
          </View>
        </View>

        {/* Campo Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com.br"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Campo Senha */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeIconText}>👁️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link Esqueceu a senha */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Link Cadastre-se */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 15,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(224, 224, 224, 0.5)",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: "#333",
  },
  eyeIcon: {
    padding: 5,
  },
  eyeIconText: {
    fontSize: 20,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 25,
    width: "100%",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#FFD700",
    height: 55,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "bold",
  },
});
