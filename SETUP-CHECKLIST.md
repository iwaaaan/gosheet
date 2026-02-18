# 📋 Setup Checklist - SheetAPI

Ikuti checklist ini untuk menyelesaikan setup dan deployment SheetAPI.

**Production URL**: https://sheetapi-lake.vercel.app

---

## ✅ Step 1: Setup Supabase Database

**Estimasi waktu: 5 menit**

1. **Buka Supabase Dashboard**
   - [ ] Buka: https://app.supabase.com/project/your_project_id
   - [ ] Login dengan akun Anda

2. **Jalankan SQL Schema**
   - [ ] Klik menu **SQL Editor** di sidebar kiri
   - [ ] Klik tombol **New query**
   - [ ] Buka file `supabase/schema.sql` di project Anda
   - [ ] Copy seluruh isi file tersebut
   - [ ] Paste ke SQL Editor
   - [ ] Klik tombol **Run** (atau tekan Cmd/Ctrl + Enter)
   - [ ] Pastikan muncul pesan "Success. No rows returned"

**✓ Selesai jika:** Anda melihat pesan success dan tidak ada error

---

## ✅ Step 2: Configure Google OAuth di Supabase

**Estimasi waktu: 3 menit**

1. **Enable Google Provider**
   - [ ] Di Supabase Dashboard, klik **Authentication** > **Providers**
   - [ ] Scroll ke bagian **Google** dan klik
   - [ ] Toggle **Enable Sign in with Google** ke posisi **ON**

2. **Masukkan Credentials**
   - [ ] **Client ID**: Paste nilai berikut
     ```
     your_google_client_id
     ```
   - [ ] **Client Secret**: Paste nilai berikut
     ```
     your_google_client_secret
     ```

3. **Configure Scopes**
   - [ ] Di bagian **Scopes**, tambahkan scope berikut:
     ```
     https://www.googleapis.com/auth/spreadsheets
     ```

4. **Save Settings**
   - [ ] Klik tombol **Save**

**✓ Selesai jika:** Google provider sudah enabled dan credentials tersimpan

---

## ✅ Step 3: Update Redirect URLs di Supabase

**Estimasi waktu: 2 menit**

1. **Buka URL Configuration**
   - [ ] Di Supabase Dashboard, klik **Authentication** > **URL Configuration**

2. **Update Site URL**
   - [ ] Di field **Site URL**, masukkan:
     ```
     https://sheetapi-lake.vercel.app
     ```

3. **Add Redirect URLs**
   - [ ] Di field **Redirect URLs**, tambahkan kedua URL berikut (pisahkan dengan enter):
     ```
     https://sheetapi-lake.vercel.app/**
     https://sheetapi-lake.vercel.app/auth/callback
     ```

4. **Save Configuration**
   - [ ] Klik **Save**

**✓ Selesai jika:** Site URL dan Redirect URLs sudah tersimpan

---

## ✅ Step 4: Update Google OAuth Redirect URIs

**Estimasi waktu: 3 menit**

1. **Buka Google Cloud Console**
   - [ ] Buka: https://console.cloud.google.com
   - [ ] Pastikan Anda sudah login
   - [ ] Pilih project yang sesuai (jika ada multiple projects)

2. **Navigate to Credentials**
   - [ ] Klik menu ☰ (hamburger) di kiri atas
   - [ ] Pilih **APIs & Services** > **Credentials**

3. **Edit OAuth 2.0 Client**
   - [ ] Cari OAuth 2.0 Client dengan ID: `570085171-3gar936knosb1ca5mvs82pk480t92un9`
   - [ ] Klik nama client tersebut untuk edit

4. **Add Authorized Redirect URIs**
   - [ ] Scroll ke bagian **Authorized redirect URIs**
   - [ ] Klik **+ ADD URI** dan tambahkan:
     ```
     https://sheetapi-lake.vercel.app/auth/callback
     ```
   - [ ] Klik **+ ADD URI** lagi dan tambahkan:
     ```
     https://your_project_id.supabase.co/auth/v1/callback
     ```

5. **Save Changes**
   - [ ] Scroll ke bawah dan klik **Save**
   - [ ] Tunggu sampai muncul notifikasi "OAuth client updated"

**✓ Selesai jika:** Kedua redirect URIs sudah tersimpan

---

## ✅ Step 5: Test Login Functionality

**Estimasi waktu: 2 menit**

1. **Open Application**
   - [ ] Buka browser baru (atau incognito mode)
   - [ ] Navigate ke: https://sheetapi-lake.vercel.app

2. **Test Login**
   - [ ] Klik tombol **Get Started**
   - [ ] Anda akan redirect ke halaman login
   - [ ] Klik **Continue with Google**
   - [ ] Pilih akun Google Anda
   - [ ] **PENTING**: Centang semua permissions yang diminta, terutama:
     - Access to Google Sheets
     - View and manage spreadsheets
   - [ ] Klik **Allow**

