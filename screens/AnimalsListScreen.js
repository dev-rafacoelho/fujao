import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { buscarAnimaisPerdidos } from "../services/api";

export default function AnimalsListScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [animaisFiltrados, setAnimaisFiltrados] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Login");
      return;
    }
    loadAnimais();
  }, [isAuthenticated]);

  const loadAnimais = async () => {
    try {
      setLoading(true);
      const data = await buscarAnimaisPerdidos();
      setAnimais(data);
      setAnimaisFiltrados(data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
      Alert.alert("Erro", "Não foi possível carregar os animais perdidos.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimais();
    setRefreshing(false);
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setAnimaisFiltrados(animais);
      return;
    }

    const textoBusca = searchText.toLowerCase();
    const filtrados = animais.filter((animal) => {
      const nome = (animal.nome || "").toLowerCase();
      const raca = (animal.raca || "").toLowerCase();
      const especie = (animal.especie || "").toLowerCase();
      const descricao = (animal.descricao || "").toLowerCase();
      
      return (
        nome.includes(textoBusca) ||
        raca.includes(textoBusca) ||
        especie.includes(textoBusca) ||
        descricao.includes(textoBusca)
      );
    });
    setAnimaisFiltrados(filtrados);
  }, [searchText, animais]);

  const handleAnimalPress = (animal) => {
    if (!animal.latitude || !animal.longitude) {
      Alert.alert("Aviso", "Este animal não possui localização cadastrada.");
      return;
    }

    // Navegar para o mapa e focar no animal
    navigation.navigate("Map", {
      focusAnimal: {
        id: animal.id,
        latitude: animal.latitude,
        longitude: animal.longitude,
      },
    });
  };

  const renderAnimalCard = (animal) => {
    const temLocalizacao = animal.latitude && animal.longitude;

    return (
      <TouchableOpacity
        key={animal.id}
        style={styles.card}
        onPress={() => handleAnimalPress(animal)}
        disabled={!temLocalizacao}
      >
        {/* Imagem do Animal */}
        <View style={styles.imageContainer}>
          {animal.imagem_base64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${animal.imagem_base64}` }}
              style={styles.animalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🐕</Text>
            </View>
          )}
        </View>

        {/* Informações do Animal */}
        <View style={styles.cardContent}>
          <Text style={styles.animalName}>
            {animal.nome || "Sem nome"}
          </Text>
          
          <View style={styles.infoRow}>
            {animal.especie && (
              <Text style={styles.infoText}>{animal.especie}</Text>
            )}
            {animal.raca && (
              <Text style={styles.infoText}> • {animal.raca}</Text>
            )}
          </View>

          {animal.tamanho && (
            <Text style={styles.infoText}>Tamanho: {animal.tamanho}</Text>
          )}

          {animal.cor && (
            <Text style={styles.infoText}>Cor: {animal.cor}</Text>
          )}

          {animal.descricao && (
            <Text style={styles.description} numberOfLines={2}>
              {animal.descricao}
            </Text>
          )}

          {!temLocalizacao && (
            <Text style={styles.noLocationText}>
              ⚠️ Sem localização
            </Text>
          )}

          {temLocalizacao && (
            <Text style={styles.viewLocationText}>
              👆 Toque para ver no mapa
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cachorros Perdidos</Text>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome, raça, espécie..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Lista de Animais */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Carregando animais...</Text>
        </View>
      ) : animaisFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🐕</Text>
          <Text style={styles.emptyText}>
            {searchText.trim() === ""
              ? "Nenhum animal perdido encontrado"
              : "Nenhum animal encontrado com essa busca"}
          </Text>
          {searchText.trim() !== "" && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchText("")}
            >
              <Text style={styles.clearButtonText}>Limpar busca</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFD700"]}
            />
          }
        >
          <Text style={styles.resultsCount}>
            {animaisFiltrados.length} animal(is) encontrado(s)
          </Text>
          {animaisFiltrados.map((animal) => renderAnimalCard(animal))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FFD700",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  animalImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  cardContent: {
    padding: 15,
  },
  animalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    lineHeight: 20,
  },
  noLocationText: {
    fontSize: 12,
    color: "#ff9800",
    marginTop: 10,
    fontWeight: "600",
  },
  viewLocationText: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});

