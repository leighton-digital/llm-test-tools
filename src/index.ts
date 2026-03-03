import {
  BedrockRuntimeClient,
  type ContentBlock,
  ConversationRole,
  ConverseCommand,
  type ConverseCommandInput,
} from '@aws-sdk/client-bedrock-runtime';

import { expect } from '@jest/globals';

/**
 * Configuration object for the Bedrock API request
 * @property contentType - The content type of the request
 * @property accept - The accept header for the response
 * @property prompt - The prompt text to be analysed
 * @property maxTokensToSample - Maximum number of tokens to generate
 * @property temperature - Sampling temperature for response generation
 * @property topP - Top-p (nucleus) sampling parameter
 * @property stopSequences - Optional array of stop sequences
 */
type ActionPrompt = {
  contentType: string;
  accept: string;
  prompt: string;
  maxTokensToSample: number;
  temperature: number;
  topP: number;
  stopSequences?: string[];
};

/**
 * Response from the model containing the generated text
 * @property text - The generated text response
 * @property modelId - The ID of the model used
 */
type ModelResponse = {
  text: string;
  modelId: string;
};

type ModelResponses = {
  modelResponse: ModelResponse;
  assertionResponse: AssertionResponse;
  body: string;
};

export enum Tone {
  neutral = 'neutral',
  happy = 'happy',
  sad = 'sad',
  angry = 'angry',
}

/**
 * Input parameters for response assertions
 * @property prompt - The assertions to check against the text
 * @property text - The text to analyze
 * @property modelId - Optional model ID to use (defaults to amazon.nova-pro-v1:0)
 * @property temperature - Optional sampling temperature (defaults to 0.3)
 * @property maxTokensToSample - Optional maximum tokens to generate (defaults to 500)
 * @property topP - Optional top-p sampling parameter (defaults to 0.7)
 */
export interface ResponseAssertionsInput {
  /** The assertions to check against the text */
  prompt: string;
  /** The text to analyse */
  text: string;
  /** Optional model ID to use (defaults to amazon.nova-pro-v1:0) */
  modelId?: string;
  /** Optional sampling temperature (defaults to 0.3) */
  temperature?: number;
  /** Optional maximum tokens to generate (defaults to 500) */
  maxTokensToSample?: number;
  /** Optional top-p sampling parameter (defaults to 0.7) */
  topP?: number;
}

export const AssertionsMet = {
  yes: true,
  no: false,
};

/**
 * Response object containing the analysis results
 * @property assertionsMet - Whether all assertions were met
 * @property score - Confidence score (0-10)
 * @property tone - The detected tone of the response
 * @property explanation - Explanation of the scoring
 * @property isFactual - Whether the text is factually accurate
 */
export type AssertionResponse = {
  /** Whether all assertions were met */
  assertionsMet: (typeof AssertionsMet)[keyof typeof AssertionsMet];
  /** Confidence score (0-10) */
  score: number;
  /** The detected tone of the response */
  tone: Tone;
  /** Explanation of the scoring */
  explanation: string;
  /** Whether the text is factually accurate */
  isFactual: boolean;
};

/**
 * Main class for analysing AI responses against assertions
 */
export class ResponseAssertions {
  /** AWS Bedrock client instance */
  private bedrock: BedrockRuntimeClient;

  constructor(options: { region?: string } = {}) {
    const { region = 'us-east-1' } = options;
    this.bedrock = new BedrockRuntimeClient({ region });
  }

  private async invokeBedrockApi(
    actionPrompt: ActionPrompt,
    modelId: string,
  ): Promise<ModelResponses> {
    const { prompt, temperature, maxTokensToSample, topP } = actionPrompt;

    const commandInput: ConverseCommandInput = {
      modelId: modelId,
      messages: [
        {
          role: ConversationRole.USER,
          content: [
            {
              text: prompt,
            },
          ],
        },
      ],
      inferenceConfig: {
        maxTokens: maxTokensToSample,
        temperature,
        topP,
      },
    };

    const command = new ConverseCommand(commandInput);
    const response = await this.bedrock.send(command);

    const result =
      (response.output?.message?.content as ContentBlock[])[0]?.text || '';

    return {
      body: result,
      modelResponse: {
        text: result,
        modelId,
      },
      assertionResponse: {
        assertionsMet: AssertionsMet.no,
        score: 0,
        tone: Tone.neutral,
        explanation: 'No assertions provided',
        isFactual: false,
      },
    };
  }

