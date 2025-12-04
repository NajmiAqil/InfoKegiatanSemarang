# BAB 4.4 - Implementasi Backend

**Format: Times New Roman 12pt, 1.5 spasi, Justified**

---

4.4 Implementasi Backend

4.4.1 Arsitektur Backend Laravel

Implementasi backend menggunakan framework Laravel 11 sebagai fondasi utama, memanfaatkan arsitektur Model-View-Controller (MVC) yang telah terbukti efektif dalam pengembangan aplikasi web modern. Laravel dipilih karena menyediakan ekosistem lengkap untuk autentikasi, routing, migrasi database, validasi, dan ORM (Object-Relational Mapping) melalui Eloquent yang mempermudah interaksi dengan database.

Struktur backend dirancang dengan pemisahan concern yang jelas, dimana folder `app/Http/Controllers/Api` menampung controller-controller API yang menangani logika bisnis, folder `app/Models` menyimpan model-model Eloquent yang merepresentasikan tabel database, dan folder `routes` berisi definisi endpoint API. Pendekatan RESTful API diterapkan secara konsisten, dengan endpoint yang mengikuti konvensi HTTP method (GET, POST, PUT, DELETE) untuk operasi CRUD (Create, Read, Update, Delete).

4.4.2 Database Schema dan Migrasi

Database menggunakan SQLite sebagai sistem manajemen database yang ringan dan mudah dikonfigurasi untuk lingkungan development. Schema database dirancang dengan dua tabel utama yaitu `users` dan `activities`, masing-masing dengan struktur field yang komprehensif untuk mendukung seluruh kebutuhan fungsional sistem.

Tabel `activities` merupakan tabel sentral yang menyimpan informasi kegiatan dengan field-field seperti `id` sebagai primary key, `judul` untuk judul kegiatan, `tanggal` dan `tanggal_berakhir` untuk periode pelaksanaan, `jam_mulai` dan `jam_berakhir` untuk waktu kegiatan, `lokasi` untuk tempat pelaksanaan, `jenis_kegiatan` untuk kategori kegiatan, `visibility` dengan nilai enum (public, private, kantor) untuk kontrol akses, `deskripsi` untuk detail kegiatan, `pembuat` untuk username pembuat kegiatan, `opd` untuk organisasi perangkat daerah, `orang_terkait` untuk daftar peserta internal, `external_contacts` bertype JSON untuk kontak eksternal, `media` bertype JSON untuk path file foto/video, serta field-field pengulangan seperti `repeat`, `repeat_frequency`, dan `repeat_end_date`. Field approval workflow mencakup `is_approved`, `approved_by`, dan `approved_at` untuk melacak status persetujuan kegiatan.

Tabel `users` menyimpan informasi pengguna dengan field `id`, `name`, `username`, `email`, `password` yang di-hash menggunakan bcrypt, `role` dengan nilai enum (atasan, bawahan), `opd` untuk afiliasi organisasi, `nomor_hp` untuk kontak, serta field approval seperti `is_approved`, `approved_by`, dan `approved_at` untuk mengelola proses registrasi dan verifikasi pengguna oleh atasan.

Migrasi database dikelola melalui file-file migration Laravel yang terletak di folder `database/migrations`. Setiap perubahan schema didokumentasikan melalui file migration dengan timestamp, seperti `2025_11_23_120029_add_full_fields_to_activities_table.php` yang menambahkan field lengkap ke tabel activities, atau `2025_11_30_120000_add_opd_to_users_table.php` yang menambahkan field OPD ke tabel users. Pendekatan migrasi ini memastikan version control yang baik dan kemudahan rollback jika diperlukan.

### 4.4.3 Model Eloquent

Model `Activity` dan `User` didefinisikan dalam folder `app/Models` sebagai representasi Eloquent dari tabel database. Model `Activity` memiliki property `$fillable` yang mendaftarkan field-field yang dapat diisi secara mass assignment, serta `$casts` yang mendefinisikan casting tipe data untuk field JSON seperti `media` dan `external_contacts` agar otomatis di-serialize menjadi array saat diakses.

