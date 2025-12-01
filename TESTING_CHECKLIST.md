# 🐛 Bug Testing Checklist

Gunakan checklist ini untuk memastikan semua fungsi bekerja dengan baik setelah optimalisasi.

## ✅ Authentication & Authorization

### Login
- [ ] Login sebagai Atasan berhasil
- [ ] Login sebagai Bawahan berhasil
- [ ] Role disimpan di localStorage
- [ ] OPD disimpan di localStorage
- [ ] Redirect ke dashboard sesuai role

### Registration
- [ ] Form signup menampilkan dropdown OPD
- [ ] Data terkirim ke backend
- [ ] Status = 'pending' setelah register
- [ ] Email notifikasi terkirim (optional)

### Approval
- [ ] Atasan dapat melihat pending users
- [ ] Approve user mengubah status ke 'approved'
- [ ] Reject user mengubah status ke 'rejected'
- [ ] Log tercatat untuk audit trail

## ✅ OPD Scoping & Filtering

### Bawahan
- [ ] Hanya melihat kegiatan di OPD sendiri
- [ ] Dropdown OPD read-only (disabled)
- [ ] Tidak bisa membuat kegiatan untuk OPD lain
- [ ] Tidak bisa edit OPD kegiatan

### Atasan
- [ ] Dropdown OPD dapat dipilih
- [ ] Filter OPD berfungsi di dashboard
- [ ] Dapat membuat kegiatan untuk OPD manapun
- [ ] Dapat edit OPD kegiatan
- [ ] Melihat perspektif bawahan dengan OPD scoping correct

## ✅ Visibility Rules

### Public
- [ ] Semua user dapat melihat (logged in & non-logged)
- [ ] Muncul di homepage
- [ ] Muncul di dashboard semua user

### Kantor
- [ ] Hanya user di OPD yang sama dapat melihat
- [ ] 403 error jika user OPD berbeda akses detail
- [ ] Tidak muncul di homepage
- [ ] Muncul di dashboard user OPD yang sama

### Private
- [ ] Hanya pembuat dapat melihat
- [ ] Orang di orang_terkait dapat melihat
- [ ] Atasan dapat melihat semua private (override)
- [ ] Bawahan OPD lain tidak dapat melihat
- [ ] 403 error jika tidak authorized

## ✅ CRUD Operations

### Create (Tambah Kegiatan)
- [ ] Form validation bekerja
- [ ] OPD field behavior sesuai role (read-only bawahan, dropdown atasan)
- [ ] Upload media berhasil (multiple files)
- [ ] Orang terkait tersimpan sebagai JSON array
- [ ] Repeat settings tersimpan dengan benar
- [ ] Multi-day events (jam_berakhir > jam_mulai) auto-fill tanggal_berakhir
- [ ] Redirect sesuai role setelah submit

### Read (Detail Kegiatan)
- [ ] Detail menampilkan semua field dengan benar
- [ ] Media ditampilkan (image preview, video link)
- [ ] Orang terkait ditampilkan dengan nama & nomor HP
- [ ] Repeat info ditampilkan
- [ ] Visibility badge ditampilkan
- [ ] Back button routing sesuai role (atasan → /atasan, bawahan → /bawahan)

### Update (Edit Kegiatan)
- [ ] Hanya creator dapat edit
- [ ] 403 error jika bukan creator
- [ ] Form pre-filled dengan data existing
- [ ] OPD enforcement (bawahan tidak bisa ubah OPD)
- [ ] Media baru di-append ke existing media
- [ ] Validation error ditampilkan dengan jelas

### Delete (Hapus Kegiatan)
- [ ] Hanya creator dapat delete
- [ ] 403 error jika bukan creator
- [ ] Konfirmasi dialog muncul
- [ ] Kegiatan terhapus dari database
- [ ] Redirect setelah delete

## ✅ Dashboard Features

### Table View
- [ ] Agenda hari ini terfilter dengan benar
- [ ] Agenda besok terfilter dengan benar
- [ ] Numbering sequential dari atas (index-based)
- [ ] Edit/Delete button hanya muncul untuk creator
- [ ] Klik row membuka detail
- [ ] No data message muncul jika kosong

