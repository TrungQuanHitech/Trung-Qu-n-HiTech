
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction, Contact } from "../types";

export const getAIInsights = async (products: Product[], transactions: Transaction[], contacts: Contact[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Dựa trên dữ liệu doanh nghiệp sau, hãy đưa ra phân tích ngắn gọn (tối đa 3-4 ý) về:
    1. Mặt hàng nào đang bán chạy hoặc cần nhập thêm (cảnh báo tồn kho).
    2. Tình hình dòng tiền và công nợ (ai nợ nhiều, rủi ro gì).
    3. Gợi ý chiến lược kinh doanh cho tuần tới.

    Dữ liệu sản phẩm: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, min: p.minStock })))}
    Dữ liệu giao dịch gần đây: ${JSON.stringify(transactions.slice(0, 5).map(t => ({ type: t.type, total: t.total })))}
    Dữ liệu công nợ: ${JSON.stringify(contacts.filter(c => c.balance > 0).map(c => ({ name: c.name, type: c.type, balance: c.balance })))}

    Hãy trả lời bằng Tiếng Việt, định dạng Markdown chuyên nghiệp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Không thể kết nối với AI để lấy phân tích lúc này.";
  }
};