Model ini mewarisi semua fungsionalitas Eloquent ORM seperti query builder, relationship management, dan accessor/mutator. Eloquent menyediakan API yang ekspresif dan mudah dibaca untuk operasi database, misalnya `Activity::where('pembuat', $username)->get()` untuk mengambil semua kegiatan milik user tertentu, atau `Activity::orderBy('tanggal')->orderBy('jam_mulai')->get()` untuk mengurutkan kegiatan berdasarkan tanggal dan waktu.

### 4.4.4 Controller dan Business Logic

Controller API terletak di `app/Http/Controllers/Api` dengan tiga controller utama yaitu `ActivityController`, `AuthController`, dan `UserController`. Masing-masing controller menangani domain logika yang spesifik sesuai dengan prinsip single responsibility.

`ActivityController` mengelola CRUD kegiatan dengan method-method seperti `index()` untuk listing kegiatan dengan filter dan visibility rules, `show($id)` untuk detail kegiatan, `store()` untuk membuat kegiatan baru dengan validasi dan upload media, `update($id)` untuk edit kegiatan, serta `destroy($id)` untuk hapus kegiatan. Controller ini juga mengimplementasikan logika kompleks seperti ekspansi kegiatan berulang (recurring events) melalui method private `expandOccurrences()` yang menghasilkan array occurrence berdasarkan frekuensi pengulangan (daily, weekly, monthly, yearly) dan batas tanggal pengulangan.

Method `index()` menerapkan visibility control yang sophisticated, dimana kegiatan public hanya ditampilkan jika sudah diapprove (`is_approved = true`), kegiatan private hanya terlihat oleh pembuat atau orang yang terdaftar dalam `orang_terkait`, dan kegiatan kantor dapat dilihat oleh semua user dalam OPD yang sama atau yang terdaftar dalam `orang_terkait`. Atasan memiliki akses penuh untuk melihat semua kegiatan termasuk yang berstatus pending approval.

`AuthController` menangani autentikasi dengan method `login()` yang memvalidasi kredensial username dan password, kemudian mengembalikan informasi user beserta role dan OPD untuk disimpan di frontend (localStorage/sessionStorage). Autentikasi menggunakan hash bcrypt untuk verifikasi password yang aman.

`UserController` mengelola registrasi dan approval user dengan method `register()` untuk pendaftaran user baru dengan status `is_approved = false`, `getPendingUsers()` untuk atasan melihat daftar pendaftar yang menunggu approval, `approveUser($id)` untuk menerima pendaftar dengan mengirim email notifikasi, `rejectUser($id)` untuk menolak pendaftar, serta `getApprovedBawahan()` dan `getAllApprovedUsers()` untuk mendapatkan daftar user yang sudah diapprove.

### 4.4.5 Routing dan Endpoint API

File `routes/api.php` mendefinisikan semua endpoint API dengan format RESTful. Semua route dikelompokkan dalam middleware `api` yang menyediakan rate limiting dan JSON response handling. Endpoint-endpoint utama mencakup:

- `GET /api/activities` dengan query parameters `username`, `role`, `opd`, dan `pembuat` untuk listing kegiatan dengan filter
- `GET /api/activities/{id}` dengan query parameters `username` dan `role` untuk detail kegiatan
- `POST /api/activities` untuk membuat kegiatan baru dengan validasi dan upload media
- `PUT /api/activities/{id}` dan `POST /api/activities/{id}` (untuk FormData dengan `_method=PUT`) untuk update kegiatan
- `DELETE /api/activities/{id}` dengan query parameter `username` untuk hapus kegiatan
- `GET /api/activities-pending-approval` dengan query parameters `role` dan `username` untuk atasan melihat kegiatan pending
- `POST /api/activities/{id}/approve` dengan query parameters `username` dan `role` untuk approve kegiatan
- `POST /api/login` untuk autentikasi user
- `POST /api/users/register` untuk registrasi user baru
- `GET /api/users/pending` untuk atasan melihat pendaftar pending
- `GET /api/users/approved-bawahan` dan `GET /api/users/approved` untuk daftar user approved
- `POST /api/users/{id}/approve` dan `POST /api/users/{id}/reject` untuk proses approval/reject user

