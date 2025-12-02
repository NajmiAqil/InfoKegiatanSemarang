# Fitur Approval Publish Kegiatan Publik

## 📋 Overview
Fitur ini menambahkan sistem approval untuk kegiatan publik yang dibuat oleh bawahan. Sebelum kegiatan publik bisa dilihat di homepage/kalender oleh semua orang, harus mendapat persetujuan dari atasan terlebih dahulu.

---

## 🎯 Tujuan
- **Kontrol Kualitas**: Atasan dapat mereview kegiatan publik sebelum dipublikasikan
- **Moderasi Konten**: Mencegah kegiatan yang tidak pantas atau salah muncul di homepage
- **Hierarki Organisasi**: Menjaga struktur persetujuan dalam organisasi pemerintahan

---

## 🔄 Alur Kerja (Workflow)

### 1. Bawahan Membuat Kegiatan Publik
```
Bawahan → Add Kegiatan → Pilih Visibility: Public → Submit
↓
Status: is_approved = false (Menunggu Persetujuan)
↓
Kegiatan TIDAK muncul di:
  - Homepage (InfoDisplay)
  - Kalender homepage
  - Berita Terbaru carousel
  
Kegiatan HANYA muncul di:
  - Dashboard bawahan sendiri (creator)
  - Halaman Atasan → Tabel "Izin Publish Kegiatan Publik"
```

### 2. Atasan Mereview & Menyetujui
```
Atasan → Dashboard Atasan → Tabel "Izin Publish Kegiatan Publik"
↓
Aksi tersedia:
  - 👁️ Detail: Lihat detail lengkap kegiatan
  - ✏️ Edit: Edit kegiatan jika perlu perbaikan
  - 🗑️ Hapus: Hapus jika tidak pantas
  - ✓ Izinkan: APPROVE untuk publikasi
↓
Klik "Izinkan"
↓
Status: is_approved = true
       approved_by = username_atasan
       approved_at = timestamp
↓
Kegiatan SEKARANG muncul di:
  - Homepage (InfoDisplay) ✅
  - Kalender homepage ✅
  - Berita Terbaru carousel ✅
  - Dashboard bawahan ✅
  - Dashboard atasan ✅
```

---

## 🛠️ Implementasi Teknis

### Database Changes

#### Migration: `2025_12_02_225801_add_approval_fields_to_activities_table.php`
```php
Schema::table('activities', function (Blueprint $table) {
    $table->boolean('is_approved')->default(false)->after('external_contacts');
    $table->string('approved_by')->nullable()->after('is_approved');
    $table->timestamp('approved_at')->nullable()->after('approved_by');
});
```

#### Kolom Baru di Tabel `activities`:
- `is_approved` (boolean, default: false) - Status persetujuan
- `approved_by` (string, nullable) - Username atasan yang menyetujui
- `approved_at` (timestamp, nullable) - Waktu persetujuan

---

### Backend Changes

#### 1. Model: `Activity.php`
```php
protected $fillable = [
    // ... existing fields
    'is_approved',
    'approved_by',
    'approved_at',
];
```

#### 2. Controller: `ActivityController.php`

**Auto-Approval Logic (store method):**
```php
// Atasan: Auto-approve semua kegiatan mereka
if ($role === 'atasan') {
    $isApproved = true;
    $approvedBy = $username;
    $approvedAt = now();
}
// Non-public (kantor/private): Auto-approve
elseif ($validated['visibility'] !== 'public') {
    $isApproved = true;
    $approvedBy = $username;
    $approvedAt = now();
}
// Public dari bawahan: Butuh approval (is_approved = false)
```

**Query Filters (index method):**
```php
// Homepage: Hanya public + approved
$query->where('visibility', 'public')
      ->where('is_approved', true);

// Dashboard: Show approved OR own activities
$query->where(function($q) use ($username) {
    $q->where('is_approved', true)
      ->orWhere('pembuat', $username);
});
```

**New Endpoints:**
```php
// Get pending activities for approval
GET /api/activities-pending-approval?role=atasan&username=xxx

// Approve activity
POST /api/activities/{id}/approve?username=xxx&role=atasan
```

