import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hotcocoa_flutter/core/theme/app_theme.dart';
import 'package:hotcocoa_flutter/shared/providers/providers.dart';

/// Dialog para configurar credenciais do Google
class GoogleCredentialsDialog extends ConsumerStatefulWidget {
  const GoogleCredentialsDialog({super.key});

  @override
  ConsumerState<GoogleCredentialsDialog> createState() =>
      _GoogleCredentialsDialogState();
}

class _GoogleCredentialsDialogState
    extends ConsumerState<GoogleCredentialsDialog> {
  final _formKey = GlobalKey<FormState>();
  final _clientIdController = TextEditingController();
  final _apiKeyController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadExistingCredentials();
  }

  Future<void> _loadExistingCredentials() async {
    final service = ref.read(googleServiceProvider);
    final creds = await service.getCredentials();
    if (creds != null && mounted) {
      setState(() {
        _clientIdController.text = creds['clientId'] ?? '';
        _apiKeyController.text = creds['apiKey'] ?? '';
      });
    }
  }

  @override
  void dispose() {
    _clientIdController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  Future<void> _saveCredentials() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final service = ref.read(googleServiceProvider);
      await service.saveCredentials(
        clientId: _clientIdController.text.trim(),
        apiKey: _apiKeyController.text.trim(),
      );

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Credenciais salvas com sucesso'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao salvar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: context.surfaceColor,
      title: const Text('Configurar Google'),
      content: SizedBox(
        width: 500,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Para usar a integracao com Google Drive/Photos, configure suas credenciais:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.white70,
                    ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _clientIdController,
                decoration: InputDecoration(
                  labelText: 'Client ID',
                  hintText: 'xxxx.apps.googleusercontent.com',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Client ID eh obrigatorio';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _apiKeyController,
                decoration: InputDecoration(
                  labelText: 'API Key',
                  hintText: 'AIza...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'API Key eh obrigatoria';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.white10,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 16,
                          color: context.primaryColor,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Como obter:',
                          style: Theme.of(context)
                              .textTheme
                              .labelMedium
                              ?.copyWith(
                                color: context.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '1. Acesse console.cloud.google.com\n'
                      '2. Crie um projeto ou selecione existente\n'
                      '3. Ative Google Drive API e Photos Library API\n'
                      '4. Crie credenciais OAuth 2.0\n'
                      '5. Copie Client ID e API Key',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.white50,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context, false),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _saveCredentials,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Salvar'),
        ),
      ],
    );
  }
}