  public async responseAssertions(
    options: ResponseAssertionsInput,
  ): Promise<AssertionResponse> {
    const {
      text,
      prompt,
      modelId = 'amazon.nova-pro-v1:0',
      temperature = 0.3,
      maxTokensToSample = 500,
      topP = 0.7,
    } = options;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const assertionPrompt = `Analyze the following text and assertions to return a single JSON object with the following structure:

{
    "assertionsMet": boolean, // true if all assertions are met
    "score": number,          // confidence score 0-10
    "tone": string,           // neutral, happy, sad, or angry
    "explanation": string,    // explanation of scoring
    "isFactual": boolean      // true only if ALL information in the text is factually correct and accurate
}

SCORING GUIDELINES:
10: All assertions perfectly match. Text is completely factual and accurate.
7-9: Most assertions strongly match. Text is mostly factual with minor inaccuracies.
4-6: Some assertions partially match. Text has significant factual errors.
0-3: Few or no assertions match. Text is largely incorrect or misleading.

IMPORTANT: For "isFactual", evaluate the ENTIRE text carefully. The response should be marked as non-factual if ANY part of the text contains:
- Inaccurate measurements or numbers
- Incorrect dates or time periods
- Incorrect material descriptions
- Misleading approximations
- Any factual errors or inaccuracies

Example scoring:

- "Water boils at 100 degrees Celsius at sea level." = Score 10, isFactual: true
- "Water boils at around 95 degrees Celsius at sea level." = Score 7, isFactual: false
- "Water boils at 150 degrees Celsius at sea level." = Score 2, isFactual: false


Text to analyze:
"${text}"

Assertions to check:
${prompt}

Assistant:`;

    const actionPrompt: ActionPrompt = {
      contentType: 'application/json',
      accept: 'application/json',
      prompt: assertionPrompt,
      maxTokensToSample,
      temperature,
      topP,
      stopSequences: ['\n\nHuman:', '\n\nAssistant:'],
    };

    const result = await this.invokeBedrockApi(actionPrompt, modelId);

    const cleanedResponse = result.body
      .replace(/```json\s*/, '') // Remove markdown code block start
      .replace(/```\s*/, '') // Remove markdown code block end
      .replace(/\n/g, '') // Remove newlines
      .trim();

    // Extract JSON object from the response
    const match = cleanedResponse.match(/\{.*\}/);
    if (!match) {
      throw new Error('Invalid response format: no JSON object found');
    }

    const response = JSON.parse(match[0]);

    return {
      assertionsMet: response.assertionsMet,
      score: response.score,
      tone: response.tone as Tone,
      explanation: response.explanation,
      isFactual: response.isFactual,
    };
  }
}

// Extend Jest's global expect with type declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toSatisfyAssertions(expected: Partial<AssertionResponse>): R;
    }
  }
}

// Extend Jest's global expect
expect.extend({
  toSatisfyAssertions(
    received: AssertionResponse,
    expected: Partial<AssertionResponse>,
  ): jest.CustomMatcherResult {
    const pass = Object.entries(expected).every(([key, value]) => {
      if (key === 'assertionsMet') {
        return received.assertionsMet === value;
      }
      if (key === 'score') {
        return received.score >= (value as number);
      }
      if (key === 'isFactual') {
        return received.isFactual === value;
      }
      return received[key as keyof AssertionResponse] === value;
    });

    if (pass) {
      return {
        pass: true,
        message: () =>
          `Expected ${this.utils.printReceived(
            received,
          )} not to satisfy ${this.utils.printExpected(expected)}`,
      };
    }
    return {
      pass: false,
      message: () =>
        `Expected ${this.utils.printReceived(
          received,
        )} to satisfy ${this.utils.printExpected(expected)}`,
    };
  },
});
