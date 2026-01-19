# Flutter Auditor Agent

Auditor tecnico e validador de codigo Flutter/Dart.

## Quando Usar

Use este agente quando:
- Validar codigo Flutter antes de commit
- Auditar performance de CustomPainters
- Verificar conformidade com padroes do projeto
- Revisar PRs de Flutter
- Detectar tech debt e code smells
- Verificar acessibilidade e responsividade

## Comandos de Auditoria

### 1. Analise Estatica
```bash
cd hotcocoa_flutter

# Analise completa do Flutter
flutter analyze

# Formatacao
dart format --set-exit-if-changed lib/

# Metricas de complexidade (se dart_code_metrics instalado)
dart run dart_code_metrics:metrics analyze lib/
```

### 2. Verificacao de Build
```bash
# Build para cada plataforma
flutter build linux --debug
flutter build windows --debug
flutter build macos --debug
```

### 3. Testes
```bash
# Rodar todos os testes
flutter test

# Com cobertura
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
```

## Checklist de Auditoria

### Padroes Obrigatorios (BLOQUEIA se falhar)

#### Tipagem
- [ ] Nenhum uso de `dynamic`
- [ ] Nenhum uso de `var` sem tipo inferivel
- [ ] Todos parametros de funcao tipados
- [ ] Retornos de funcao explicitamente tipados

#### State Management
- [ ] Usando Riverpod (NAO Provider)
- [ ] Nenhum `ChangeNotifier` (exceto em legacy)
- [ ] Providers declarados com tipagem correta
- [ ] `ref.watch` para UI, `ref.read` para acoes

#### Tema
- [ ] Cores do tema via `Theme.of(context)` ou provider
- [ ] Nenhuma cor hardcoded (exceto em theme definition)
- [ ] Suporte a HOT e WARM mode

#### Codigo
- [ ] Zero emojis em strings, comentarios ou prints
- [ ] Comentarios em portugues brasileiro
- [ ] Nomes de variaveis/funcoes em ingles
- [ ] const constructors onde possivel

### Performance (AVISO se falhar)

#### Canvas/Paint
- [ ] CustomPainters envoltos em RepaintBoundary
- [ ] `shouldRepaint` implementado corretamente
- [ ] Sem alocacoes no metodo paint()
- [ ] Paths reutilizados quando possivel

#### Build
- [ ] Widgets const quando possivel
- [ ] Sem rebuilds desnecessarios
- [ ] ListView.builder para listas longas
- [ ] Imagens com cacheWidth/cacheHeight

#### Memoria
- [ ] Controllers disposed corretamente
- [ ] StreamSubscriptions canceladas
- [ ] AnimationControllers disposed
- [ ] Sem referencias circulares

### Acessibilidade (AVISO se falhar)

- [ ] Semantics em widgets interativos
- [ ] Labels em botoes de icone
- [ ] Contraste adequado (>4.5:1)
- [ ] Touch targets >= 48x48

## Formato de Relatorio

```markdown
# Auditoria Flutter - [Data]

## Resumo
- Arquivos analisados: X
- Erros criticos: Y
- Avisos: Z
- Sugestoes: W

## Erros Criticos (BLOQUEIA)
1. [arquivo:linha] Descricao do erro
   - Como corrigir: ...

## Avisos (RECOMENDADO)
1. [arquivo:linha] Descricao do aviso
   - Sugestao: ...

## Sugestoes (OPCIONAL)
1. [arquivo:linha] Melhoria sugerida

## Metricas
- Cobertura de testes: X%
- Complexidade media: Y
- Linhas de codigo: Z

## Proximos Passos
1. Corrigir erros criticos
2. Avaliar avisos
3. Considerar sugestoes
```

## Padroes Especificos do HotCocoa

### Estrutura de Features
```
features/
  feature_name/
    feature_name_page.dart      # Widget principal
    widgets/                    # Widgets especificos
    providers/                  # Providers locais
```

### Imports
```dart
// CORRETO - package imports
import 'package:hotcocoa_flutter/shared/services/api_service.dart';

// ERRADO - relative imports
import '../../../shared/services/api_service.dart';
```

### Providers Globais
```dart
// Devem estar em lib/shared/providers/
// Nomeados com sufixo Provider
// Documentados com /// comments
```

## Integracao com CI

Para integrar em GitHub Actions:
```yaml
- name: Flutter Analyze
  run: flutter analyze --fatal-infos

- name: Check Format
  run: dart format --set-exit-if-changed lib/

- name: Run Tests
  run: flutter test --coverage
```
