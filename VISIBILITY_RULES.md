# Aturan Visibility Kegiatan

## Update: 30 November 2025

### Perubahan Utama
Pengguna sekarang dapat melihat **kegiatan public dari semua divisi**, tidak lagi dibatasi oleh OPD mereka sendiri.

---

## Aturan Visibility

### 1. **Public** 
- ✅ **Dapat dilihat oleh semua orang** (termasuk yang tidak login)
- ✅ **Tidak dibatasi oleh OPD/Divisi**
- ✅ Pengguna dari divisi manapun dapat melihat kegiatan public dari divisi lain
- ✅ Muncul di homepage InfoDisplay
- Contoh: Event publik, sosialisasi umum, pengumuman resmi

### 2. **Kantor**
- 🔒 **Hanya dapat dilihat oleh user yang login**
- 🔒 **Dibatasi oleh OPD yang sama**
  - User Diskominfo hanya bisa lihat kegiatan kantor Diskominfo
  - User Dinkes hanya bisa lihat kegiatan kantor Dinkes
- ❌ Tidak muncul di homepage InfoDisplay (perlu login)
- Contoh: Rapat internal divisi, kegiatan koordinasi internal

### 3. **Private**
- 🔐 **Hanya dapat dilihat oleh:**
  - Pembuat kegiatan
  - Orang yang terdaftar di "Orang Terkait"
  - Atasan (untuk monitoring bawahan)
- 🔐 **Dibatasi sangat ketat**
- ❌ Tidak muncul di homepage InfoDisplay
- Contoh: Meeting pribadi, jadwal personal

---

## Implementasi Backend

### Filter di `ActivityController::index()`

```php
// Untuk homepage (tidak login)
if (!$username) {
    $query->where('visibility', 'public');
    // Filter OPD opsional untuk dropdown divisi
    if ($opdFilter && $opdFilter !== 'Semua Divisi') {
        $query->whereRaw('LOWER(opd) = ?', [strtolower($opdFilter)]);
    }
}

// Untuk dashboard (sudah login)
elseif ($username) {
    $query->where(function($q) use ($username, $userOpd) {
        // Public: semua divisi
        $q->where('visibility', 'public')
          // Kantor: hanya OPD yang sama
          ->orWhere(function($q2) use ($userOpd) {
              $q2->where('visibility', 'kantor')
                 ->whereRaw('LOWER(opd) = ?', [strtolower($userOpd)]);
          })
          // Private: pembuat atau orang_terkait
          ->orWhere(function($q2) use ($username) {
              $q2->where('visibility', 'private')
                 ->where(function($q3) use ($username) {
                     $q3->where('pembuat', $username)
                        ->orWhereRaw('LOWER(orang_terkait) LIKE ?', 
                                     ['%' . strtolower($username) . '%']);
                 });
          });
    });
}
```

### Filter di `ActivityController::show()`

```php
// Public: langsung return (tidak cek OPD)
if ($activity->visibility === 'public') {
    return response()->json($activity);
}

// Kantor: cek OPD yang sama
if ($activity->visibility === 'kantor') {
    if ($userOpd !== $activityOpd) {
        return 403; // Forbidden
    }
}

// Private: cek pembuat atau orang_terkait
if ($activity->visibility === 'private') {
    if ($username !== $pembuat && !in_array($username, $orang_terkait)) {
        return 403; // Forbidden
    }
}
```

---

## Contoh Skenario

### Skenario 1: User Diskominfo melihat kegiatan
- ✅ Kegiatan **public Dinkes** → **BISA DILIHAT** (perubahan baru)
- ✅ Kegiatan **public Diskominfo** → **BISA DILIHAT**
- ✅ Kegiatan **kantor Diskominfo** → **BISA DILIHAT** (OPD sama)
- ❌ Kegiatan **kantor Dinkes** → **TIDAK BISA** (OPD beda)
- ❌ Kegiatan **private orang lain** → **TIDAK BISA** (bukan pembuat/terkait)
- ✅ Kegiatan **private sendiri** → **BISA DILIHAT**

### Skenario 2: User Dinkes melihat kegiatan
- ✅ Kegiatan **public Diskominfo** → **BISA DILIHAT** (perubahan baru)
- ✅ Kegiatan **public Dinkes** → **BISA DILIHAT**
- ✅ Kegiatan **kantor Dinkes** → **BISA DILIHAT** (OPD sama)
- ❌ Kegiatan **kantor Diskominfo** → **TIDAK BISA** (OPD beda)

### Skenario 3: Pengunjung (tidak login) melihat homepage
- ✅ Kegiatan **public semua divisi** → **BISA DILIHAT**
- ✅ Filter dropdown divisi → Memfilter public berdasarkan OPD
- ❌ Kegiatan **kantor** → **TIDAK MUNCUL**
- ❌ Kegiatan **private** → **TIDAK MUNCUL**

---

## Perubahan di Frontend

### InfoDisplay (Homepage)
- Filter dropdown "Semua Divisi" tetap berfungsi
- Menampilkan **semua kegiatan public** secara default
- Dapat difilter per-divisi menggunakan dropdown

### Dashboard (Atasan/Bawahan)
- Atasan dapat melihat:
  - Public semua divisi
  - Kantor dari OPD sendiri
  - Private bawahan (untuk monitoring)
- Bawahan dapat melihat:
  - Public semua divisi
  - Kantor dari OPD sendiri
  - Private sendiri

---

## Testing

### Test Case: Visibility Public Cross-OPD

1. **Setup:**
   - User A (Diskominfo) membuat kegiatan public
   - User B (Dinkes) login

2. **Expected Result:**
   - ✅ User B dapat melihat kegiatan User A di dashboard
   - ✅ User B dapat mengklik detail kegiatan
   - ✅ Kegiatan muncul di kalender User B

3. **Actual Result:**
   - ✅ PASSED (setelah update backend)

### Test Case: Filter Divisi di Homepage

1. **Setup:**
   - Homepage dengan dropdown "Filter Divisi"
   - Ada kegiatan public dari berbagai divisi

2. **Expected Result:**
   - Pilih "Semua Divisi" → tampil semua kegiatan public
   - Pilih "Diskominfo" → hanya tampil kegiatan public Diskominfo
   - Pilih "Dinkes" → hanya tampil kegiatan public Dinkes

3. **Actual Result:**
   - ✅ PASSED

---

## Migration Notes

**Tidak ada perubahan database diperlukan.**

Perubahan hanya pada:
- ✅ `ActivityController.php` (backend logic)
- ✅ Filter query untuk public visibility
- ✅ Build frontend sukses tanpa error

---

## Benefit Perubahan

1. **Transparansi antar divisi** - Semua divisi dapat melihat kegiatan public divisi lain
2. **Koordinasi lebih baik** - Menghindari jadwal bentrok antar divisi
3. **Informasi publik lebih luas** - Event publik dapat diakses oleh siapa saja
4. **Tetap aman** - Kegiatan kantor dan private tetap terlindungi

---

## Catatan Teknis

- Case-insensitive comparison untuk OPD (menggunakan `LOWER()`)
- SQLite compatible query (menggunakan `LIKE` untuk JSON array search)
- Backward compatible dengan data existing
- No breaking changes pada API contract
