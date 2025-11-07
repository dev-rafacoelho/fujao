import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [secure, setSecure] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
          }}
          style={styles.logo}
        />
        <View>
          <Text style={styles.title}>Fujão</Text>
          <Text style={styles.subtitle}>Faça login para acessar a sua conta</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Nome</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="Rafael Coelho"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.label}>Telefone</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="(66) 99956-2005"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.label}>CPF</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="id-card-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="074.869.421-63"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="email@exemplo.com.br"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="********"
            secureTextEntry={secure}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    backgroundColor: "#FFC107",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    tintColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    color: "#fff",
    fontSize: 13,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    color: "#444",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  button: {
    backgroundColor: "#FFC107",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
