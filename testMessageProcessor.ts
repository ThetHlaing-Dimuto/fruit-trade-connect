import { processMessage } from './src/utils/messageProcessor';

async function runTests() {
  const tests = [
    {
      input: 'Add supplier Golden Orchard from Thailand offering mango and durian',
      description: 'Add Supplier (should use local logic)'
    },
    {
      input: 'Add buyer FreshMart SG interested in mango and pineapple',
      description: 'Add Buyer (should use local logic)'
    },
    {
      input: 'What is the weather today?',
      description: 'General Chat (should call Vertex AI)'
    }
  ];

  for (const test of tests) {
    console.log(`\n--- ${test.description} ---`);
    const result = await processMessage(test.input);
    console.log('Input:', test.input);
    console.log('Output:', result);
  }
}

runTests(); 