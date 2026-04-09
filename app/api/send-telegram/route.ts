export const dynamic = "force-static";
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

    // Get credentials from env
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = customChatId || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured');
      return NextResponse.json(
        { error: 'Telegram service not configured' },
        { status: 500 }
      );
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
