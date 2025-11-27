import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { buscarAnimaisPerdidos, atualizarAnimal } from "../services/api";
import AddAnimalModal from "../components/AddAnimalModal";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [animais, setAnimais] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addAnimalModalVisible, setAddAnimalModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: -15.7975,
    longitude: -47.8919,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Verificar se está autenticado, se não estiver, redirecionar para login
    if (!isAuthenticated) {
      navigation.replace("Login");
      return;
    }
    
    requestLocationPermission();
    loadAnimaisPerdidos();
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await signOut();
            navigation.replace("Welcome");
          },
        },
      ]
    );
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permissão de localização negada. O mapa será exibido sem sua localização atual."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    }
  };

  const loadAnimaisPerdidos = async () => {
    try {
      setLoading(true);
      const animaisPerdidos = await buscarAnimaisPerdidos();
      setAnimais(animaisPerdidos);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
      Alert.alert("Erro", "Não foi possível carregar os animais perdidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (animal) => {
    setSelectedAnimal(animal);
    setModalVisible(true);
  };

  const handleReivindicar = async () => {
    if (!selectedAnimal) return;

    Alert.alert(
      "Confirmar Reivindicação",
      `Você tem certeza de que este é seu cachorro "${selectedAnimal.nome}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, é meu!",
          onPress: async () => {
            try {
              // Atualizar o animal para não estar mais perdido
              await atualizarAnimal(selectedAnimal.id, {
                ...selectedAnimal,
                perdido: false,
                usuario_id: user.id,
              });

              Alert.alert(
                "Sucesso!",
                "Cachorro reivindicado com sucesso! Ele foi removido do mapa.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setModalVisible(false);
                      setSelectedAnimal(null);
                      loadAnimaisPerdidos();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Erro ao reivindicar:", error);
              Alert.alert(
                "Erro",
                "Não foi possível reivindicar o cachorro. Tente novamente."
              );
            }
          },
        },
      ]
    );
  };

  const renderAnimalImage = (animal) => {
    if (animal.imagem_base64) {
      return (
        <Image
          source={{ uri: `data:image/jpeg;base64,${animal.imagem_base64}` }}
          style={styles.animalImage}
          resizeMode="cover"
        />
      );
    }
    return (
      <View style={styles.noImageContainer}>
        <Text style={styles.noImageText}>🐕</Text>
      </View>
    );
  };

  // Se não estiver autenticado, não mostrar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fujão</Text>
        <Text style={styles.headerSubtitle}>
          {animais.length} cachorro{animais.length !== 1 ? "s" : ""} perdido{animais.length !== 1 ? "s" : ""}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {animais.map((animal) => {
          if (!animal.latitude || !animal.longitude) return null;
          
          return (
            <Marker
              key={animal.id}
              coordinate={{
                latitude: animal.latitude,
                longitude: animal.longitude,
              }}
              title={animal.nome || "Cachorro Perdido"}
              description={animal.descricao || "Clique para mais informações"}
              onPress={() => handleMarkerPress(animal)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerEmoji}>🐕</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Botão Flutuante para Adicionar Animal */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddAnimalModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Detalhes do Animal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAnimal && (
                <>
                  {/* Botão Fechar */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>

                  {/* Imagem do Animal */}
                  {renderAnimalImage(selectedAnimal)}

                  {/* Informações do Animal */}
                  <View style={styles.animalInfo}>
                    <Text style={styles.animalName}>
                      {selectedAnimal.nome || "Sem nome"}
                    </Text>

                    {selectedAnimal.raca && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Raça:</Text>
                        <Text style={styles.infoValue}>
                          {selectedAnimal.raca}
                        </Text>
                      </View>
                    )}

                    {selectedAnimal.especie && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Espécie:</Text>
                        <Text style={styles.infoValue}>
                          {selectedAnimal.especie}
                        </Text>
                      </View>
                    )}

                    {selectedAnimal.tamanho && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tamanho:</Text>
                        <Text style={styles.infoValue}>
                          {selectedAnimal.tamanho}
                        </Text>
                      </View>
                    )}

                    {selectedAnimal.cor && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Cor:</Text>
                        <Text style={styles.infoValue}>
                          {selectedAnimal.cor}
                        </Text>
                      </View>
                    )}

                    {selectedAnimal.descricao && (
                      <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionLabel}>Descrição:</Text>
                        <Text style={styles.descriptionText}>
                          {selectedAnimal.descricao}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Botão Reivindicar */}
                  <TouchableOpacity
                    style={styles.reivindicarButton}
                    onPress={handleReivindicar}
                  >
                    <Text style={styles.reivindicarButtonText}>
                      Este é meu cachorro!
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para Adicionar Animal */}
      <AddAnimalModal
        visible={addAnimalModalVisible}
        onClose={() => setAddAnimalModalVisible(false)}
        onSuccess={() => {
          loadAnimaisPerdidos();
        }}
        user={user}
        initialLocation={region}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  header: {
    backgroundColor: "#FFD700",
    paddingTop: 50,
    paddingBottom: 15,
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  headerButtons: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButtonText: {
    fontSize: 20,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
    elevation: 6,
  },
  markerEmoji: {
    fontSize: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
  },
  animalImage: {
    width: "100%",
    height: 250,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  noImageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  noImageText: {
    fontSize: 80,
  },
  animalInfo: {
    padding: 20,
  },
  animalName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  reivindicarButton: {
    backgroundColor: "#FFD700",
    marginHorizontal: 20,
    marginTop: 10,
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
  reivindicarButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 36,
  },
});

