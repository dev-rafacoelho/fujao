import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Imagem de fundo ocupando toda a tela */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon} />
      </View>
      <Image
        source={require("../assets/fundo.png")}
        style={styles.puppyImage}
      />

      {/* Seção Inferior - Card branco */}
      <View style={styles.lowerSection}>
        <Text style={styles.title}>Bem-vindo ao Fujão!</Text>
        <Text style={styles.description}>
          O aplicativo oficial para encontrar teu fujão, faça seu cadastro e
          comece a utilizar agora mesmo!
        </Text>

        <TouchableOpacity style={styles.cadastrarButton}>
          <Text style={styles.cadastrarButtonText}
          onPress={() => navigation.navigate("Register")}>Cadastrar-se</Text>
          
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 2,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#8B7355", // Marrom-oliva
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#6B5638",
  },
  puppyImage: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  },
  lowerSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cadastrarButton: {
    backgroundColor: "#FFD700", // Amarelo vibrante
    width: "100%",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  cadastrarButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "transparent",
    width: "100%",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  loginButtonText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
});