Routing dirancang dengan konsistensi yang tinggi, menggunakan resource naming yang intuitif dan HTTP method yang semantik sesuai dengan operasi yang dilakukan.

4.4.6 Validasi dan Error Handling

Validasi input dilakukan pada level controller menggunakan Laravel validation rules. Untuk endpoint `store()` dan `update()` pada `ActivityController`, validasi mencakup pengecekan required fields seperti `judul`, `tanggal`, `jam_mulai`, `jam_berakhir`, `lokasi`, `jenis_kegiatan`, dan `visibility`, serta validasi format tanggal, waktu, dan enum values. Field `media` divalidasi untuk tipe file (image/video) dan ukuran maksimal 50MB per file, dengan dukungan format JPEG, PNG, GIF, WebP, HEIC untuk gambar dan MP4, AVI, MOV untuk video.

Upload file media ditangani dengan menyimpan file ke `storage/app/public` menggunakan Laravel Storage facade, kemudian path-nya disimpan dalam field JSON `media`. Symlink dari `public/storage` ke `storage/app/public` memastikan file dapat diakses via URL publik.

Error handling menggunakan HTTP status code yang standar seperti 200 untuk success, 201 untuk created, 400 untuk bad request, 403 untuk forbidden, 404 untuk not found, dan 500 untuk server error. Response error dikembalikan dalam format JSON dengan struktur `{ "message": "error description" }` untuk kemudahan parsing di frontend.

4.4.7 Logika Kegiatan Berulang (Recurring Events)

Fitur recurring events diimplementasikan melalui method `expandOccurrences()` yang menerima object activity dan menghasilkan array occurrence berdasarkan field `repeat`, `repeat_frequency`, dan `repeat_end_date`. Method ini menggunakan Carbon (library date/time PHP) untuk manipulasi tanggal yang presisi.

Algoritma ekspansi dimulai dari `tanggal` kegiatan asli dan melakukan increment berdasarkan `repeat_frequency` (daily, weekly, monthly, yearly) hingga mencapai `repeat_end_date` atau batas horizon 180 hari ke depan. Setiap occurrence ditandai dengan flag `is_occurrence` dan menyimpan `original_date` untuk referensi ke kegiatan asli. Frontend kemudian menggunakan flag ini untuk menonaktifkan aksi edit/hapus pada occurrence dan mengarahkan user untuk edit/hapus pada tanggal asli agar integritas data terjaga.

Untuk kegiatan multi-hari (memiliki `tanggal_berakhir` berbeda dari `tanggal`), sistem menghitung selisih hari antara `tanggal` dan `tanggal_berakhir`, kemudian menerapkan offset yang sama pada setiap occurrence sehingga durasi kegiatan konsisten di semua pengulangan.

4.4.8 Approval Workflow Implementation

Approval workflow diimplementasikan dengan field `is_approved`, `approved_by`, dan `approved_at` pada tabel activities dan users. Untuk kegiatan dengan `visibility = 'public'` yang dibuat oleh user dengan `role = 'bawahan'`, field `is_approved` di-set `false` secara otomatis, sehingga kegiatan tidak muncul di homepage publik sampai atasan menyetujui via endpoint `POST /api/activities/{id}/approve`.

Method `approveActivity($id)` dalam `ActivityController` memverifikasi bahwa user yang memanggil endpoint memiliki `role = 'atasan'`, kemudian meng-update `is_approved = true`, `approved_by` dengan username atasan, dan `approved_at` dengan timestamp saat ini. Response berupa JSON dengan status success dan kegiatan yang di-update.

