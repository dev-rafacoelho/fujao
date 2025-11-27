import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function SimpleMenu({ visible, onClose }) {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  const handleProfile = () => {
    onClose();
    navigation.navigate("Profile");
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigation.replace("Welcome");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header do Menu */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Informações do Usuário */}
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.nome || user.email}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}

            {/* Opções do Menu */}
            <View style={styles.menuOptions}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate("AnimalsList");
                }}
              >
                <Text style={styles.menuItemIcon}>🐕</Text>
                <Text style={styles.menuItemText}>Ver Todos os Animais</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleProfile}
              >
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={styles.menuItemText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  menuOptions: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 18,
    color: "#333",
  },
});

