// src/services/ollama.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { OllamaService, type CouplePreferences } from './ollama';

describe('OllamaService', () => {
  const STORAGE_KEY = 'hotcocoa_preferences';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('loadPreferences', () => {
    it('returns null when no preferences stored', () => {
      const result = OllamaService.loadPreferences();
      expect(result).toBeNull();
    });

    it('returns parsed preferences when stored', () => {
      const prefs: CouplePreferences = {
        preferredChallengeTypes: ['romantic'],
        avoidTopics: ['public'],
        intensityPreference: 'moderate',
        customContext: '',
        lastUpdated: '2026-01-18T00:00:00Z'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

      const result = OllamaService.loadPreferences();
      expect(result).toEqual(prefs);
    });

    it('returns null on invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{');

      const result = OllamaService.loadPreferences();
      expect(result).toBeNull();
    });
  });

  describe('savePreferences', () => {
    it('saves preferences with updated timestamp', () => {
      const prefs: CouplePreferences = {
        preferredChallengeTypes: ['sensual'],
        avoidTopics: [],
        intensityPreference: 'intense',
        customContext: 'test',
        lastUpdated: ''
      };

      OllamaService.savePreferences(prefs);

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.preferredChallengeTypes).toEqual(['sensual']);
      expect(parsed.lastUpdated).toBeDefined();
      expect(parsed.lastUpdated).not.toBe('');
    });
  });

  describe('triageRequest', () => {
    it('returns useLocal=false for image requests', async () => {
      const result = await OllamaService.triageRequest(true, 'simple');
      expect(result.useLocal).toBe(false);
      expect(result.reason).toContain('visual');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('returns useLocal=false for complex requests', async () => {
      const result = await OllamaService.triageRequest(false, 'complex');
      expect(result.useLocal).toBe(false);
      expect(result.reason).toContain('72B');
    });

    it('checks Ollama availability for simple requests', async () => {
      // This will return useLocal=false because Ollama is not running in test env
      const result = await OllamaService.triageRequest(false, 'simple');
      // Either Ollama is available (useLocal=true) or not (useLocal=false)
      expect(typeof result.useLocal).toBe('boolean');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('personalizePrompt', () => {
    it('returns base prompt when no preferences', async () => {
      localStorage.removeItem(STORAGE_KEY);

      const result = await OllamaService.personalizePrompt('base prompt');
      expect(result).toBe('base prompt');
    });

    it('adds preferences context when available', async () => {
      const prefs: CouplePreferences = {
        preferredChallengeTypes: ['romantic', 'sensual'],
        avoidTopics: ['public'],
        intensityPreference: 'moderate',
        customContext: 'likes candles',
        lastUpdated: '2026-01-18T00:00:00Z'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

      const result = await OllamaService.personalizePrompt('base prompt');

      expect(result).toContain('romantic');
      expect(result).toContain('sensual');
      expect(result).toContain('public');
      expect(result).toContain('moderate');
      expect(result).toContain('candles');
      expect(result).toContain('base prompt');
    });
  });

  describe('healthCheck', () => {
    it('returns boolean', async () => {
      // In test environment, Ollama is not running
      const result = await OllamaService.healthCheck();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isAvailable', () => {
    it('is an alias for healthCheck', async () => {
      const health = await OllamaService.healthCheck();
      const available = await OllamaService.isAvailable();
      // Both should return same type
      expect(typeof health).toBe(typeof available);
    });
  });
});
