import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { buscarUsuarioPorId, atualizarUsuario } from "../services/api";
import Logo from "../components/Logo";

export default function ProfileScreen() {
  const { user, signIn } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user || !user.id) {
      Alert.alert("Erro", "Usuário não encontrado.");
      navigation.goBack();
      return;
    }

    try {
      setLoadingUser(true);
      const usuarioData = await buscarUsuarioPorId(user.id);
      setNome(usuarioData.nome || "");
      setTelefone(usuarioData.telefone || "");
      setCpf(usuarioData.cpf || "");
      setEmail(usuarioData.email || "");
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
    } finally {
      setLoadingUser(false);
    }
  };

  const formatarTelefone = (text) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d{4})(\d{0,4})/, "($1)$2-$3")
        .replace(/-$/, "");
    } else {
      return numbers
        .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1)$2-$3")
        .replace(/-$/, "");
    }
  };

  const formatarCPF = (text) => {
    const numbers = text.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4")
      .replace(/-$/, "");
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validarCampos = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, preencha o nome.");
      return false;
    }
    if (!telefone.trim()) {
      Alert.alert("Erro", "Por favor, preencha o telefone.");
      return false;
    }
    if (!email.trim() || !validarEmail(email)) {
      Alert.alert("Erro", "Por favor, preencha um e-mail válido.");
      return false;
    }
    if (novaSenha && novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validarCampos()) {
      return;
    }

    setLoading(true);

    try {
      const telefoneLimpo = telefone.replace(/\D/g, "");

      const usuarioAtualizado = {
        nome: nome.trim(),
        telefone: telefoneLimpo,
        email: email.trim().toLowerCase(),
      };

      // Se forneceu nova senha, incluir no update
      if (novaSenha && novaSenha.trim().length > 0) {
        usuarioAtualizado.hash_senha = novaSenha.trim();
      }

      const usuario = await atualizarUsuario(user.id, usuarioAtualizado);

      // Atualizar o contexto de autenticação com os novos dados
      await signIn(usuario);

      Alert.alert(
        "Sucesso!",
        "Perfil atualizado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert(
        "Erro ao atualizar",
        error.message || "Não foi possível atualizar o perfil. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Logo size={50} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Campo Nome */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Campo Telefone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="(66) 99956-2005"
                placeholderTextColor="#999"
                value={telefone}
                onChangeText={(text) => setTelefone(formatarTelefone(text))}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!loading}
              />
            </View>
          </View>

          {/* Campo CPF (somente leitura) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>CPF</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#999"
                value={cpf ? formatarCPF(cpf) : ""}
                editable={false}
              />
            </View>
            <Text style={styles.helpText}>CPF não pode ser alterado</Text>
          </View>

          {/* Campo E-mail */}
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
                editable={!loading}
              />
            </View>
          </View>

          {/* Campo Nova Senha (opcional) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nova Senha (opcional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Deixe em branco para manter a senha atual"
                placeholderTextColor="#999"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeIconText}>👁️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              Preencha apenas se desejar alterar a senha
            </Text>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#FFD700",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  form: {
    padding: 20,
    width: "100%",
  },
  fieldContainer: {
    marginBottom: 20,
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
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
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
  helpText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    height: 55,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

