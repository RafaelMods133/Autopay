import { NextRequest, NextResponse } from "next/server";

// =============================================
// ENDPOINT CALLBACK QRIS dari SMP Payment
// URL: /api/callback-qris/[secret]
// Method: POST
// =============================================

// Simpan transaksi di memory (ganti dengan database di production)
// Untuk Vercel, gunakan Vercel KV, Supabase, atau PlanetScale
const transactions: Transaction[] = [];

interface Transaction {
  id: string;
  us_username: string;
  tr_id: string;
  issuer: string;
  PayerName: string;
  rrn: string;
  amount: string;
  saldo_akhir: number;
  timestamp: string;
  received_at: string;
}

// Simpan RRN yang sudah diproses (mencegah duplikat)
const processedRRN = new Set<string>();

export async function POST(
  request: NextRequest,
  { params }: { params: { secret: string } }
) {
  // 1. Validasi secret key
  const secret = params.secret;
  const validSecret = process.env.QRIS_CALLBACK_SECRET;

  if (!validSecret || secret !== validSecret) {
    return NextResponse.json(
      { responseCode: "4015200", responseMessage: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { responseCode: "4005200", responseMessage: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { us_username, tr_id, issuer, PayerName, rrn, amount, saldo_akhir, timestamp } = body;

  // 2. Validasi username
  const expectedUsername = process.env.SMP_USERNAME;
  if (expectedUsername && us_username !== expectedUsername) {
    return NextResponse.json(
      { responseCode: "4015200", responseMessage: "Username invalid" },
      { status: 401 }
    );
  }

  // 3. Cek duplikat RRN
  if (processedRRN.has(rrn)) {
    return NextResponse.json(
      { responseCode: "2005201", responseMessage: "RRN already processed" }
    );
  }

  // 4. Proses transaksi
  const transaction: Transaction = {
    id: tr_id,
    us_username,
    tr_id,
    issuer,
    PayerName,
    rrn,
    amount: amount?.value || "0",
    saldo_akhir,
    timestamp,
    received_at: new Date().toISOString(),
  };

  // Simpan transaksi
  transactions.push(transaction);
  processedRRN.add(rrn);

  // 5. Opsional: Kirim notifikasi Telegram
  await sendTelegramNotification(transaction);

  // Log ke console (bisa dilihat di Vercel Logs)
  console.log("✅ QRIS Diterima:", {
    dari: PayerName,
    nominal: `Rp ${parseFloat(amount?.value || "0").toLocaleString("id-ID")}`,
    saldo: saldo_akhir,
    waktu: timestamp,
  });

  // 6. Response sukses
  return NextResponse.json(
    { responseCode: "2005200", responseMessage: "Request has been processed" }
  );
}

// Ambil daftar transaksi (untuk dashboard)
export async function GET(
  request: NextRequest,
  { params }: { params: { secret: string } }
) {
  const secret = params.secret;
  if (secret !== process.env.QRIS_CALLBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    total: transactions.length,
    transactions: transactions.slice(-50).reverse(), // 50 terbaru
  });
}

// =============================================
// NOTIFIKASI TELEGRAM (Opsional)
// =============================================
async function sendTelegramNotification(trx: Transaction) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  const nominal = parseFloat(trx.amount).toLocaleString("id-ID");
  const message = `
💰 *QRIS Masuk!*
👤 Dari: ${trx.PayerName}
🏦 Via: ${trx.issuer}
💵 Nominal: Rp ${nominal}
💼 Saldo: Rp ${trx.saldo_akhir.toLocaleString("id-ID")}
🕐 Waktu: ${trx.timestamp}
🔑 TrxID: ${trx.tr_id}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}
