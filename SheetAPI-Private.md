Berikut adalah dokumen utuh **Product Requirement Document (PRD)** dan **Technical Specification** untuk aplikasi Sheet-to-API pribadi Anda. Dokumen ini menggabungkan semua komponen yang telah kita bahas dari awal hingga akhir.

---

# PRD & Technical Spec: SheetAPI (Private Tool)

## 1. Identitas Produk

* **Nama Produk:** SheetAPI
* **Deskripsi:** No-code API Gateway yang mengubah Google Sheets menjadi RESTful JSON API secara instan.
* **Teknologi Utama:** Next.js (App Router), Supabase (Auth & DB), Google Sheets API, Vercel.
* **Tujuan:** Penggunaan pribadi untuk mempercepat prototyping dan manajemen data aplikasi tanpa backend rumit.

---

## 2. Arsitektur Sistem

Aplikasi berjalan sebagai *Proxy* antara aplikasi klien dan Google Sheets.

1. **Frontend:** Next.js Dashboard untuk manajemen proyek.
2. **Auth:** Supabase Auth dengan Google Provider + OAuth Scopes (Sheets Access).
3. **Database:** Supabase PostgreSQL untuk menyimpan metadata proyek dan token.
4. **API Gateway:** Next.js Route Handlers sebagai jembatan transformasi data.

---

## 3. Skema Database (Supabase SQL)

```sql
-- 1. Tabel Proyek (Sesuai Tab Settings)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Endpoint (Sesuai Tab API)
CREATE TABLE endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sheet_name TEXT NOT NULL,
  is_get_enabled BOOLEAN DEFAULT true,
  is_post_enabled BOOLEAN DEFAULT false,
  is_put_enabled BOOLEAN DEFAULT false,
  is_delete_enabled BOOLEAN DEFAULT false
);

-- 3. Tabel Autentikasi API
CREATE TABLE project_auth (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  auth_type TEXT DEFAULT 'none', -- none, basic, bearer
  auth_config JSONB 
);

```

---

## 4. Logika Inti (The Engine)

### A. Data Transformer (Array to JSON)

Mengonversi baris mentah Google Sheets menjadi objek JSON yang rapi sesuai format Sheety.

```typescript
// lib/transformer.ts
export function transformRowsToJSON(rows: any[][], sheetName: string) {
  if (!rows || rows.length === 0) return { [sheetName]: [] };

  const headers = rows[0].map(h => h.toString().trim());
  
  const data = rows.slice(1).map((row, index) => {
    const obj: any = { id: index + 2 }; 
    headers.forEach((header, i) => {
      let value = row[i];
      if (!isNaN(value) && value !== "") value = Number(value);
      obj[header] = value;
    });
    return obj;
  });

  return { [sheetName]: data };
}

```

### B. Route Handler (GET & POST)

Endpoint dinamis: `/api/v1/[projectId]/[sheetName]`

```typescript
// app/api/v1/[projectId]/[sheetName]/route.ts
// Logika mencakup:
// 1. Validasi metadata di Supabase.
// 2. Koneksi ke Google Sheets API menggunakan refresh_token.
// 3. GET: Fetch data & Transform ke JSON.
// 4. POST: Append data berdasarkan urutan kolom header.

```

---

## 5. Antarmuka Pengguna (UI/UX)

### A. Halaman List Project

Menampilkan semua spreadsheet yang terhubung dalam bentuk Grid Card yang minimalis.

* **Fitur:** Search bar, View mode (Grid/List), Status indikator jumlah sheet.

### B. Dashboard Project

Terdiri dari 3 Tab utama (meniru vibe Sheety):

1. **Tab API:** Daftar endpoint (tab sheet), toggle metode HTTP (GET/POST/dll), dan Copy-to-clipboard URL.
2. **Tab Authentication:** Pengaturan keamanan (None, Basic Auth, Bearer Token).
3. **Tab Settings:** Mengubah nama proyek dan sinkronisasi ulang ID Spreadsheet.

### C. Modal "New Project"

Input form sederhana untuk memasukkan URL Google Sheets. Sistem akan otomatis mengekstrak ID dan mendeteksi semua tab di dalamnya.

---

## 6. Alur Keamanan (Security Flow)

1. **Google OAuth:** Meminta izin `https://www.googleapis.com/auth/spreadsheets`.
2. **Token Management:** Menyimpan Refresh Token secara aman di database untuk akses berkelanjutan.
3. **API Security:** Validasi header `Authorization` pada setiap request API eksternal jika fitur keamanan diaktifkan.

---

## 7. Rencana Deployment

* **Platform:** Vercel.
* **Environment Variables:**
Key;Value
NEXT_PUBLIC_SUPABASE_URL;https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY;your_anon_key
SUPABASE_SERVICE_ROLE_KEY;your_service_role_key
GOOGLE_CLIENT_ID;your_google_client_id
GOOGLE_CLIENT_SECRET;your_google_client_secret



---

**Dokumen Selesai.** Apakah Anda ingin saya membantu dengan langkah teknis spesifik berikutnya, seperti cara melakukan konfigurasi **Google Cloud Console** untuk mendapatkan `Client ID` dan `Secret` tersebut?