Kegiatan dengan `visibility = 'private'` atau `'kantor'` tidak memerlukan approval karena tidak ditampilkan di homepage publik. Kegiatan yang dibuat oleh atasan langsung di-set `is_approved = true` tanpa memerlukan approval tambahan.

Approval workflow untuk user registrasi mengikuti pola serupa, dimana `UserController::approveUser($id)` meng-update `is_approved = true` dan mengirimkan email notifikasi kepada pendaftar bahwa akun telah diaktifkan. Email dikirim menggunakan Laravel Mail facade dengan konfigurasi SMTP yang didefinisikan di file `.env`.

4.4.9 Storage dan File Management

File media (foto/video) yang diupload disimpan di `storage/app/public` dengan struktur folder yang terorganisir. Laravel Storage facade menyediakan API yang konsisten untuk operasi file seperti `store()`, `delete()`, dan `exists()`. Setiap file media disimpan dengan nama unik yang dihasilkan secara otomatis untuk menghindari konflik penamaan.

Path file yang tersimpan dalam database berupa relative path seperti `storage/activities/abc123.jpg`, yang dapat diakses via URL publik setelah symlink dibuat dengan command `php artisan storage:link`. Symlink menghubungkan `public/storage` ke `storage/app/public`, sehingga file dapat diakses via `http://domain.com/storage/activities/abc123.jpg`.

Saat update kegiatan dengan media baru, sistem tidak otomatis menghapus media lama untuk menjaga data historis. Namun, jika diperlukan cleanup, dapat diimplementasikan logika untuk menghapus file orphan yang tidak lagi direferensikan oleh record database.

4.4.10 Security dan Authorization

Security diimplementasikan melalui beberapa layer, dimana setiap endpoint yang melakukan operasi write (POST, PUT, DELETE) memverifikasi parameter `username` dengan data `pembuat` atau melakukan pengecekan role untuk atasan. Misalnya, endpoint `update($id)` memastikan bahwa user yang melakukan update adalah pembuat kegiatan atau memiliki `role = 'atasan'`.

Password di-hash menggunakan bcrypt melalui `Hash::make()` saat registrasi dan diverifikasi dengan `Hash::check()` saat login, memastikan kredensial tidak pernah tersimpan dalam plain text. Laravel juga menyediakan CSRF protection secara default untuk form submission, meskipun pada API stateless ini CSRF token tidak digunakan.

Rate limiting diterapkan melalui middleware API default Laravel yang membatasi jumlah request per menit untuk mencegah abuse. Configuration rate limit dapat disesuaikan di file `app/Providers/RouteServiceProvider.php` atau melalui middleware throttle custom.

Cross-Origin Resource Sharing (CORS) dikonfigurasi di file `config/cors.php` untuk mengizinkan request dari frontend React yang berjalan di port berbeda selama development. Allowed origins, methods, dan headers didefinisikan secara eksplisit untuk security yang lebih ketat.

---

4.5 Pemodelan Database

4.5.1 Entity Relationship Diagram

Pemodelan database sistem informasi kegiatan dirancang dengan dua entitas utama yaitu `users` dan `activities` yang memiliki relasi one-to-many, dimana satu user dapat membuat banyak kegiatan. Meskipun relasi foreign key tidak diimplementasikan secara eksplisit di level database untuk fleksibilitas, relasi logis dijaga melalui field `pembuat` pada tabel `activities` yang mereferensikan `username` dari tabel `users`.

Entitas `users` merepresentasikan pengguna sistem baik dengan role atasan maupun bawahan, sementara entitas `activities` merepresentasikan kegiatan-kegiatan yang dibuat oleh pengguna. Relasi tambahan yang bersifat many-to-many secara implisit terjadi melalui field `orang_terkait` yang menyimpan array username peserta kegiatan, memungkinkan satu kegiatan melibatkan banyak user dan satu user terlibat dalam banyak kegiatan.

4.5.2 Tabel Users

Tabel `users` merupakan tabel master yang menyimpan informasi pengguna sistem dengan struktur field sebagai berikut:

- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Identifier unik untuk setiap user
- `name` (VARCHAR): Nama lengkap pengguna
- `username` (VARCHAR, UNIQUE): Username untuk login, unik untuk setiap pengguna
- `email` (VARCHAR, UNIQUE): Alamat email pengguna, unik untuk keperluan komunikasi dan recovery
- `password` (VARCHAR): Password yang di-hash menggunakan algoritma bcrypt
- `role` (ENUM: 'atasan', 'bawahan'): Role pengguna untuk access control
- `opd` (VARCHAR): Organisasi Perangkat Daerah tempat pengguna berafiliasi
- `nomor_hp` (VARCHAR, NULLABLE): Nomor telepon untuk keperluan kontak
- `is_approved` (BOOLEAN, DEFAULT FALSE): Status approval user oleh atasan
- `approved_by` (VARCHAR, NULLABLE): Username atasan yang melakukan approval
- `approved_at` (TIMESTAMP, NULLABLE): Waktu approval dilakukan
- `remember_token` (VARCHAR, NULLABLE): Token untuk fitur "remember me" pada login
- `email_verified_at` (TIMESTAMP, NULLABLE): Waktu verifikasi email
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

Tabel ini memiliki constraint unique pada field `username` dan `email` untuk memastikan tidak ada duplikasi. Field `password` selalu di-hash sebelum disimpan menggunakan bcrypt yang menghasilkan hash 60 karakter dengan salt otomatis.

4.5.3 Tabel Activities

Tabel `activities` merupakan tabel transaksional yang menyimpan informasi kegiatan dengan struktur field yang komprehensif:

- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Identifier unik untuk setiap kegiatan
- `no` (INTEGER): Nomor urut kegiatan untuk keperluan display
- `judul` (VARCHAR): Judul kegiatan yang deskriptif
- `kegiatan` (VARCHAR): Nama singkat kegiatan (legacy field)
- `tanggal` (DATE): Tanggal mulai pelaksanaan kegiatan
- `tanggal_berakhir` (DATE, NULLABLE): Tanggal berakhir untuk kegiatan multi-hari
- `jam_mulai` (TIME): Jam mulai kegiatan
- `jam_berakhir` (TIME): Jam berakhir kegiatan
- `jam` (VARCHAR): Field legacy untuk waktu kegiatan
- `lokasi` (VARCHAR): Tempat pelaksanaan kegiatan
- `tempat` (VARCHAR): Field legacy untuk lokasi
- `jenis_kegiatan` (VARCHAR): Kategori kegiatan seperti Rapat, Kunjungan, Sosialisasi, Pelatihan
- `jenis` (VARCHAR): Field legacy untuk jenis
- `visibility` (ENUM: 'public', 'private', 'kantor'): Tingkat visibilitas kegiatan
- `deskripsi` (TEXT, NULLABLE): Deskripsi detail kegiatan dengan dukungan rich text
- `pembuat` (VARCHAR): Username pembuat kegiatan, referensi logis ke tabel users
- `opd` (VARCHAR): OPD penyelenggara kegiatan
- `orang_terkait` (TEXT, NULLABLE): Daftar username peserta internal dalam format comma-separated atau JSON
- `external_contacts` (JSON, NULLABLE): Array kontak eksternal dengan struktur {nama, telepon, email}
- `media` (JSON, NULLABLE): Array path file foto/video yang diupload
- `repeat` (ENUM: 'yes', 'no', DEFAULT 'no'): Flag kegiatan berulang
- `repeat_frequency` (ENUM: 'daily', 'weekly', 'monthly', 'yearly', NULLABLE): Frekuensi pengulangan
- `repeat_end_date` (DATE, NULLABLE): Batas tanggal pengulangan
- `is_approved` (BOOLEAN, DEFAULT FALSE): Status approval untuk publikasi
- `approved_by` (VARCHAR, NULLABLE): Username atasan yang melakukan approval
- `approved_at` (TIMESTAMP, NULLABLE): Waktu approval dilakukan
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

