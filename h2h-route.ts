import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// =============================================
// ENDPOINT TRANSAKSI H2H ke SMP Payment
// URL: /api/h2h/trx
// Method: POST
// =============================================

const SMP_API = "https://solusimediapulsa.com/api/h2h/trx";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, product, dest, idtrx } = body;

  if (!product || !dest || !idtrx) {
    return NextResponse.json(
      { error: "Parameter tidak lengkap: product, dest, idtrx wajib diisi" },
      { status: 400 }
    );
  }

  let url: string;

  if (type === "OTOMAX") {
    url = buildOtomaxURL(product, dest, idtrx);
  } else {
    // Default: IRS
    url = buildIRSURL(product, dest, idtrx);
  }

  try {
    const response = await fetch(url);
    const text = await response.text();

    return NextResponse.json({
      success: true,
      raw: text,
      url: url.replace(/pass=[^&]+/, "pass=***").replace(/password=[^&]+/, "password=***"),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke SMP Payment" },
      { status: 500 }
    );
  }
}

// =============================================
// BUILD URL TIPE IRS
// =============================================
function buildIRSURL(product: string, dest: string, idtrx: string): string {
  const id = process.env.H2H_ID!;
  const pin = process.env.H2H_PIN!;
  const pass = process.env.H2H_PASS!;
  const user = process.env.SMP_USERNAME!;

  const params = new URLSearchParams({
    id,
    pin,
    pass,
    kodeproduk: product,
    tujuan: dest,
    idtrx,
    user,
  });

  return `${SMP_API}?${params.toString()}`;
}

// =============================================
// BUILD URL TIPE OTOMAX
// =============================================
function buildOtomaxURL(product: string, dest: string, refID: string): string {
  const memberID = process.env.OTOMAX_MEMBER_ID!;
  const pin = process.env.OTOMAX_PIN!;
  const password = process.env.OTOMAX_PASSWORD!;

  // Buat signature SHA1 -> Base64url
  const signString = `${memberID}${pin}${password}${product}${dest}${refID}`;
  const sign = crypto
    .createHash("sha1")
    .update(signString)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const params = new URLSearchParams({
    product,
    dest,
    refID,
    memberID,
    sign,
    pin,
    password,
  });

  return `${SMP_API}?${params.toString()}`;
}
