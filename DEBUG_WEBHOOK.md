# Panduan Debugging Auto-Enrollment

## Kemungkinan Penyebab

Ada 2 kemungkinan kenapa course tidak ter-enroll setelah bayar:

### 1. **Webhook Tidak Dipanggil** (Paling Umum)
Midtrans tidak bisa memanggil webhook Anda karena berjalan di `localhost`.

**Solusi:**
1. Gunakan **ngrok** untuk expose localhost:
```bash
ngrok http 3000
```

2. Copy URL ngrok (contoh: `https://abcd-1234.ngrok.io`)

3. Update Midtrans Dashboard:
   - Login ke [Midtrans Dashboard](https://dashboard.midtrans.com)
   - Settings → Configuration
   - Set **Payment Notification URL** ke: `https://your-ngrok-url.ngrok.io/api/midtrans/webhook`
   - Save

4. Coba bayar lagi dan lihat log di terminal

### 2. **Error di Webhook**
Ada error saat proses webhook.

**Cara Debug:**
Saya sudah menambahkan logging lengkap. Lihat di terminal saat payment:
- 🔔 = Webhook diterima
- ✅ = Proses berhasil
- ❌ = Ada error

## Cara Test Lokal (Tanpa Ngrok)

Jika ingin test tanpa ngrok, bisa manual trigger webhook:

```bash
# Setelah bayar, dapatkan order_id dari database Purchase
# Lalu panggil webhook manual dengan curl atau Postman
```

**POST** `http://localhost:3000/api/midtrans/webhook`
```json
{
  "order_id": "ORDER_ID_DARI_DATABASE",
  "status_code": "200",
  "gross_amount": "50000.00",
  "signature_key": "SIGNATURE_KEY",
  "transaction_status": "settlement"
}
```

## Check Database

Lihat status Purchase di database:
```sql
SELECT * FROM Purchase ORDER BY createdAt DESC LIMIT 5;
SELECT * FROM Enrollment ORDER BY createdAt DESC LIMIT 5;
```

Jika `status` = "pending", webhook belum dipanggil.
Jika `status` = "settlement", tapi tidak ada Enrollment, ada error di webhook.