Tabel ini menggunakan tipe data JSON untuk field `external_contacts` dan `media` agar dapat menyimpan struktur data kompleks dengan fleksibel. SQLite mendukung JSON melalui extension yang otomatis tersedia di versi modern.

4.5.4 Tabel Pendukung

Selain dua tabel utama, sistem juga menggunakan tabel-tabel pendukung Laravel default:

**Tabel `password_reset_tokens`:**
- `email` (VARCHAR, PRIMARY KEY): Email pengguna yang request reset password
- `token` (VARCHAR): Token random untuk verifikasi reset password
- `created_at` (TIMESTAMP): Waktu pembuatan token untuk keperluan expiry

**Tabel `sessions`:**
- `id` (VARCHAR, PRIMARY KEY): Session ID unik
- `user_id` (BIGINT, NULLABLE, INDEX): Reference ke user yang sedang login
- `ip_address` (VARCHAR): IP address client
- `user_agent` (TEXT): Browser/device information
- `payload` (LONGTEXT): Session data ter-serialize
- `last_activity` (INTEGER, INDEX): Timestamp aktivitas terakhir

**Tabel `cache` dan `jobs`:**
Tabel-tabel ini digunakan untuk caching dan queue processing, meskipun dalam implementasi saat ini belum dimanfaatkan secara aktif.

4.5.5 Indexing dan Optimasi

Untuk meningkatkan performa query, sistem menerapkan indexing pada field-field yang sering digunakan untuk filtering dan joining:

- Index pada `users.username` untuk query login dan referensi pembuat
- Index pada `users.email` untuk query authentication
- Index pada `activities.pembuat` untuk query listing kegiatan per user
- Index pada `activities.tanggal` untuk query agenda hari ini/besok
- Index pada `activities.opd` untuk query filtering per OPD
- Index pada `activities.visibility` untuk query filtering visibility
- Composite index pada `(tanggal, jam_mulai)` untuk sorting agenda

Migration file `2025_11_30_add_indexes_for_performance.php` mendefinisikan index-index ini yang diterapkan setelah tabel terisi data untuk mempercepat query kompleks seperti filtering kegiatan berdasarkan multiple criteria.

4.5.6 Data Types dan Constraints

Pemilihan tipe data dirancang dengan mempertimbangkan efisiensi storage dan kebutuhan validasi:

- **VARCHAR**: Digunakan untuk string dengan panjang variabel seperti nama, email, username dengan length yang disesuaikan (default 255)
- **TEXT**: Untuk konten panjang seperti deskripsi kegiatan yang tidak memiliki batas pasti
- **JSON**: Untuk struktur data kompleks seperti array media dan kontak eksternal yang memerlukan flexibility
- **DATE**: Untuk tanggal dengan format YYYY-MM-DD tanpa komponen waktu
- **TIME**: Untuk jam dengan format HH:MM:SS
- **TIMESTAMP**: Untuk datetime lengkap dengan timezone awareness
- **ENUM**: Untuk field dengan nilai-nilai terbatas seperti role, visibility, repeat_frequency untuk memastikan data integrity
- **BOOLEAN**: Untuk flag true/false seperti is_approved

Constraint NOT NULL diterapkan pada field-field mandatory seperti `judul`, `tanggal`, `jam_mulai`, `visibility`, `pembuat` untuk memastikan data selalu valid dan lengkap.

4.5.7 Migrasi Bertahap

Schema database berkembang secara iteratif melalui migration files yang tersimpan di `database/migrations/`. Strategi migrasi bertahap ini memungkinkan pengembangan incremental tanpa mengganggu data existing:

