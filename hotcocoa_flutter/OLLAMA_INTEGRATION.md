# Integracao com Ollama - HotCocoa Flutter

## Visao Geral

A Fase 6 do HotCocoa Flutter implementa integracao completa com Ollama local, permitindo chat com modelos de linguagem rodando na maquina do usuario.

## Arquitetura

### Camadas Implementadas

```
lib/
├── shared/
│   ├── services/
│   │   └── ollama_service.dart       # Service principal com HTTP + streaming
│   └── providers/
│       └── ollama_providers.dart     # Providers Riverpod para state management
└── features/
    └── chat/
        └── chat_page.dart             # UI do chat com streaming em tempo real
```

## OllamaService

Localizado em `lib/shared/services/ollama_service.dart`

### Recursos

1. **Streaming de Respostas**
   - Stream de tokens via SSE (Server-Sent Events)
   - Atualização em tempo real da UI
   - Newline-delimited JSON parsing

2. **Persistencia**
   - Historico de chat salvo em SharedPreferences
   - Configuracoes persistentes (modelo, temperatura, etc)
   - Restauracao automatica na inicializacao

3. **Configuracoes**
   - Selecao de modelo
   - Temperatura (0.0 - 2.0)
   - Tokens maximos (256 - 4096)
   - Top-P e Top-K

4. **Gerenciamento de Contexto**
   - Historico de conversas incluido automaticamente
   - Formato: `Usuario: ... / Assistente: ...`
   - Contexto opcional via parametro

### API do Ollama

#### Base URL
```dart
static const String baseUrl = 'http://localhost:11434';
```

#### Endpoints

**GET /api/tags**
Listar modelos disponiveis
```dart
Future<List<OllamaModel>> listModels()
```

**POST /api/generate**
Gerar resposta com streaming
```dart
Stream<String> generateStream({
  required String prompt,
  bool includeHistory = true,
})
```

### Exemplo de Uso

```dart
final service = OllamaService();
await service.init();

// Verificar disponibilidade
final isAvailable = await service.isAvailable();

// Listar modelos
final models = await service.listModels();

// Gerar resposta com streaming
final stream = service.generateStream(
  prompt: 'Ola, como voce esta?',
  includeHistory: true,
);

await for (final token in stream) {
  print(token); // Cada token conforme chega
}
```

## Providers Riverpod

Localizado em `lib/shared/providers/ollama_providers.dart`

### Providers Disponiveis

```dart
// Instancia do servico
final ollamaServiceProvider = Provider<OllamaService>

// Configuracao do Ollama
final ollamaConfigProvider = StateProvider<OllamaConfig>

// Modelos disponiveis (async)
final ollamaModelsProvider = FutureProvider<List<OllamaModel>>

// Verificar disponibilidade (async)
final ollamaAvailabilityProvider = FutureProvider<bool>

// Historico de mensagens
final chatHistoryProvider = StateProvider<List<ChatHistoryMessage>>

// Estado de loading
final chatLoadingProvider = StateProvider<bool>

// Estado de streaming
final chatStreamingProvider = StateProvider<bool>

// Mensagem sendo construida
final streamingMessageProvider = StateProvider<String>
```

## Chat UI

Localizado em `lib/features/chat/chat_page.dart`

### Recursos da UI

1. **Status do Ollama**
   - Indicador verde/vermelho de disponibilidade
   - Verificacao automatica ao abrir

2. **Streaming Visual**
   - Tokens aparecendo em tempo real
   - Spinner durante streaming
   - Scroll automatico

3. **Configuracoes**
   - Modal bottom sheet
   - Selecao de modelo via dropdown
   - Sliders para temperatura e tokens

4. **Historico**
   - Persistencia automatica
   - Botao de limpar historico
   - Confirmacao via dialog

5. **Tratamento de Erros**
   - Dialog quando Ollama offline
   - Mensagens de erro claras
   - Fallback automatico

### Fluxo de Mensagem

```
Usuario digita -> Verifica Ollama -> Adiciona msg usuario ->
Inicia streaming -> Atualiza UI token-a-token -> Finaliza -> Salva historico
```

## Instalacao e Setup

