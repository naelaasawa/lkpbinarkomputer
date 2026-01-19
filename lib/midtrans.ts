import Midtrans from "midtrans-client";

export const snap = new Midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
});

export const coreApi = new Midtrans.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
});
