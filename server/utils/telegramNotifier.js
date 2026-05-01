const TELEGRAM_API_BASE = 'https://api.telegram.org';

function escapeMarkdown(value) {
  if (value === null || value === undefined) return 'N/A';
  return String(value).replace(/[\*\_\[\]\(\)\`]/g, '\\$&');
}

function resolveItems(orderData) {
  if (Array.isArray(orderData?.items) && orderData.items.length > 0) {
    return orderData.items.map((item) => ({
      name: item?.name || item?.product?.name || 'Item',
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price),
    }));
  }

  if (Array.isArray(orderData?.products) && orderData.products.length > 0) {
    return orderData.products.map((item) => ({
      name: item?.name || 'Item',
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price),
    }));
  }

  if (orderData?.productName) {
    return [{
      name: orderData.productName,
      quantity: Number(orderData?.quantity) || 0,
      price: Number(orderData?.price),
    }];
  }

  return [];
}

function formatItems(items) {
  if (!Array.isArray(items) || items.length === 0) return ['- N/A'];

  return items.map((item) => {
    const name = item?.name || 'Item';
    const quantity = Number(item?.quantity) || 0;
    const price = Number(item?.price);
    const priceText = Number.isFinite(price) ? ` @ BDT ${price.toFixed(2)}` : '';

    return `- ${escapeMarkdown(name)} x${quantity}${priceText}`;
  });
}

function resolveTotal(orderData, items) {
  const total = Number(orderData?.pricing?.total);
  if (Number.isFinite(total)) return total;

  const pipelineTotal = Number(orderData?.total);
  if (Number.isFinite(pipelineTotal)) return pipelineTotal;

  const safeItems = Array.isArray(items) ? items : [];
  return safeItems.reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return sum + price * quantity;
  }, 0);
}

/**
 * Send a Telegram notification for a newly created order.
 * Errors are logged and swallowed so order creation is never blocked.
 */
export async function sendTelegramOrderNotification(orderData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set - skipping');
    return { success: false, reason: 'not_configured' };
  }

  const customerName =
    orderData?.shippingAddress?.name ||
    orderData?.user?.name ||
    orderData?.customerName ||
    'N/A';
  const orderId = orderData?.orderNumber || orderData?.orderId || orderData?._id || 'N/A';
  const normalizedItems = resolveItems(orderData);
  const totalAmount = resolveTotal(orderData, normalizedItems);

  const itemLines = formatItems(normalizedItems);
  const totalText = Number.isFinite(totalAmount) ? `BDT ${totalAmount.toFixed(2)}` : 'N/A';

  const message = [
    '*New Order Placed*',
    '',
    `*Customer Name:* ${escapeMarkdown(customerName)}`,
    `*Order ID:* ${escapeMarkdown(orderId)}`,
    '*Items Purchased:*',
    ...itemLines,
    `*Total Amount:* ${escapeMarkdown(totalText)}`,
  ].join('\n');

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('[Telegram] Notification failed:', response.status, responseText);
      return { success: false, reason: responseText };
    }

    return { success: true };
  } catch (err) {
    console.error('[Telegram] Notification failed:', err?.message || err);
    return { success: false, reason: err?.message || 'unknown_error' };
  }
}
