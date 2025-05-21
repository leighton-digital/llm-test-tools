export const TEST_RESPONSES = {
  // Example of a high-quality response that meets all assertions
  perfectResponse: {
    text: "The Eiffel Tower is 324 meters tall and was built in 1889 for the World's Fair in Paris. It's made of wrought iron and has three levels open to the public.",
    assertions:
      "The response should include:\n- The exact height of the Eiffel Tower\n- The year it was built\n- The material it's made of\n- Number of levels open to the public",
  },

  // Example of a response that partially meets assertions
  partialResponse: {
    text: "The Eiffel Tower is a famous landmark in Paris. It's made of metal and has multiple levels for visitors.",
    assertions:
      "The response should include:\n- The exact height of the Eiffel Tower\n- The year it was built\n- The material it's made of\n- Number of levels open to the public",
  },

  // Example of a response that doesn't meet assertions
  poorResponse: {
    text: 'The Eiffel Tower is a landmark in Paris.',
    assertions:
      "The response should include:\n- The exact height of the Eiffel Tower\n- The year it was built\n- The material it's made of\n- Number of levels open to the public",
  },

  // Example with specific tone
  happyResponse: {
    text: "The Eiffel Tower is an amazing landmark! It's so beautiful and inspiring. The views from the top are breathtaking!",
    assertions:
      'The response should be positive and enthusiastic about the Eiffel Tower',
  },

  // Example with neutral tone
  neutralResponse: {
    text: "The Eiffel Tower is 324 meters tall. It was built in 1889. It's made of wrought iron and has three levels open to the public.",
    assertions:
      'The response should be factual and neutral about the Eiffel Tower',
  },

  // Example of factual response
  factualResponse: {
    text: "The Eiffel Tower is 324 meters tall and was built in 1889 for the World's Fair in Paris. It's made of wrought iron and has three levels open to the public.",
    assertions:
      'The response should be factual and include accurate information about the Eiffel Tower',
  },

  // Example of non-factual response
  nonFactualResponse: {
    text: "The Eiffel Tower is about 800 meters tall and was built in the 2000s. It's made of metal and has several levels for visitors.",
    assertions:
      'The response should be factual and include accurate information about the Eiffel Tower',
  },
};
