# Guia de Teste - Integracao Ollama

## Pre-Requisitos

1. Ollama instalado e rodando
2. Pelo menos um modelo baixado (ex: llama2)
3. Flutter configurado corretamente

## Setup Inicial

### 1. Instalar e Configurar Ollama

```bash
# Instalar Ollama (se ainda nao tiver)
curl -fsSL https://ollama.ai/install.sh | sh

# Iniciar servico
ollama serve

# Em outro terminal, baixar modelo
ollama pull llama2

# Verificar modelos instalados
ollama list
```

### 2. Preparar Projeto Flutter

```bash
cd hotcocoa_flutter
flutter pub get
flutter run -d linux  # ou macos, windows
```

## Casos de Teste

### Teste 1: Verificar Status do Ollama

**Objetivo:** Garantir que o app detecta se Ollama esta online/offline

**Passos:**
1. Abra o app com Ollama rodando
2. Navegue para a pagina de Chat
3. Observe o indicador de status no header

**Resultado Esperado:**
- Circulo verde com texto "Ollama Online"

**Teste Negativo:**
1. Pare o servico Ollama: `pkill ollama`
2. Recarregue a pagina de Chat
3. Observe o indicador de status

**Resultado Esperado:**
- Circulo vermelho com texto "Ollama Offline"

---

### Teste 2: Enviar Mensagem Simples

**Objetivo:** Testar comunicacao basica e streaming

**Passos:**
1. Certifique-se que Ollama esta online
2. Digite: "Ola, como voce esta?"
3. Pressione Enter ou clique no botao de enviar
4. Observe a resposta chegando

**Resultado Esperado:**
- Mensagem do usuario aparece imediatamente
- Mensagem do assistente comeca vazia com spinner
- Tokens aparecem um a um em tempo real
- Spinner desaparece quando terminar
- Scroll automatico para o fim da conversa

---

### Teste 3: Conversacao com Contexto

**Objetivo:** Verificar se historico eh mantido

**Passos:**
1. Digite: "Qual eh a capital do Brasil?"
2. Aguarde resposta
3. Digite: "E a populacao dessa cidade?"
4. Aguarde resposta

**Resultado Esperado:**
- Segunda pergunta eh respondida no contexto da primeira
- Ollama entende que "essa cidade" se refere a Brasilia
- Historico eh mantido entre mensagens

---

### Teste 4: Selecionar Modelo Diferente

**Objetivo:** Testar selecao de modelos

**Passos:**
1. Clique no botao de configuracoes (engrenagem)
2. Observe dropdown de modelos
3. Selecione um modelo diferente
4. Feche o modal
5. Envie uma mensagem

**Resultado Esperado:**
- Dropdown mostra todos os modelos disponiveis
- Modelo atual esta selecionado por padrao
- Mudanca de modelo eh aplicada imediatamente
- Resposta vem do novo modelo

**Nota:** Se tiver apenas 1 modelo, baixe outro:
```bash
ollama pull mistral
```

---

### Teste 5: Ajustar Temperatura

**Objetivo:** Verificar configuracoes de geracao

**Passos:**
1. Abra configuracoes
2. Mova slider de temperatura para 0.1
3. Feche modal
4. Digite: "Complete: O ceu eh"
5. Aguarde resposta
6. Repita com temperatura 1.5

**Resultado Esperado:**
- Com temperatura baixa (0.1): resposta mais previsivel/generica
- Com temperatura alta (1.5): resposta mais criativa/variada
- Valores sao persistidos entre sessoes

---

### Teste 6: Ajustar Tokens Maximos

**Objetivo:** Limitar tamanho da resposta

**Passos:**
1. Abra configuracoes
2. Mova slider de tokens para 256
3. Digite: "Escreva um conto longo sobre aventuras"
4. Observe que resposta eh cortada cedo

**Resultado Esperado:**
- Resposta para em ~256 tokens
- Nao gera texto infinito

---

### Teste 7: Limpar Historico

**Objetivo:** Testar limpeza de contexto

**Passos:**
1. Envie algumas mensagens
2. Clique no botao de deletar (lixeira)
3. Confirme no dialog
4. Observe a lista de mensagens

**Resultado Esperado:**
- Dialog de confirmacao aparece
- Todas as mensagens desaparecem
- Estado vazio eh mostrado
- Proxima mensagem nao tem contexto anterior

---

### Teste 8: Persistencia de Historico

**Objetivo:** Verificar se historico eh salvo

**Passos:**
1. Envie 3-4 mensagens
2. Feche o app completamente
3. Reabra o app
4. Navegue para Chat

**Resultado Esperado:**
- Todas as mensagens anteriores estao visiveis
- Ordem esta correta
- Pode continuar a conversa

---

### Teste 9: Persistencia de Configuracoes

**Objetivo:** Verificar se settings sao salvos

**Passos:**
1. Configure modelo para "mistral"
2. Configure temperatura para 0.8
3. Configure tokens para 1024
4. Feche o app
5. Reabra e veja configuracoes

**Resultado Esperado:**
- Modelo ainda eh "mistral"
- Temperatura ainda eh 0.8
- Tokens ainda eh 1024

---

### Teste 10: Ollama Offline Durante Envio

**Objetivo:** Testar tratamento de erro

**Passos:**
1. Digite uma mensagem
2. ANTES de enviar, pare o Ollama em outro terminal
3. Envie a mensagem

