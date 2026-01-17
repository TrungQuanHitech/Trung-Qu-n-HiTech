
import { Transaction, TelegramConfig, TransactionType } from "../types";
import { formatCurrency, TRANSACTION_TYPE_LABELS } from "../constants";

export const sendTelegramMessage = async (config: TelegramConfig, transaction: Transaction) => {
  if (!config.enabled) return;

  if (!config.botToken || !config.chatId) {
    console.warn("⚠️ THẤT BẠI: Telegram đang BẬT nhưng thiếu Bot Token hoặc Chat ID.");
    return;
  }

  const isSale = transaction.type === TransactionType.SALE;
  const isPurchase = transaction.type === TransactionType.PURCHASE;
  
  if (!isSale && !isPurchase) return; 

  const emoji = isSale ? "🔔" : "📦";
  const title = isSale ? "ĐƠN BÁN HÀNG MỚI" : "ĐƠN NHẬP HÀNG MỚI";
  
  let itemDetails = "";
  transaction.items?.forEach(item => {
    itemDetails += `\n🔹 ${item.name} | SL: ${item.quantity}`;
  });

  const message = `
${emoji} *${title}*
━━━━━━━━━━━━━━━
🆔 *Mã:* #${transaction.id}
👤 *Đối tác:* ${transaction.contactName}
📅 *Ngày:* ${new Date(transaction.date).toLocaleString('vi-VN')}

🛒 *Sản phẩm:*${itemDetails}

💰 *Tổng tiền:* ${formatCurrency(transaction.total)}
✅ *Đã trả:* ${formatCurrency(transaction.paidAmount)}
⚠️ *Còn nợ:* ${formatCurrency(transaction.debtAmount)}
${transaction.note ? `\n📝 *Ghi chú:* ${transaction.note}` : ""}
━━━━━━━━━━━━━━━
🚀 _Hệ thống SmartBiz ERP_
  `.trim();

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  
  try {
    console.log(`🚀 Đang gửi thông báo đơn #${transaction.id} đến ChatID: ${config.chatId}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    const result = await response.json();
    if (result.ok) {
      console.log("✅ Đã gửi Telegram thành công!");
    } else {
      console.error("❌ Telegram API Error:", result.description);
    }
  } catch (error) {
    console.error("❌ Lỗi mạng khi gửi Telegram:", error);
  }
};

export const testTelegramConnection = async (token: string, chatId: string) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ *KẾT NỐI THÀNH CÔNG!*\nSmartBiz ERP đã liên kết với Bot của bạn.\nMọi thông báo đơn hàng sẽ được gửi tại đây.",
        parse_mode: 'Markdown',
      }),
    });
    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Test Telegram Error:", error);
    return false;
  }
};
