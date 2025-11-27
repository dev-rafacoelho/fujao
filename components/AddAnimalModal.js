import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { criarAnimal } from "../services/api";

export default function AddAnimalModal({ visible, onClose, onSuccess, user, initialLocation }) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState(initialLocation?.latitude || null);
  const [longitude, setLongitude] = useState(initialLocation?.longitude || null);
  const [imagem, setImagem] = useState(null);
  const [imagemBase64, setImagemBase64] = useState(null);

  useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.latitude);
      setLongitude(initialLocation.longitude);
    } else {
      getCurrentLocation();
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da sua localização para cadastrar o animal perdido."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      Alert.alert("Erro", "Não foi possível obter sua localização.");
    }
  };

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos para adicionar imagens dos animais."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao solicitar permissão de galeria:", error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar a câmera para tirar fotos dos animais."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao solicitar permissão de câmera:", error);
      return false;
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permissão antes de abrir a galeria
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2, // Qualidade reduzida para comprimir bastante
        base64: true,
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const base64String = result.assets[0].base64;
        
        // Validar tamanho da imagem (limitar a ~1MB em base64)
        if (base64String && base64String.length > 1000000) {
          Alert.alert(
            "Imagem muito grande",
            "A imagem selecionada é muito grande. Por favor, escolha uma imagem menor ou de menor resolução."
          );
          return;
        }
        
        setImagem(result.assets[0].uri);
        setImagemBase64(base64String);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const takePhoto = async () => {
    try {
      // Solicitar permissão antes de abrir a câmera
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2, // Qualidade reduzida para comprimir bastante
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const base64String = result.assets[0].base64;
        
        // Validar tamanho da imagem (limitar a ~1MB em base64)
        if (base64String && base64String.length > 1000000) {
          Alert.alert(
            "Imagem muito grande",
            "A imagem capturada é muito grande. Por favor, tente novamente."
          );
          return;
        }
        
        setImagem(result.assets[0].uri);
        setImagemBase64(base64String);
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Selecionar Imagem",
      "Escolha uma opção",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Câmera", onPress: takePhoto },
        { text: "Galeria", onPress: pickImage },
      ]
    );
  };

  const validateForm = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, preencha o nome do animal.");
      return false;
    }
    if (!latitude || !longitude) {
      Alert.alert("Erro", "Por favor, permita o acesso à localização.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Validar tamanho da imagem antes de enviar (limite de 1MB)
    if (imagemBase64 && imagemBase64.length > 1000000) {
      Alert.alert(
        "Imagem muito grande",
        "A imagem é muito grande para ser enviada (máximo 1MB). Por favor, escolha uma imagem menor."
      );
      return;
    }

    setLoading(true);

    try {
      // Garantir que a imagem não ultrapasse o limite (medida de segurança final)
      let imagemFinal = imagemBase64;
      if (imagemFinal && imagemFinal.length > 800000) {
        // Se ainda estiver muito grande, não enviar a imagem ao invés de truncar
        console.warn("Imagem muito grande, removendo para evitar erro no banco");
        Alert.alert(
          "Aviso",
          "A imagem é muito grande e será enviada sem foto. Você pode adicionar a foto depois."
        );
        imagemFinal = null;
      }

      const animalData = {
        nome: nome.trim(),
        raca: raca.trim() || null,
        especie: especie.trim() || "Cachorro",
        tamanho: tamanho.trim() || null,
        cor: cor.trim() || null,
        descricao: descricao.trim() || null,
        latitude: latitude,
        longitude: longitude,
        perdido: true,
        usuario_id: user.id,
        imagem_base64: imagemFinal || null,
      };

      await criarAnimal(animalData);

      Alert.alert(
        "Sucesso!",
        "Animal cadastrado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível cadastrar o animal. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setRaca("");
    setEspecie("Cachorro");
    setTamanho("");
    setCor("");
    setDescricao("");
    setImagem(null);
    setImagemBase64(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Cadastrar Animal Perdido</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Imagem */}
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={showImageOptions}
                disabled={loading}
              >
                {imagem ? (
                  <Image source={{ uri: imagem }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                    <Text style={styles.imagePlaceholderLabel}>
                      Toque para adicionar foto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Formulário */}
              <View style={styles.form}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Nome do Animal *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Rex"
                    value={nome}
                    onChangeText={setNome}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Espécie</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Cachorro"
                    value={especie}
                    onChangeText={setEspecie}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Raça</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Golden Retriever"
                    value={raca}
                    onChangeText={setRaca}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Tamanho</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Grande, Médio, Pequeno"
                    value={tamanho}
                    onChangeText={setTamanho}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Cor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Marrom, Preto, Branco"
                    value={cor}
                    onChangeText={setCor}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Informações adicionais sobre o animal..."
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>

                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>📍 Localização:</Text>
                  {latitude && longitude ? (
                    <Text style={styles.locationText}>
                      Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                    </Text>
                  ) : (
                    <Text style={styles.locationText}>Obtendo localização...</Text>
                  )}
                </View>

                {/* Botão Salvar */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Cadastrar Animal</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 60,
    marginBottom: 10,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  locationInfo: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