**Resultado Esperado:**
- Dialog de erro aparece
- Mensagem clara: "Ollama nao esta rodando..."
- Mensagem do usuario permanece na lista
- Nao adiciona resposta vazia

---

### Teste 11: Resposta Longa com Scroll

**Objetivo:** Testar scroll automatico

**Passos:**
1. Digite: "Escreva um poema longo de 20 estrofes"
2. Observe o comportamento da lista

**Resultado Esperado:**
- Lista faz scroll automaticamente conforme texto chega
- Sempre mostra o fim da resposta
- Scroll eh suave (sem saltos)

---

### Teste 12: Envios Multiplos Rapidos

**Objetivo:** Testar protecao contra spam

**Passos:**
1. Digite uma mensagem
2. Enquanto streaming, tente enviar outra

**Resultado Esperado:**
- Input fica desabilitado durante streaming
- Botao de enviar fica cinza
- Nao permite enviar ate terminar

---

### Teste 13: Mensagens Vazias

**Objetivo:** Validacao de input

**Passos:**
1. Tente enviar mensagem vazia (apenas Enter)
2. Tente enviar apenas espacos

**Resultado Esperado:**
- Nada acontece
- Nenhuma mensagem eh adicionada
- Input nao eh limpo

---

### Teste 14: Estado Vazio Inicial

**Objetivo:** UI sem mensagens

**Passos:**
1. Limpe todo historico
2. Observe o estado vazio

**Resultado Esperado:**
- Icone de chat cinza
- Texto: "Inicie uma conversa com Ollama"
- Subtexto: "Digite uma mensagem para comecar"

---

### Teste 15: Formato de Resposta Complexa

**Objetivo:** Testar parsing de diferentes tipos de resposta

**Passos:**
1. Digite: "Liste 5 linguagens de programacao em formato markdown"
2. Observe como markdown eh renderizado

**Resultado Esperado:**
- Texto eh exibido corretamente
- Formatacao basica funciona (se suportada)
- Nenhum crash ou erro de parsing

---

## Casos de Teste de Stress

### Teste 16: Modelo Inexistente

**Objetivo:** Robustez contra configuracao invalida

**Passos:**
1. Modifique SharedPreferences manualmente (ou hack):
   - Set model para "modelo-que-nao-existe"
2. Tente enviar mensagem

**Resultado Esperado:**
- Erro gracioso
- Mensagem clara de erro
- Nao crasha o app

---

### Teste 17: Conexao Intermitente

**Objetivo:** Testar resiliencia

**Passos:**
1. Inicie streaming de resposta longa
2. Pare Ollama no meio
3. Observe comportamento

**Resultado Esperado:**
- Streaming para
- Erro eh capturado
- Mensagem parcial permanece ou eh removida
- Dialog de erro aparece

---

### Teste 18: Historico Grande

**Objetivo:** Performance com muitas mensagens

**Passos:**
1. Envie 50+ mensagens
2. Observe scroll
3. Observe performance

**Resultado Esperado:**
- Scroll permanece fluido
- Nao ha lag perceptivel
- ListView renderiza eficientemente

---

## Validacao de Codigo

### Checklist de Qualidade

- [ ] Nenhum warning critico no `flutter analyze`
- [ ] Nenhum `print` em producao (apenas debug)
- [ ] Tratamento de erro em todas as async calls
- [ ] Dispose de controllers no dispose()
- [ ] StreamSubscriptions canceladas adequadamente
- [ ] SharedPreferences inicializado antes de uso
- [ ] Tipos bem definidos (sem `dynamic` desnecessario)

### Testes Unitarios (Futuro)

```bash
# Quando testes forem implementados
flutter test test/ollama_service_test.dart
```

---

## Troubleshooting

### Problema: "Ollama nao esta rodando"

**Solucao:**
```bash
# Verificar processo
ps aux | grep ollama

# Iniciar servico
ollama serve

# Verificar porta
netstat -an | grep 11434
```

### Problema: Modelos nao aparecem

**Solucao:**
```bash
# Listar modelos
ollama list

# Baixar modelo
ollama pull llama2
```

### Problema: Streaming nao funciona

**Solucao:**
1. Verificar logs do Dio
2. Testar endpoint com curl:
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Teste",
  "stream": true
}'
```

### Problema: Historico nao persiste

**Solucao:**
1. Verificar SharedPreferences:
```bash
# Linux
cat ~/.local/share/hotcocoa_flutter/shared_preferences.json

# Procurar chave "ollama_chat_history"
```

### Problema: Configuracoes nao salvam

**Solucao:**
1. Verificar init() do service
2. Verificar await em saveConfig()
3. Logs do SharedPreferences

---

## Metricas de Sucesso

Considere a integracao bem-sucedida se:

- [ ] Todos os 15 testes principais passam
- [ ] Streaming funciona em tempo real
- [ ] Historico persiste corretamente
- [ ] Configuracoes sao salvas e restauradas
- [ ] Erros sao tratados graciosamente
- [ ] UI permanece responsiva durante streaming
- [ ] Nenhum crash durante testes de stress
- [ ] Performance aceitavel com historico grande

---

## Proximos Passos Apos Validacao

1. Implementar testes automatizados
2. Adicionar suporte a imagens (llava)
3. Melhorar renderizacao de markdown
4. Adicionar export/import de conversas
5. Implementar SQLite para historico mais robusto
