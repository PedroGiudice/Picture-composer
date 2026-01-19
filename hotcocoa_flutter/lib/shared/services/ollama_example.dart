// EXEMPLO DE USO DO OLLAMA SERVICE
// Este arquivo demonstra como usar o OllamaService em diferentes contextos

import 'ollama_service.dart';

/// Exemplo 1: Uso basico com streaming
Future<void> exemploBasicoStreaming() async {
  final service = OllamaService();
  await service.init();

  // Verificar se Ollama esta disponivel
  final disponivel = await service.isAvailable();
  if (!disponivel) {
    print('Ollama nao esta rodando!');
    return;
  }

  // Gerar resposta com streaming
  print('Usuario: Ola, como voce esta?');
  print('Assistente: ');

  final stream = service.generateStream(
    prompt: 'Ola, como voce esta?',
    includeHistory: false,
  );

  await for (final token in stream) {
    print(token);
  }

  print('\n---');
}

/// Exemplo 2: Uso com historico de contexto
Future<void> exemploComHistorico() async {
  final service = OllamaService();
  await service.init();

  // Primeira mensagem
  print('Usuario: Qual eh a capital do Brasil?');
  print('Assistente: ');

  var stream = service.generateStream(
    prompt: 'Qual eh a capital do Brasil?',
    includeHistory: true,
  );

  await for (final token in stream) {
    print(token);
  }

  print('\n---');

  // Segunda mensagem com contexto
  print('Usuario: E a populacao?');
  print('Assistente: ');

  stream = service.generateStream(
    prompt: 'E a populacao?',
    includeHistory: true, // Vai incluir a pergunta anterior
  );

  await for (final token in stream) {
    print(token);
  }

  print('\n---');
}

/// Exemplo 3: Configuracoes customizadas
Future<void> exemploComConfiguracoes() async {
  final service = OllamaService();
  await service.init();

  // Configurar temperatura baixa para respostas mais deterministicas
  final config = OllamaConfig(
    model: 'llama2',
    temperature: 0.3, // Mais conservador
    maxTokens: 1024,
    topP: 0.9,
    topK: 40,
  );

  await service.saveConfig(config);

  print('Usando modelo: ${config.model}');
  print('Temperatura: ${config.temperature}');
  print('---');

  final stream = service.generateStream(
    prompt: 'Explique o teorema de Pitagoras.',
    includeHistory: false,
  );

  await for (final token in stream) {
    print(token);
  }

  print('\n---');
}

/// Exemplo 4: Listar modelos disponiveis
Future<void> exemploListarModelos() async {
  final service = OllamaService();
  await service.init();

  try {
    final modelos = await service.listModels();

    print('Modelos disponiveis:');
    for (final modelo in modelos) {
      print('- ${modelo.displayName} (${modelo.size ~/ (1024 * 1024)} MB)');
    }
  } catch (e) {
    print('Erro ao listar modelos: $e');
  }

  print('---');
}

/// Exemplo 5: Geracao nao-streaming (completa)
Future<void> exemploNaoStreaming() async {
  final service = OllamaService();
  await service.init();

  print('Usuario: Conte uma piada curta.');
  print('Assistente: ');

  final resposta = await service.generate(
    prompt: 'Conte uma piada curta.',
    includeHistory: false,
  );

  print(resposta);
  print('---');
}

/// Exemplo 6: Limpar historico
Future<void> exemploLimparHistorico() async {
  final service = OllamaService();
  await service.init();

  // Adicionar algumas mensagens
  await service.addToHistory('user', 'Primeira mensagem');
  await service.addToHistory('assistant', 'Primeira resposta');
  await service.addToHistory('user', 'Segunda mensagem');

  print('Historico antes de limpar: ${service.getHistory().length} mensagens');

  // Limpar historico
  await service.clearHistory();

  print('Historico depois de limpar: ${service.getHistory().length} mensagens');
  print('---');
}

/// Exemplo 7: Tratamento de erros
Future<void> exemploTratamentoErros() async {
  final service = OllamaService();
  await service.init();

  try {
    // Tentar usar modelo que nao existe
    final config = OllamaConfig(model: 'modelo-inexistente');
    await service.saveConfig(config);

    final stream = service.generateStream(
      prompt: 'Teste',
      includeHistory: false,
    );

    await for (final token in stream) {
      print(token);
    }
  } catch (e) {
    print('Erro capturado: $e');
    print('Isso eh esperado quando o modelo nao existe.');
  }

  print('---');
}

/// Exemplo 8: Usar diferentes temperaturas
Future<void> exemploTemperaturas() async {
  final service = OllamaService();
  await service.init();

  final prompt = 'Complete a frase: O ceu eh';

  // Temperatura baixa (mais deterministico)
  print('Com temperatura 0.1:');
  await service.saveConfig(
    const OllamaConfig(temperature: 0.1),
  );

  var stream = service.generateStream(prompt: prompt, includeHistory: false);
  await for (final token in stream) {
    print(token);
  }

  print('\n---');

  // Temperatura alta (mais criativo)
  print('Com temperatura 1.5:');
  await service.saveConfig(
    const OllamaConfig(temperature: 1.5),
  );

  stream = service.generateStream(prompt: prompt, includeHistory: false);
  await for (final token in stream) {
    print(token);
  }

  print('\n---');
}

// Main para rodar todos os exemplos
void main() async {
  print('=== EXEMPLOS DE USO DO OLLAMA SERVICE ===\n');

  print('Exemplo 1: Basico com Streaming');
  await exemploBasicoStreaming();
  print('');

  print('Exemplo 2: Com Historico de Contexto');
  await exemploComHistorico();
  print('');

  print('Exemplo 3: Configuracoes Customizadas');
  await exemploComConfiguracoes();
  print('');

  print('Exemplo 4: Listar Modelos Disponiveis');
  await exemploListarModelos();
  print('');

  print('Exemplo 5: Geracao Nao-Streaming');
  await exemploNaoStreaming();
  print('');

  print('Exemplo 6: Limpar Historico');
  await exemploLimparHistorico();
  print('');

  print('Exemplo 7: Tratamento de Erros');
  await exemploTratamentoErros();
  print('');

  print('Exemplo 8: Diferentes Temperaturas');
  await exemploTemperaturas();
  print('');

  print('=== FIM DOS EXEMPLOS ===');
}