### 1. Instalar Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai
```

### 2. Iniciar Servico

```bash
ollama serve
```

### 3. Baixar Modelo

```bash
ollama pull llama2
# ou
ollama pull mistral
# ou
ollama pull qwen2.5
```

### 4. Rodar HotCocoa Flutter

```bash
cd hotcocoa_flutter
flutter run
```

## Modelos de Dados

### OllamaModel
```dart
class OllamaModel {
  final String name;           // nome completo (ex: "llama2:latest")
  final String displayName;    // nome simplificado (ex: "llama2")
  final int size;              // tamanho em bytes
}
```

### OllamaConfig
```dart
class OllamaConfig {
  final String model;          // modelo selecionado
  final double temperature;    // 0.0 - 2.0
  final int maxTokens;         // 256 - 4096
  final double topP;           // 0.0 - 1.0
  final int topK;              // 1 - 100
}
```

### ChatHistoryMessage
```dart
class ChatHistoryMessage {
  final String role;           // 'user' ou 'assistant'
  final String content;        // texto da mensagem
  final DateTime timestamp;    // quando foi criada
}
```

## Tratamento de Erros

### Ollama Offline
```dart
if (!isAvailable) {
  _showErrorDialog(
    'Ollama Nao Disponivel',
    'O Ollama nao esta rodando. Inicie o servico com:\n\nollama serve',
  );
}
```

### Erro de Streaming
```dart
try {
  await for (final token in stream) {
    // processar
  }
} catch (e) {
  // Remover mensagem placeholder
  // Mostrar dialog de erro
}
```

### Timeout
```dart
BaseOptions(
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(minutes: 5),
)
```

## Persistencia

### Chaves de SharedPreferences

```dart
static const String _historyKey = 'ollama_chat_history';
static const String _configKey = 'ollama_config';
```

### Formato de Persistencia

**Historico:**
```json
[
  {
    "role": "user",
    "content": "Ola!",
    "timestamp": "2026-01-19T10:30:00.000Z"
  },
  {
    "role": "assistant",
    "content": "Ola! Como posso ajudar?",
    "timestamp": "2026-01-19T10:30:05.000Z"
  }
]
```

**Configuracao:**
```json
{
  "model": "llama2",
  "temperature": 0.7,
  "num_predict": 2048,
  "top_p": 0.9,
  "top_k": 40
}
```

## Performance

### Otimizacoes Implementadas

1. **Streaming Incremental**
   - Tokens processados individualmente
   - UI atualizada a cada token
   - Sem bloqueio da thread principal

2. **Lazy Loading**
   - Modelos carregados sob demanda
   - Inicializacao assincrona
   - Cache de configuracoes

3. **Scroll Automatico**
   - PostFrameCallback para evitar jank
   - Animacao suave (300ms)
   - Scroll apenas quando necessario

## Debugging

### Logs do Service

```dart
// Add logging interceptor
_dio.interceptors.add(
  LogInterceptor(
    requestBody: true,
    responseBody: false, // Nao logar streaming
    error: true,
  ),
);
```

### Verificar Ollama

```bash
# Status
curl http://localhost:11434/api/tags

# Testar geracao
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Ola!",
  "stream": false
}'
```

## Proximos Passos (Futuro)

1. **SQLite em vez de SharedPreferences**
   - Historico mais robusto
   - Busca por mensagens antigas
   - Sessoes multiplas

2. **Upload de Imagens**
   - Modelos vision (llava)
   - Analise de fotos do casal
   - Contexto visual

3. **Parametros Avancados**
   - Repeat penalty
   - Stop sequences
   - System prompts customizados

4. **Export/Import**
   - Exportar conversas
   - Backup de historico
   - Compartilhamento

## Troubleshooting

### Ollama nao conecta

1. Verificar se servico esta rodando:
   ```bash
   ps aux | grep ollama
   ```

2. Verificar porta 11434:
   ```bash
   netstat -an | grep 11434
   ```

3. Reiniciar servico:
   ```bash
   pkill ollama
   ollama serve
   ```

### Streaming nao funciona

1. Verificar formato de resposta do Ollama
2. Logs do Dio interceptor
3. Testar com curl primeiro

### Modelos nao aparecem

1. Listar modelos no terminal:
   ```bash
   ollama list
   ```

2. Baixar modelo se necessario:
   ```bash
   ollama pull llama2
   ```

## Referencias

- [Ollama API Docs](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Dio Package](https://pub.dev/packages/dio)
- [Riverpod Docs](https://riverpod.dev)
- [Flutter Streaming](https://dart.dev/tutorials/language/streams)
