# Fujão - App para Encontrar Cachorros Perdidos

Aplicativo React Native desenvolvido com Expo para ajudar pessoas a encontrarem seus cachorros perdidos.

## Funcionalidades

### ✅ Implementado

1. **Tela de Login**
   - Autenticação de usuários
   - Validação de campos
   - Integração com backend

2. **Tela de Registro**
   - Cadastro de novos usuários
   - Validação de CPF, email e telefone
   - Formatação automática de campos

3. **Tela de Mapa**
   - Visualização de mapa com pins dos cachorros perdidos
   - Localização do usuário
   - Filtro automático para mostrar apenas animais perdidos
   - Contador de animais perdidos no header

4. **Modal de Detalhes do Animal**
   - Visualização completa das informações do cachorro
   - Exibição de imagem (se disponível)
   - Botão para reivindicar o cachorro como seu
   - Confirmação antes de reivindicar

5. **Sistema de Autenticação**
   - Contexto de autenticação global
   - Armazenamento persistente com AsyncStorage
   - Navegação automática após login

## Estrutura do Projeto

```
fujao/
├── screens/
│   ├── WelcomeScreen.js      # Tela inicial
│   ├── LoginScreen.js        # Tela de login
│   ├── RegisterScreen.js     # Tela de registro
│   └── MapScreen.js          # Tela principal com mapa
├── services/
│   └── api.js                # Serviços de API
├── contexts/
│   └── AuthContext.js        # Contexto de autenticação
├── components/
│   └── Logo.js               # Componente de logo
└── App.js                    # Navegação principal
```

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a URL da API no arquivo `services/api.js`:
   - Para desenvolvimento local: use o IP da sua máquina (ex: `http://192.168.1.100:8080`)
   - **Importante**: Em dispositivos móveis, não use `localhost`, use o IP da sua máquina na rede

3. Execute o app:
```bash
npm start
# ou
expo start
```

## Dependências Principais

- `@react-navigation/native` - Navegação
- `react-native-maps` - Mapas
- `expo-location` - Localização do usuário
- `@react-native-async-storage/async-storage` - Armazenamento local
- `expo` - Framework React Native

## Backend

O backend foi ajustado para incluir:
- Endpoint POST `/api/usuarios/login` que retorna os dados do usuário
- Endpoint GET `/api/usuarios/email/{email}` para buscar usuário por email
- Configuração de CORS para permitir requisições do frontend

## Funcionalidades do Backend Utilizadas

- `POST /api/usuarios` - Registrar novo usuário
- `POST /api/usuarios/login` - Fazer login (retorna usuário)
- `GET /api/animais` - Listar todos os animais
- `GET /api/animais_perdidos` - Listar animais perdidos (filtrado no frontend)
- `PUT /api/animais/{id}` - Atualizar animal (usado para reivindicar)

## Como Usar

1. **Registrar**: Crie uma conta na tela de registro
2. **Login**: Faça login com suas credenciais
3. **Mapa**: Visualize os cachorros perdidos no mapa
4. **Reivindicar**: Clique em um pin para ver detalhes e reivindicar se for seu cachorro

## Notas Importantes

- Certifique-se de que o backend está rodando e acessível
- Para testar em dispositivos físicos, use o IP da sua máquina na URL da API
- Permissões de localização são necessárias para mostrar a localização do usuário no mapa

## Próximos Passos Sugeridos

- [ ] Tela para registrar novos animais perdidos
- [ ] Tela de perfil do usuário
- [ ] Notificações quando animais similares são encontrados
- [ ] Histórico de animais reivindicados
- [ ] Compartilhamento de animais perdidos