---

### Frontend Changes

#### 1. TypeScript Interface Update
```typescript
export interface Activity {
  // ... existing fields
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
}
```

#### 2. AtasanPage Component

**State Management:**
```typescript
const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);

const fetchPendingActivities = async () => {
  const response = await fetch(
    `/api/activities-pending-approval?role=atasan&username=${username}`
  );
  const data = await response.json();
  setPendingActivities(data);
};
```

**Approval Handler:**
```typescript
const handleApproveActivity = async (activityId: number) => {
  const response = await fetch(
    `/api/activities/${activityId}/approve?username=${username}&role=atasan`,
    { method: 'POST' }
  );
  
  if (response.ok) {
    alert('Kegiatan berhasil disetujui dan dapat dilihat oleh semua orang');
    fetchPendingActivities();
    fetchActivities();
  }
};
```

**UI Tabel:**
```tsx
<section className="agenda-section">
  <h2>Izin Publish Kegiatan Publik</h2>
  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Judul</th>
        <th>Tanggal</th>
        <th>Waktu</th>
        <th>Pembuat</th>
        <th>OPD</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      {pendingActivities.map((activity, index) => (
        <tr>
          {/* ... table data ... */}
          <td>
            <button onClick={viewDetail}>👁️ Detail</button>
            <button onClick={edit}>✏️ Edit</button>
            <button onClick={delete}>🗑️ Hapus</button>
            <button onClick={approve}>✓ Izinkan</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
```

---

## 📊 Matrix Visibility

| Jenis Kegiatan | Creator | Is Approved | Homepage | Kalender Homepage | Dashboard Bawahan | Dashboard Atasan | Tabel Approval |
|----------------|---------|-------------|----------|-------------------|-------------------|------------------|----------------|
| **Public dari Bawahan** | Bawahan | ❌ false | ❌ Tidak | ❌ Tidak | ✅ Ya | ❌ Tidak | ✅ Ya |
| **Public dari Bawahan** | Bawahan | ✅ true | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Public dari Atasan** | Atasan | ✅ true (auto) | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Kantor** | Any | ✅ true (auto) | ❌ Tidak | ❌ Tidak | ✅ Ya (same OPD) | ✅ Ya | ❌ Tidak |
| **Private** | Any | ✅ true (auto) | ❌ Tidak | ❌ Tidak | ✅ Ya (creator/terkait) | ✅ Ya | ❌ Tidak |

---

## 🧪 Testing Checklist

### Test Case 1: Bawahan Create Public Activity
- [x] Login sebagai bawahan
- [x] Create kegiatan dengan visibility = Public
- [x] Submit kegiatan
- [x] Verify: Kegiatan muncul di dashboard bawahan
- [x] Verify: Kegiatan TIDAK muncul di homepage
- [x] Verify: is_approved = false di database

### Test Case 2: Atasan View Pending Approval
- [x] Login sebagai atasan
- [x] Navigate ke dashboard atasan
- [x] Scroll ke section "Izin Publish Kegiatan Publik"
- [x] Verify: Tabel menampilkan kegiatan pending
- [x] Verify: Semua aksi button tersedia (Detail, Edit, Hapus, Izinkan)

### Test Case 3: Atasan Approve Activity
- [x] Click button "✓ Izinkan" pada kegiatan
- [x] Confirm approval
- [x] Verify: Success message muncul
- [x] Verify: Kegiatan hilang dari tabel approval
- [x] Verify: is_approved = true di database
- [x] Verify: approved_by terisi username atasan
- [x] Verify: Kegiatan SEKARANG muncul di homepage

### Test Case 4: Atasan Create Public Activity
- [x] Login sebagai atasan
- [x] Create kegiatan dengan visibility = Public
- [x] Submit kegiatan
- [x] Verify: Kegiatan LANGSUNG muncul di homepage (auto-approved)
- [x] Verify: Kegiatan TIDAK muncul di tabel approval

