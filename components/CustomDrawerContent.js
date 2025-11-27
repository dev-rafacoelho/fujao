import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

export default function CustomDrawerContent() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

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
            navigation.navigate("Welcome");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header do Drawer */}
      <View style={styles.drawerHeader}>
        <Logo size={60} />
        <Text style={styles.drawerTitle}>Fujão</Text>
        {user && (
          <Text style={styles.drawerSubtitle}>
            {user.nome || "Usuário"}
          </Text>
        )}
        {user && user.email && (
          <Text style={styles.drawerEmail}>{user.email}</Text>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate("Profile");
            navigation.closeDrawer();
          }}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate("Map");
            navigation.closeDrawer();
          }}
        >
          <Text style={styles.menuIcon}>🗺️</Text>
          <Text style={styles.menuText}>Mapa</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={() => {
            navigation.closeDrawer();
            handleSignOut();
          }}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    backgroundColor: "#FFD700",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  drawerSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 8,
  },
  drawerEmail: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    color: "#e74c3c",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