1. **Migration awal** (`2025_11_09_160317_create_activities_table.php`): Membuat tabel activities dengan field minimal (no, kegiatan, tanggal, jam, tempat, jenis)
2. **Migration full fields** (`2025_11_23_120029_add_full_fields_to_activities_table.php`): Menambahkan field lengkap seperti judul, jenis_kegiatan, jam_mulai, jam_berakhir, lokasi, visibility, deskripsi, orang_terkait, pembuat, media
3. **Migration repeat fields** (`2025_11_23_161359_add_repeat_fields_to_activities_table.php`): Menambahkan field repeat, repeat_frequency untuk fitur recurring events
4. **Migration tanggal berakhir** (`2025_11_23_174250_add_tanggal_berakhir_to_activities_table.php`): Menambahkan field tanggal_berakhir untuk kegiatan multi-hari
5. **Migration repeat end date** (`2025_11_23_175641_add_repeat_end_date_to_activities_table.php`): Menambahkan field repeat_end_date untuk batas pengulangan
6. **Migration approval** (`2025_11_24_061547_add_user_approval_fields_to_users_table.php`): Menambahkan field is_approved, approved_by, approved_at ke tabel users
7. **Migration visibility update** (`2025_11_26_114600_update_visibility_to_string_in_activities_table.php`): Mengubah tipe visibility dari enum (public, private) menjadi string untuk mendukung nilai 'kantor'
8. **Migration OPD** (`2025_11_30_120000_add_opd_to_users_table.php` dan `2025_11_30_120100_add_opd_to_activities_table.php`): Menambahkan field opd untuk multi-organisasi support
9. **Migration indexes** (`2025_11_30_add_indexes_for_performance.php`): Menambahkan index untuk optimasi query

Setiap migration dapat di-rollback jika terjadi masalah menggunakan method `down()` yang mendefinisikan operasi reverse.

4.5.8 Normalisasi Database

Database dirancang dengan tingkat normalisasi 3NF (Third Normal Form) untuk menghindari redundansi data sambil tetap menjaga performa query:

- **1NF**: Setiap kolom berisi nilai atomic, tidak ada repeating groups kecuali pada field JSON yang disengaja untuk flexibility
- **2NF**: Semua non-key attributes fully dependent pada primary key (id)
- **3NF**: Tidak ada transitive dependency, field-field seperti approved_by tidak dependent pada non-key field lain

Denormalisasi terkontrol dilakukan pada beberapa field seperti `pembuat` dan `opd` yang menyimpan nilai string alih-alih foreign key untuk kemudahan query dan menghindari join overhead pada operasi yang frequent.

4.5.9 Data Integrity dan Consistency

Integritas data dijaga melalui beberapa mekanisme:

- **Application-level validation**: Laravel validation rules memastikan data yang masuk sesuai format sebelum disimpan ke database
- **Unique constraints**: Field username dan email di tabel users mencegah duplikasi
- **Enum constraints**: Field dengan nilai terbatas (role, visibility, repeat_frequency) mencegah nilai invalid
- **Default values**: Field seperti `is_approved = false`, `repeat = 'no'` memiliki default value yang konsisten
- **Nullable definition**: Field yang boleh kosong ditandai NULLABLE secara eksplisit untuk menghindari ambiguitas
- **Timestamp auto-update**: Field `created_at` dan `updated_at` otomatis dikelola oleh Laravel Eloquent

Consistency dijaga melalui transaksi database pada operasi-operasi critical seperti approval user yang melibatkan update is_approved dan pengiriman email, dipastikan kedua operasi berhasil atau rollback bersama.

4.5.10 Scalability Considerations

Meskipun saat ini menggunakan SQLite untuk kemudahan development dan deployment, schema dirancang agar mudah dimigrasikan ke RDBMS lain seperti MySQL atau PostgreSQL untuk production dengan traffic tinggi. Perubahan yang diperlukan hanya konfigurasi di file `.env` dan penyesuaian minor pada migration files jika ada tipe data specific.

Strategi untuk menangani growth data mencakup partitioning tabel activities berdasarkan tanggal (yearly atau quarterly), implementasi archival mechanism untuk kegiatan lama, dan penggunaan cache layer (Redis/Memcached) untuk query yang frequently accessed seperti listing agenda hari ini. Indexing yang sudah diterapkan memastikan query tetap performant meskipun jumlah record mencapai puluhan ribu.

---