3. **Verify Dashboard Access**
   - [ ] Anda akan redirect ke dashboard
   - [ ] Pastikan Anda melihat halaman "Projects"
   - [ ] Email Anda muncul di navbar kanan atas

**✓ Selesai jika:** Anda berhasil login dan masuk ke dashboard

---

## ✅ Step 6: Create Test Project

**Estimasi waktu: 5 menit**

### Persiapan: Buat Test Google Sheet (jika belum punya)

1. **Create Google Sheet**
   - [ ] Buka: https://sheets.google.com
   - [ ] Klik **+ Blank** untuk sheet baru
   - [ ] Rename menjadi "SheetAPI Test"

2. **Add Sample Data**
   - [ ] Di Sheet1, tambahkan data contoh:
     | name    | email              | age |
     |---------|-------------------|-----|
     | John    | john@example.com  | 30  |
     | Jane    | jane@example.com  | 25  |
     | Bob     | bob@example.com   | 35  |

   - [ ] Copy URL dari Google Sheet (dari address bar)

### Create Project di SheetAPI

1. **New Project**
   - [ ] Di SheetAPI dashboard, klik tombol **+ New Project**

2. **Fill Project Details**
   - [ ] **Project Name**: Masukkan nama, contoh: `Test API`
   - [ ] **Google Sheets URL**: Paste URL sheet yang tadi dibuat
   - [ ] Klik **Create Project**

3. **Verify Project Created**
   - [ ] Project baru muncul di dashboard
   - [ ] Klik project untuk masuk ke detail page
   - [ ] Pastikan tab **API** menampilkan endpoint untuk Sheet1

**✓ Selesai jika:** Project berhasil dibuat dan endpoint muncul

---

## ✅ Step 7: Test API Endpoints

**Estimasi waktu: 5 menit**

### Test GET Request

1. **Get API URL**
   - [ ] Di tab **API**, cari endpoint untuk Sheet1
   - [ ] Klik tombol **Copy** untuk copy URL
   - [ ] URL akan berbentuk: `https://sheetapi-lake.vercel.app/api/v1/{projectId}/Sheet1`

2. **Test in Browser**
   - [ ] Buka tab baru
   - [ ] Paste URL dan tekan Enter
   - [ ] Anda akan melihat JSON response seperti:
     ```json
     {
       "Sheet1": [
         {"id": 2, "name": "John", "email": "john@example.com", "age": 30},
         {"id": 3, "name": "Jane", "email": "jane@example.com", "age": 25},
         {"id": 4, "name": "Bob", "email": "bob@example.com", "age": 35}
       ]
     }
     ```

**✓ GET Test Passed jika:** JSON data muncul sesuai dengan data di Google Sheet

### Test POST Request (Optional)

1. **Enable POST Method**
   - [ ] Kembali ke SheetAPI dashboard > tab API
   - [ ] Klik tombol **POST** untuk enable POST method (akan berubah warna hijau)

2. **Test POST with curl**
   - [ ] Buka Terminal
   - [ ] Jalankan command (ganti {projectId} dengan ID project Anda):
     ```bash
     curl -X POST https://sheetapi-lake.vercel.app/api/v1/{projectId}/Sheet1 \
       -H "Content-Type: application/json" \
       -d '{"name": "Alice", "email": "alice@example.com", "age": 28}'
     ```

3. **Verify Data Added**
   - [ ] Buka Google Sheet Anda
   - [ ] Data "Alice" muncul di baris baru
   - [ ] Atau test GET lagi untuk lihat data terbaru

**✓ POST Test Passed jika:** Data baru muncul di Google Sheet

---

## 🎉 Deployment Complete!

Jika semua checklist di atas sudah ✓, aplikasi SheetAPI Anda sudah fully functional!

### Next Steps (Optional)

- [ ] Test PUT dan DELETE methods
- [ ] Configure authentication (Basic Auth atau Bearer Token) di tab **Authentication**
- [ ] Buat project lain dengan Google Sheets yang lebih kompleks
- [ ] Share API URL dengan team atau aplikasi lain

### Troubleshooting

**Jika login gagal:**
- Periksa kembali redirect URLs di Supabase dan Google Console
- Pastikan tidak ada typo di URLs
- Coba clear browser cache dan cookies

**Jika API tidak return data:**
- Pastikan Google Sheet accessible (tidak private)
- Cek console browser untuk error messages
- Pastikan Anda sudah grant permissions untuk Google Sheets saat login

**Jika POST gagal:**
- Pastikan POST method sudah enabled di tab API
- Cek format JSON request
- Pastikan headers `Content-Type: application/json` ada

### Support

Jika ada masalah, check:
- Vercel logs: https://vercel.com/iwans-projects-6621e8e9/sheetapi
- Supabase logs: https://app.supabase.com/project/your_project_id/logs/explorer

---

**Production URL**: https://sheetapi-lake.vercel.app
**Created**: 2026-01-03
