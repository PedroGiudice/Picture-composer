import 'package:flutter_test/flutter_test.dart';
import 'package:hotcocoa_flutter/shared/services/api_service.dart';

void main() {
  group('IntimacyResponse', () {
    test('fromJson mapeia campos do backend corretamente', () {
      final json = {
        'challenge_title': 'Titulo Teste',
        'challenge_text': 'Texto Teste',
        'rationale': 'Racional Teste',
        'intensity': 7,
        'duration_seconds': 180,
        'visual_description': 'Descricao visual',
        'error': null,
      };

      final response = IntimacyResponse.fromJson(json);

      expect(response.instructionTitlePtBr, 'Titulo Teste');
      expect(response.instructionTextPtBr, 'Texto Teste');
      expect(response.clinicalRationalePtBr, 'Racional Teste');
      expect(response.intensityMetric, 7);
      expect(response.durationSec, 180);
      expect(response.visualDescription, 'Descricao visual');
      expect(response.error, null);
    });

    test('fromJson suporta campos legacy', () {
      final json = {
        'instruction_title_pt_br': 'Titulo Legacy',
        'instruction_text_pt_br': 'Texto Legacy',
        'clinical_rationale_pt_br': 'Racional Legacy',
        'intensity_metric': 5,
        'duration_sec': 120,
      };

      final response = IntimacyResponse.fromJson(json);

      expect(response.instructionTitlePtBr, 'Titulo Legacy');
      expect(response.instructionTextPtBr, 'Texto Legacy');
      expect(response.clinicalRationalePtBr, 'Racional Legacy');
      expect(response.intensityMetric, 5);
      expect(response.durationSec, 120);
    });

    test('fromJson usa fallback para campos ausentes', () {
      final json = <String, dynamic>{
        // Campos minimos
      };

      final response = IntimacyResponse.fromJson(json);

      expect(response.instructionTitlePtBr, '');
      expect(response.instructionTextPtBr, '');
      expect(response.clinicalRationalePtBr, '');
      expect(response.intensityMetric, 0);
      expect(response.durationSec, 120);
    });

    test('fallback retorna resposta padrao', () {
      final response = IntimacyResponse.fallback(8);

      expect(response.instructionTitlePtBr, 'Protocolo de Contato Visual');
      expect(response.intensityMetric, 8);
      expect(response.durationSec, 120);
      expect(response.error, 'Backend offline - usando fallback local');
    });

    test('toJson serializa corretamente', () {
      final response = IntimacyResponse(
        instructionTitlePtBr: 'Titulo',
        instructionTextPtBr: 'Texto',
        clinicalRationalePtBr: 'Racional',
        intensityMetric: 6,
        durationSec: 150,
      );

      final json = response.toJson();

      expect(json['instruction_title_pt_br'], 'Titulo');
      expect(json['instruction_text_pt_br'], 'Texto');
      expect(json['clinical_rationale_pt_br'], 'Racional');
      expect(json['intensity_metric'], 6);
      expect(json['duration_sec'], 150);
    });

    test('toJson serializa campos opcionais como null', () {
      final response = IntimacyResponse(
        instructionTitlePtBr: 'Titulo',
        instructionTextPtBr: 'Texto',
        clinicalRationalePtBr: 'Racional',
        intensityMetric: 6,
        durationSec: 150,
        visualDescription: null,
        visionModelUsed: null,
        textModelUsed: null,
        error: null,
      );

      final json = response.toJson();

      expect(json['visual_description'], null);
      expect(json['vision_model_used'], null);
      expect(json['text_model_used'], null);
      expect(json['error'], null);
    });

    test('roundtrip: toJson -> fromJson preserva dados', () {
      final original = IntimacyResponse(
        instructionTitlePtBr: 'Titulo Original',
        instructionTextPtBr: 'Texto Original',
        clinicalRationalePtBr: 'Racional Original',
        intensityMetric: 9,
        durationSec: 200,
        visualDescription: 'Descricao',
        visionModelUsed: 'Qwen2.5-VL',
        textModelUsed: 'Qwen2.5-72B',
        error: null,
      );

      final json = original.toJson();
      final recovered = IntimacyResponse.fromJson(json);

      expect(recovered.instructionTitlePtBr, original.instructionTitlePtBr);
      expect(recovered.instructionTextPtBr, original.instructionTextPtBr);
      expect(recovered.clinicalRationalePtBr, original.clinicalRationalePtBr);
      expect(recovered.intensityMetric, original.intensityMetric);
      expect(recovered.durationSec, original.durationSec);
      expect(recovered.visualDescription, original.visualDescription);
      expect(recovered.visionModelUsed, original.visionModelUsed);
      expect(recovered.textModelUsed, original.textModelUsed);
      expect(recovered.error, original.error);
    });
  });

  // Nota: Testes de integracao com API real (processSession, analyzeMosaic)
  // devem ser feitos separadamente e nao incluidos em testes unitarios
  // (requerem rede, backend ativo e tempo de execucao longo)
  //
  // Testes de cache e retry tambem requerem mocks de Dio e SharedPreferences
  // que estao fora do escopo de testes unitarios simples.
}
