import { NextRequest, NextResponse } from "next/server";
import { sendGmailMessage, getConnectedGmailAccount } from "@/lib/gmail/oauth";

export async function POST(req: NextRequest) {
  try {
    const account = await getConnectedGmailAccount();
    if (!account) {
      return NextResponse.json(
        { error: "No Gmail account connected. Please connect your Gmail account first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const to = body.to || account.email; // Default to self-test
    const subject = body.subject || "Private Outreach Engine — Controlled Test Send";
    const bodyText =
      body.bodyText ||
      `Hello,\n\nThis is a controlled verification send from your Private Outreach Engine.\n\nConnected mailbox: ${account.email}\nSent timestamp: ${new Date().toISOString()}\n\nSending is working properly!`;

    const result = await sendGmailMessage({
      to,
      subject,
      bodyText,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      threadId: result.threadId,
      recipient: to,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Test send failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send email via Gmail API" },
      { status: 500 }
    );
  }
}
