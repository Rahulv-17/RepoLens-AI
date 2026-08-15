import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(key);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('SUCCESS:', result.response.text());
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}
test();