### Test Case 5: Bawahan Create Non-Public Activity
- [x] Login sebagai bawahan
- [x] Create kegiatan dengan visibility = Kantor atau Private
- [x] Submit kegiatan
- [x] Verify: Kegiatan LANGSUNG approved (is_approved = true)
- [x] Verify: Kegiatan TIDAK muncul di tabel approval

---

## 🔐 Security & Authorization

### Role-Based Access Control
```php
// Only atasan can view pending approvals
if ($role !== 'atasan') {
    return response()->json(['message' => 'Forbidden'], 403);
}

// Only atasan can approve
if ($role !== 'atasan') {
    return response()->json(['message' => 'Forbidden'], 403);
}
```

### Activity Ownership
- Bawahan selalu bisa melihat kegiatan mereka sendiri (approved or not)
- Atasan bisa edit/delete kegiatan pending di tabel approval
- Setelah approved, visibility rules normal berlaku

---

## 📝 Migration & Update Existing Data

### Update Script: `update_approval.php`
```php
// Auto-approve all existing activities
Activity::where(function($query) {
    $query->whereNull('is_approved')
          ->orWhere('is_approved', false);
})->update([
    'is_approved' => true,
    'approved_by' => 'system',
    'approved_at' => now()
]);

// Result: ✅ Updated 20 existing activities to approved status
```

**Alasan:** Semua kegiatan yang sudah ada sebelum fitur ini diaktifkan akan auto-approved agar tidak hilang dari homepage.

---

## 🎨 UI/UX Features

### Tabel Approval Design
- **Location**: Halaman Atasan, di atas tabel "Permintaan Akses"
- **Styling**: Konsisten dengan tabel lain (maroon theme)
- **Columns**: No, Judul, Tanggal, Waktu, Pembuat, OPD, Aksi
- **Actions**: 4 button dengan icon dan warna berbeda
  - 👁️ Detail (Blue #2196F3)
  - ✏️ Edit (Orange #FFB300)
  - 🗑️ Hapus (Red #f44336)
  - ✓ Izinkan (Green #4caf50)

### Empty State
```
Tidak ada kegiatan menunggu persetujuan
```

### Success Message
```
Kegiatan berhasil disetujui dan dapat dilihat oleh semua orang
```

---

## 🚀 Deployment Notes

### Database Migration
```bash
cd laravel-backend
php artisan migrate
php update_approval.php  # Auto-approve existing activities
```

### Backend Routes Added
```
GET  /api/activities-pending-approval
POST /api/activities/{id}/approve
```

### Frontend Files Modified
- `InfoDisplayTypes.ts` - Added approval fields to Activity interface
- `AtasanPage.tsx` - Added pending activities table and handlers
- `ActivityController.php` - Updated query filters and added endpoints

---

## 📊 Performance Impact

### Query Optimization
- Index on `is_approved` column recommended for faster filtering
- Query joins minimal (no additional tables)
- Cache invalidation on approval action

### Suggested Index:
```php
$table->index('is_approved');
$table->index(['visibility', 'is_approved']); // Composite for homepage
```

---

## 🔮 Future Enhancements

1. **Email Notifications**
   - Notify atasan when new public activity needs approval
   - Notify bawahan when their activity is approved/rejected

2. **Rejection Feature**
   - Add "Tolak" button dengan reason
   - Track rejection history
   - Auto-delete after rejection

3. **Bulk Actions**
   - Approve multiple activities at once
   - Bulk reject with reason

4. **Activity History**
   - Log approval timeline
   - Show who approved what when

5. **Analytics Dashboard**
   - Average approval time
   - Approval rate by OPD
   - Most active approvers

---

## ✅ Verification Completed

**All features implemented and tested successfully:**
- ✅ Migration created and run
- ✅ Model updated with new fields
- ✅ Controller logic implemented (auto-approve + manual approve)
- ✅ Routes added for approval endpoints
- ✅ Frontend table added to AtasanPage
- ✅ TypeScript interfaces updated
- ✅ Existing activities auto-approved (20 activities)
- ✅ Frontend compiled successfully
- ✅ Backend server running
- ✅ All query filters working correctly

**Ready for production! 🎉**
