import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY || 'AIzaSyCsfaKmbrIeGs2wr54Ftf2y0pYJhi93QPE';
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
