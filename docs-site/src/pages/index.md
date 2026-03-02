<img width="50px" height="50px" align="right" alt="LLM Test Tools Logo" src="https://raw.githubusercontent.com/leighton-digital/llm-test-tools/main/images/llm-test-tools-logo.png?sanitize=true" title="Leighton LLM Test Tools"/>

# LLM Test Tools

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/leighton-digital/llm-test-tools/blob/master/LICENSE)
![Maintained](https://img.shields.io/maintenance/yes/2026)

A TypeScript library for testing AI responses using Amazon Bedrock Converse API under the hood. This package helps you validate AI-generated responses against specific assertions and analyse their tone, factual content, and confidence level.

## Features

- Test AI generated responses against your own assertions using the AWS Bedrock Converse API
- Built-in Jest custom matchers for easy assertions
- Support for any Amazon Bedrock models (Claude, Titan, etc.)
- Configurable parameters for model invocation (max tokens, temperature, etc.)
- Tone analysis (neutral, happy, sad, angry)
- Confidence scoring system (0-10 scale)
- Assertions on factual content
- TypeScript support with full type safety

## Installation

```bash
npm install @leighton-digital/llm-test-tools
```

## Usage

### Importing the Package

```javascript
import { ResponseAssertions, AssertionsMet, Tone } from 'llm-test-tools';
```

### Basic Example

```typescript
// Create a tester instance with optional AWS region configuration
const tester = new ResponseAssertions({ region: 'eu-west-1' }); // Specify region
// or
const tester = new ResponseAssertions(); // Uses default region 'us-east-1'

// Test an AI response (actual example text to assert on and the prompt assertions)
const assertionResponse = await tester.responseAssertions({
  text: 'Your AI generated text to validate',
  prompt: 'Your prompt text with your assertions',
});

// OR, test an AI response with optional parameters
const assertionResponse = await tester.responseAssertions({
  text: 'Your AI generated text to validate',
  prompt: 'Your prompt text with your assertions',
  modelId: 'anthropic.claude-3-sonnet-20240229', // Optional model override
  temperature: 0.7, // Optional
  maxTokensToSample: 500, // Optional
  topP: 0.9, // Optional
});

// Using custom Jest matcher test the response
expect(assertionResponse).toSatisfyAssertions({
  assertionsMet: AssertionsMet.yes,
  tone: Tone.neutral,
  score: 8, // minimum score
});

// OR, using standard Jest matchers
expect(assertionResponse.assertionsMet).toEqual(AssertionsMet.yes);
expect(assertionResponse.tone).toEqual(Tone.neutral);
expect(assertionResponse.score).toBeGreaterThanOrEqual(8);
expect(assertionResponse.isFactual).toEqual(true);
```

### Jest Matchers

The package includes custom Jest matchers:

```typescript
// Using the custom matcher
expect(assertionResponse).toSatisfyAssertions({
  assertionsMet: AssertionsMet.yes,
  tone: Tone.neutral,
  score: 8,
  isFactual: true,
});

// Or using standard Jest matchers
expect(assertionResponse.assertionsMet).toBe(AssertionsMet.yes);
expect(assertionResponse.tone).toBe(Tone.neutral);
expect(assertionResponse.score).toBeGreaterThanOrEqual(8);
expect(assertionResponse.isFactual).toEqual(true);
```

If we use the `toSatisfyAssertions` Jest matcher and the assertion fails, we will get information as to why as an explanation (for example):

```
● test › should assert that the text meets the correct assertions

Expected {"assertionsMet": false, "explanation": "The text describes a cat that is black and named Mittens. The assertion to check is that the cat is brown, which is not mentioned in the text. Therefore, the assertions are not met. The text is factually correct in describing the cat's color and name, but it does not address the assertion about the cat being brown. Hence, the score is low due to the lack of matching assertions.", "isFactual": true, "score": 2, "tone": "neutral"} to satisfy {"assertionsMet": true, "isFactual": true, "score": 8, "tone": "neutral"}
```

### Available Assertions Enums

The package provides several built-in assertion enums:

```typescript
// AssertionsMet enum
export const AssertionsMet = {
  yes: true,
  no: false,
};

// Tone enum
export enum Tone {
  neutral = 'neutral',
  happy = 'happy',
  sad = 'sad',
  angry = 'angry',
}
```

### Configuration Options

You can configure the following parameters when using `responseAssertions`:

```typescript
interface ResponseAssertionsInput {
  prompt: string; // The assertions to test against
  text: string; // The AI response text to test
  modelId?: string; // AWS Bedrock model ID (default: 'us.amazon.nova-premier-v1:0')
  maxTokensToSample?: number; // Maximum tokens to generate (default: 500)
  temperature?: number; // Temperature for response generation (default: 0.3)
  topP?: number; // Top-p sampling value (default: 0.7)
}
```

## Running Tests

To run the tests:

```bash
npm run test
```
or in watch mode

```bash
npm run test:watch
```

You can also run the tests with an AWS profile and AWS account ID as shown below:

```bash
AWS_PROFILE=my-profile AWS_ACCOUNT_ID=123456789123 AWS_REGION=us-east-1 npm run test
```

## Example Assertions

Here are some example assertion formats:

```typescript
// Perfect response assertions
"The response should include:\n- The exact height of the Eiffel Tower\n- The year it was built\n- The material it's made of\n- Number of levels open to the public";

// Tone-based assertions
'The response should be positive and enthusiastic about the Eiffel Tower';

// Partial assertions
"The response should at least mention:\n- The Eiffel Tower's location\n- Some interesting facts about it";
```

## Troubleshooting

1. If you don't have access to the model in the specified account you will get the following error:

```
AccessDeniedException: You don't have access to the model with the specified model ID.
```

Ensure that you go to the model access page in Amazon Bedrock and get the required access.

## Score Interpretation

The confidence score ranges from 0-10:

- 10: All assertions perfectly match
- 7-9: Most assertions strongly match
- 4-6: Some assertions partially match
- 0-3: Few or no assertions match

## Amazon Bedrock Setup

Make sure you have Amazon Bedrock set up with:

1. AWS credentials configured, or AWS profile stipulated, or environment variables set
2. Bedrock service enabled in your region
3. Model permissions configured

> Note: By default we use a model which has cross-region inference which means that if a model is not available in that region or is being throttled, Amazon Bedrock will use the same model in a different region: https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html

## License

MIT License - see the [LICENSE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

---

<img src="https://raw.githubusercontent.com/leighton-digital/lambda-toolkit/2578cda7dfd2a63e61912c1289d06f45f357616f/images/leighton-logo.svg" width="200" sanitize="true" />
