// Configuração da API
// IMPORTANTE: Para dispositivos móveis, use o IP da sua máquina ao invés de localhost
// Para desenvolvimento local, use o IP da sua máquina na rede local
// Para produção, altere para a URL do servidor de produção
import { Platform } from "react-native";

// Detectar se está em dispositivo móvel ou web
const getBaseURL = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8080";
  }
  // Para iOS e Android, use o IP da sua máquina na rede
  // Altere este IP para o IP da sua máquina na rede local
  return "http://192.168.4.22:8080";
};

const API_BASE_URL = getBaseURL();

/**
 * Função genérica para fazer requisições HTTP
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      // Tentar pegar a mensagem de erro do backend
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          // O Spring Boot pode retornar a mensagem em diferentes formatos
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else {
          // Tentar ler como texto
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        }
      } catch (e) {
        // Se não conseguir parsear, usar mensagem baseada no status
        if (response.status === 401) {
          errorMessage = "Senha incorreta";
        } else if (response.status === 404) {
          errorMessage = "Usuário não encontrado";
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    // Se for erro de rede
    if (error.message === "Network request failed" || error.message === "Failed to fetch") {
      throw new Error("Erro de conexão. Verifique se o servidor está rodando e se você está conectado à internet.");
    }
    
    // Se já for um erro criado por nós, apenas relançar
    if (error.status) {
      throw error;
    }
    
    // Outros erros
    console.error("Erro na requisição:", error);
    throw new Error(error.message || "Erro desconhecido ao fazer requisição");
  }
}

/**
 * Registra um novo usuário
 * @param {Object} usuario - Dados do usuário { nome, telefone, cpf, email, hash_senha }
 * @returns {Promise<Object>} Resposta do servidor
 */
export async function registrarUsuario(usuario) {
  return apiRequest("/api/usuarios", "POST", usuario);
}

/**
 * Faz login de um usuário e retorna os dados do usuário
 * @param {Object} credenciais - { email, hash_senha }
 * @returns {Promise<Object>} Dados do usuário
 */
export async function loginUsuario(credenciais) {
  return apiRequest("/api/usuarios/login", "POST", credenciais);
}

/**
 * Busca um usuário por email
 * @param {String} email - Email do usuário
 * @returns {Promise<Object>} Dados do usuário
 */
export async function buscarUsuarioPorEmail(email) {
  return apiRequest(`/api/usuarios/email/${encodeURIComponent(email)}`, "GET");
}

/**
 * Busca todos os animais
 * @returns {Promise<Array>} Lista de animais
 */
export async function buscarAnimais() {
  return apiRequest("/api/animais", "GET");
}

/**
 * Busca animais perdidos (com perdido = true)
 * @returns {Promise<Array>} Lista de animais perdidos
 */
export async function buscarAnimaisPerdidos() {
  const animais = await apiRequest("/api/animais", "GET");
  return animais.filter(animal => animal.perdido === true);
}

/**
 * Cria um novo animal
 * @param {Object} animal - Dados do animal
 * @returns {Promise<Object>} Animal criado
 */
export async function criarAnimal(animal) {
  return apiRequest("/api/animais", "POST", animal);
}

/**
 * Atualiza um animal existente
 * @param {Integer} id - ID do animal
 * @param {Object} animal - Dados atualizados do animal
 * @returns {Promise<Object>} Animal atualizado
 */
export async function atualizarAnimal(id, animal) {
  return apiRequest(`/api/animais/${id}`, "PUT", animal);
}

/**
 * Busca todos os animais encontrados
 * @returns {Promise<Array>} Lista de animais encontrados
 */
export async function buscarAnimaisEncontrados() {
  return apiRequest("/api/animais_encontrados", "GET");
}

/**
 * Cria um novo animal encontrado
 * @param {Object} animalEncontrado - Dados do animal encontrado
 * @returns {Promise<Object>} Animal encontrado criado
 */
export async function criarAnimalEncontrado(animalEncontrado) {
  return apiRequest("/api/animais_encontrados", "POST", animalEncontrado);
}

/**
 * Busca um usuário por ID
 * @param {Integer} id - ID do usuário
 * @returns {Promise<Object>} Dados do usuário
 */
export async function buscarUsuarioPorId(id) {
  return apiRequest(`/api/usuarios/${id}`, "GET");
}

/**
 * Atualiza um usuário existente
 * @param {Integer} id - ID do usuário
 * @param {Object} usuario - Dados atualizados do usuário
 * @returns {Promise<Object>} Usuário atualizado
 */
export async function atualizarUsuario(id, usuario) {
  return apiRequest(`/api/usuarios/${id}`, "PUT", usuario);
}

export default {
  registrarUsuario,
  loginUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  atualizarUsuario,
  buscarAnimais,
  buscarAnimaisPerdidos,
  criarAnimal,
  atualizarAnimal,
  buscarAnimaisEncontrados,
  criarAnimalEncontrado,
};
