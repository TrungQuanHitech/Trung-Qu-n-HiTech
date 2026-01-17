
import { Product, Transaction, Contact } from "../types";
import { TRANSACTION_TYPE_LABELS, CONTACT_TYPE_LABELS } from "../constants";

export const syncToGoogleSheet = async (
  scriptUrl: string | null,
  data: {
    products: Product[];
    transactions: Transaction[];
    contacts: Contact[];
  }
) => {
  // Luôn lưu local trước như một bản backup
  localStorage.setItem('smartbiz_last_sync_data', JSON.stringify({
    timestamp: new Date().toISOString(),
    data
  }));

  if (!scriptUrl) {
    console.warn("Chưa cấu hình Script URL. Dữ liệu chỉ được lưu vào Local Storage.");
    return { success: true, localOnly: true, timestamp: new Date().toISOString() };
  }

  // Chuyển đổi dữ liệu sang tiếng Việt cho Google Sheets
  const formattedTransactions = data.transactions.map(t => ({
    ...t,
    type: TRANSACTION_TYPE_LABELS[t.type] || t.type,
    // Format thêm ngày tháng cho dễ đọc trong Sheets
    dateFormatted: new Date(t.date).toLocaleString('vi-VN')
  }));

  const formattedContacts = data.contacts.map(c => ({
    ...c,
    type: CONTACT_TYPE_LABELS[c.type] || c.type
  }));

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps Script Web App yêu cầu no-cors để tránh lỗi tiền kiểm CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync',
        products: data.products,
        transactions: formattedTransactions,
        contacts: formattedContacts
      }),
    });

    // Vì mode 'no-cors' trả về opaque response, chúng ta giả định thành công nếu không có throw error
    return { success: true, localOnly: false, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Lỗi đồng bộ Google Sheet:", error);
    throw error;
  }
};

export const fetchFromGoogleSheet = async (scriptUrl: string | null) => {
  // Apps Script doGet cần trả về JSON dữ liệu
  if (scriptUrl) {
    try {
      const response = await fetch(`${scriptUrl}?action=get`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData && cloudData.products) return cloudData;
      }
    } catch (e) {
      console.warn("Không thể tải từ Cloud, chuyển sang Local Cache.");
    }
  }

  // Fallback về Local Cache
  const cached = localStorage.getItem('smartbiz_last_sync_data');
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed.data;
  }
  return null;
};
