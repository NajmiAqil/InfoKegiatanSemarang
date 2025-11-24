# Kredensial Login Sistem Informasi Kegiatan

## Default Users

Database sudah di-seed dengan user berikut:

### 1. Atasan (Supervisor)
- **Username:** `hanry`
- **Password:** `hanry123`
- **Email:** hanry@diskominfo.semarang.go.id
- **Role:** Atasan
- **Status:** Approved
- **Akses:** Dashboard Atasan, approve/reject pendaftaran user baru

### 2. Bawahan (Subordinate) - Approved
- **Username:** `mahes`
- **Password:** `mahes123`
- **Email:** mahes@diskominfo.semarang.go.id
- **Role:** Bawahan
- **Status:** Approved
- **Akses:** Dashboard Bawahan, buat/edit/hapus kegiatan sendiri

### 3. Bawahan - Approved
- **Username:** `yani`
- **Password:** `yani123`
- **Email:** yani@diskominfo.semarang.go.id
- **Role:** Bawahan
- **Status:** Approved
- **Akses:** Dashboard Bawahan

### 4. Bawahan - Pending (Menunggu Approval)
- **Username:** `Aqil`
- **Password:** `najmiaqil2020`
- **Email:** aqil@example.com
- **Role:** Bawahan
- **Status:** Pending
- **Catatan:** Tidak bisa login sampai di-approve oleh Atasan

---

## Cara Setup Database

1. Reset database dan run migrations:
```bash
cd laravel-backend
php artisan migrate:fresh
```

2. Seed database dengan data default:
```bash
php artisan db:seed
```

Atau gabungkan keduanya:
```bash
php artisan migrate:fresh --seed
```

---

## Fitur Sistem

### Visibility Kegiatan:
- **Public:** Tampil di homepage untuk semua orang
- **Kantor:** Hanya tampil di dashboard Atasan & Bawahan (tidak di homepage)
- **Private:** Hanya tampil untuk pembuat kegiatan

### User Registration Flow:
1. User mendaftar via `/signup`
2. Status user = "pending"
3. Atasan login dan lihat tabel "Permintaan Akses"
4. Atasan approve/reject
5. Jika approve: user bisa login, email notifikasi terkirim
6. Jika reject: user tidak bisa login

### Sidebar Atasan:
- Menampilkan daftar bawahan yang sudah approved
- Klik nama bawahan untuk lihat semua kegiatan mereka (termasuk private)
- Klik "Semua Kegiatan" untuk kembali ke view normal