### Calendar View
- [ ] Event muncul di tanggal yang benar
- [ ] Multi-day event muncul di semua tanggal range
- [ ] Klik tanggal menampilkan list kegiatan
- [ ] Navigation bulan prev/next bekerja
- [ ] Event count badge muncul di tanggal
- [ ] Klik kegiatan membuka detail

### OPD Filter
- [ ] Dropdown positioned di atas toggle Kalender/Tabel
- [ ] "Semua Divisi" menampilkan semua (atasan)
- [ ] Pilih OPD specific filter kegiatan OPD tersebut
- [ ] Re-fetch otomatis saat selection berubah

## ✅ Performance & Optimization

### Frontend
- [ ] Tidak ada console.log di production build
- [ ] Bundle size < 1MB (check dengan `npm run build`)
- [ ] Initial page load < 3 detik
- [ ] Calendar render smooth tanpa lag
- [ ] No memory leaks (check di DevTools Performance)

### Backend
- [ ] Query count reasonable (< 10 queries per request)
- [ ] Response time < 500ms untuk list endpoints
- [ ] Log file tidak bloat (no debug logs in production)
- [ ] Media upload tidak crash server
- [ ] Concurrent requests handled correctly

## ✅ Error Handling

### Frontend
- [ ] Network error menampilkan pesan yang jelas
- [ ] Validation error dari backend ditampilkan
- [ ] Loading state ditampilkan saat fetch
- [ ] Empty state ditampilkan jika no data
- [ ] 403/404 error ditampilkan dengan user-friendly

### Backend
- [ ] Validation error return 422 dengan detail
- [ ] Authorization error return 403 dengan message
- [ ] Not found return 404
- [ ] Server error return 500 (logged)
- [ ] Database error tidak expose sensitive info

## ✅ Edge Cases

### Multi-day Events
- [ ] Jam berakhir < jam mulai → tanggal_berakhir = tanggal + 1
- [ ] Jam berakhir > jam mulai → tanggal_berakhir = tanggal
- [ ] Event muncul di "Hari Ini" jika hari ini antara tanggal - tanggal_berakhir

### Repeat Events
- [ ] Repeat = no → frequency & end_date tidak terkirim
- [ ] Repeat = yes, limit = no → end_date tidak terkirim
- [ ] Repeat = yes, limit = yes → end_date required

### Orang Terkait
- [ ] JSON array format accepted
- [ ] Legacy CSV format fallback bekerja
- [ ] Case-insensitive match di private visibility check
- [ ] Pembuat auto-included di selected users

### OPD Edge Cases
- [ ] Case-insensitive matching (Diskominfo = diskominfo)
- [ ] Null OPD handled gracefully
- [ ] Default OPD (Diskominfo) applied jika missing

## 🎯 Testing Priority

### P0 (Critical - Must Test)
1. Login & role assignment
2. OPD scoping (bawahan restricted)
3. Visibility rules (private, kantor)
4. Create & Edit authorization
5. Delete authorization

### P1 (High - Should Test)
1. OPD filter functionality
2. Table numbering
3. Calendar rendering
4. Media upload
5. Repeat events

### P2 (Medium - Nice to Test)
1. Empty states
2. Error messages
3. Loading states
4. Back button routing
5. Audit logging

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Auth: ☐ Pass ☐ Fail - Notes: ___________
OPD Scoping: ☐ Pass ☐ Fail - Notes: ___________
Visibility: ☐ Pass ☐ Fail - Notes: ___________
CRUD: ☐ Pass ☐ Fail - Notes: ___________
Dashboard: ☐ Pass ☐ Fail - Notes: ___________
Performance: ☐ Pass ☐ Fail - Notes: ___________
Error Handling: ☐ Pass ☐ Fail - Notes: ___________

Overall Status: ☐ Ready for Production ☐ Needs Fixes
```

## 🐛 Known Issues (After Testing)
_Record any bugs found during testing here_

---

**Last Updated:** November 30, 2025
**Status:** ✅ All optimizations applied, ready for testing
