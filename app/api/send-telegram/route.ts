import { NextRequest, NextResponse } from 'next/server';

/**
 * Send Telegram Message via Bot API
 * POST /api/send-telegram
 *
 * Body:
 * {
 *   message: string,
 *   chatId?: string (overrides env)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, chatId: customChatId } = await request.json();

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid message field' },
        { status: 400 }
      );
    }

    // Get credentials from env (server-side keys take priority over public)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = customChatId || process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    // Demo fallback — log but don't fail (mirrors send-email behaviour)
    if (!botToken || !chatId) {
      console.log('[send-telegram] DEMO MODE — would send:', message.slice(0, 80));
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo mode: Telegram message logged but not sent. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to env to enable.',
        text: message,
      });
    }

    // Validate message length (Telegram limit is 4096 characters)
    if (message.length > 4096) {
      return NextResponse.json(
        { error: 'Message too long (max 4096 characters)' },
        { status: 400 }
      );
    }

    // Send via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // Allow HTML formatting: <b>, <i>, <a href="...">, etc.
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { error: data.description || 'Failed to send message', success: false },
        { status: 400 }
      );
    }

    console.log(`✅ Telegram message sent to ${chatId}:`, data.result.message_id);
    return NextResponse.json({
      success: true,
      message_id: data.result.message_id,
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send telegram message',
        success: false,
      },
      { status: 500 }
    );
  }
}
