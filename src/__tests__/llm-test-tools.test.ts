import { AssertionsMet, ResponseAssertions, Tone } from '../index';

import { TEST_RESPONSES } from './test-data';

describe('LLM Test Tools', () => {
  let tester: ResponseAssertions;

  beforeEach(() => {
    tester = new ResponseAssertions();
  });

  describe('Response Assertions', () => {
    it('should correctly identify a perfect response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.perfectResponse.text,
        prompt: TEST_RESPONSES.perfectResponse.assertions,
      });

      expect(response.assertionsMet).toBe(AssertionsMet.yes);
      expect(response.score).toBeGreaterThanOrEqual(9); // Should be high score
      expect(response.tone).toBe(Tone.neutral);
      expect(response.isFactual).toBe(true);
    }, 30000);

    it('should correctly identify a partial response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.partialResponse.text,
        prompt: TEST_RESPONSES.partialResponse.assertions,
      });

      expect(response.assertionsMet).toBe(AssertionsMet.no);
      expect(response.score).toBeLessThan(7); // Should be mid-range score
      expect(response.tone).toBe(Tone.neutral);
    }, 30000);

    it('should correctly identify a poor response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.poorResponse.text,
        prompt: TEST_RESPONSES.poorResponse.assertions,
      });

      expect(response.assertionsMet).toBe(AssertionsMet.no);
      expect(response.score).toBeLessThanOrEqual(5); // Should be low score
      expect(response.tone).toBe(Tone.neutral);
    }, 30000);

    it('should correctly identify a happy response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.happyResponse.text,
        prompt: TEST_RESPONSES.happyResponse.assertions,
      });

      expect(response.assertionsMet).toBe(AssertionsMet.yes);
      expect(response.score).toBeGreaterThanOrEqual(9);
      expect(response.tone).toBe(Tone.happy); // Should be happy tone
    }, 30000);

    it('should correctly identify a neutral response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.neutralResponse.text,
        prompt: TEST_RESPONSES.neutralResponse.assertions,
      });

      expect(response.assertionsMet).toBe(AssertionsMet.yes);
      expect(response.score).toBeGreaterThanOrEqual(9);
      expect(response.tone).toBe(Tone.neutral); // Should be neutral tone
    }, 30000);

    it('should correctly identify a factual response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.factualResponse.text,
        prompt: TEST_RESPONSES.factualResponse.assertions,
      });

      expect(response.isFactual).toBe(true); // Should be factual
      expect(response.assertionsMet).toBe(AssertionsMet.yes);
      expect(response.score).toBeGreaterThanOrEqual(9);
    }, 30000);

    it('should correctly identify a non-factual response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.nonFactualResponse.text,
        prompt: TEST_RESPONSES.nonFactualResponse.assertions,
      });

      expect(response.isFactual).toBe(false); // Should be non-factual
      expect(response.assertionsMet).toBe(AssertionsMet.no);
      expect(response.score).toBeLessThan(7);
    }, 30000);
  });

  describe('Custom Matcher Tests', () => {
    it('should work with toSatisfyAssertions for a perfect response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.perfectResponse.text,
        prompt: TEST_RESPONSES.perfectResponse.assertions,
      });

      expect(response).toSatisfyAssertions({
        assertionsMet: AssertionsMet.yes,
        tone: Tone.neutral,
        score: 8,
        isFactual: true,
      });
    }, 30000);

    it('should throw an error with toSatisfyAssertions for a partial response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.partialResponse.text,
        prompt: TEST_RESPONSES.partialResponse.assertions,
      });

      expect(() => {
        expect(response).toSatisfyAssertions({
          assertionsMet: AssertionsMet.yes,
          tone: Tone.neutral,
          score: 8,
          isFactual: true,
        });
      }).toThrow();
    }, 30000);

    it('should throw an error with toSatisfyAssertions for a poor response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.poorResponse.text,
        prompt: TEST_RESPONSES.poorResponse.assertions,
      });

      expect(() => {
        expect(response).toSatisfyAssertions({
          assertionsMet: AssertionsMet.yes,
          tone: Tone.neutral,
          score: 8,
          isFactual: true,
        });
      }).toThrow();
    }, 30000);

    it('should work with toSatisfyAssertions for a happy response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.happyResponse.text,
        prompt: TEST_RESPONSES.happyResponse.assertions,
      });

      expect(response).toSatisfyAssertions({
        assertionsMet: AssertionsMet.yes,
        tone: Tone.happy,
        score: 8,
      });
    }, 30000);

    it('should work with toSatisfyAssertions for a neutral response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.neutralResponse.text,
        prompt: TEST_RESPONSES.neutralResponse.assertions,
      });

      expect(response).toSatisfyAssertions({
        assertionsMet: AssertionsMet.yes,
        tone: Tone.neutral,
        score: 8,
        isFactual: true,
      });
    }, 30000);

    it('should work with toSatisfyAssertions for a factual response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.factualResponse.text,
        prompt: TEST_RESPONSES.factualResponse.assertions,
      });

      expect(response).toSatisfyAssertions({
        isFactual: true,
      });
    }, 30000);

    it('should throw error with toSatisfyAssertions for a non-factual response', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.nonFactualResponse.text,
        prompt: TEST_RESPONSES.nonFactualResponse.assertions,
      });

      expect(() => {
        expect(response).toSatisfyAssertions({
          isFactual: true,
        });
      }).toThrow();
    }, 30000);
  });

  describe('Override Model', () => {
    it('should work with toSatisfyAssertions for a different model (Nova Micro)', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.perfectResponse.text,
        prompt: TEST_RESPONSES.perfectResponse.assertions,
        modelId: 'us.amazon.nova-micro-v1:0', // using AWS Nova Micro as an override
      });

      expect(response).toSatisfyAssertions({
        assertionsMet: AssertionsMet.yes,
        tone: Tone.neutral,
        score: 8,
        isFactual: true,
      });
    }, 30000);

    it('should work with toSatisfyAssertions for a different model (Anthropic Claude Sonnet 3)', async () => {
      const response = await tester.responseAssertions({
        text: TEST_RESPONSES.perfectResponse.text,
        prompt: TEST_RESPONSES.perfectResponse.assertions,
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0', // using Anthropic Claude Sonnet 3 as an override
      });

      expect(response).toSatisfyAssertions({
        assertionsMet: AssertionsMet.yes,
        tone: Tone.neutral,
        score: 8,
        isFactual: true,
      });
    }, 30000);
  });
});
