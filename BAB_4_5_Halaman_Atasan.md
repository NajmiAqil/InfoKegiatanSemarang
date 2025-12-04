# BAB 4.5 - Halaman Atasan

**Format: Times New Roman 12pt, 1.5 spasi, Justified**

---

## 4.5 Halaman Atasan

### 4.5.1 Dashboard Halaman Atasan

Halaman Atasan merupakan antarmuka terpusat bagi pengguna dengan role atasan untuk melakukan pemantauan dan pengelolaan kegiatan secara menyeluruh. Tampilan utama menyajikan ringkasan agenda (Hari Ini dan Besok), filter Divisi/OPD, pilihan mode tampilan Kalender dan Tabel, tombol tambah kegiatan baru, serta indikator waktu berjalan (tanggal dan jam WIB) di bagian header. Aksi Edit dan Hapus tersedia bagi atasan untuk seluruh kegiatan, termasuk kegiatan yang bersifat private atau pending, sesuai kebijakan akses yang telah diimplementasikan.

[Pasted Image]

*Gambar 4.5.1 Tampilan Dashboard Halaman Atasan*

Bagian agenda disusun dalam tabel terstruktur yang terdiri atas kolom nomor, judul kegiatan, tanggal, jam, pembuat, lokasi, dan aksi. Filter Divisi memungkinkan penyaringan berdasarkan OPD tertentu atau opsi "Semua Divisi" untuk menampilkan keseluruhan data lintas OPD. Tombol mode memberikan transisi cepat antara tampilan Kalender dan Tabel agar atasan dapat menyesuaikan gaya pemantauan sesuai kebutuhan. Penyajian informasi dilakukan secara ringkas dan informatif sehingga memudahkan proses pengambilan keputusan oleh atasan.

Pada contoh tampilan dashboard, bagian "AGENDA BESOK" menyajikan daftar kegiatan yang akan berlangsung keesokan hari dengan kolom nomor, kegiatan, tanggal, jam, pembuat, tempat, serta aksi. Tombol `Edit` berwarna oranye dan `Hapus` berwarna merah marun tersedia pada setiap baris sehingga atasan dapat melakukan pembaruan atau penghapusan data secara langsung. Di bawahnya, panel "Izin Publish Kegiatan Publik" menampilkan daftar kegiatan public yang sedang menunggu persetujuan untuk ditampilkan di halaman publik. Panel ini menyertakan tombol `Detail` untuk membuka informasi lengkap serta tombol `Izinkan` berwarna hijau sebagai aksi persetujuan. Selanjutnya, panel "Permintaan Akses" menampilkan daftar pendaftar baru dengan tombol `Terima` (hijau) dan `Tolak` (merah) untuk memproses permintaan akses sesuai kebijakan.

Kontras warna tombol aksi (oranye, merah marun, hijau) membantu membedakan konteks tindakan dengan jelas, sementara heading besar dan jarak antar-panel menjaga ritme baca dan fokus perhatian. Ikon kecil pada kolom aksi memperkuat affordance sehingga mudah dikenali sebagai tombol operasi, memberikan pengalaman interaksi yang intuitif dan efisien.

### 4.5.2 Sidebar Halaman Atasan

Sidebar berfungsi sebagai panel navigasi untuk melihat daftar bawahan yang telah disetujui, terkelompok berdasarkan OPD. Atasan dapat memilih satu bawahan untuk masuk ke perspektif bawahan, sehingga semua data kegiatan yang dimuat akan mencerminkan kegiatan milik bawahan yang dipilih.

[Pasted Image 2]

*Gambar 4.5.2 Sidebar Daftar Bawahan dalam Halaman Atasan*

Sidebar menyediakan daftar bawahan per OPD/divisi, indikator jumlah kegiatan atau badge (bila tersedia), serta tombol kembali untuk keluar dari perspektif bawahan dan kembali ke tampilan umum atasan. Penyajian yang konsisten memudahkan navigasi lintas organisasi dan mempercepat proses pemantauan.

Sidebar dibuka melalui tombol hamburger di header dan menampilkan kelompok OPD dengan daftar bawahan di bawahnya. Ketika atasan mengklik satu bawahan, sistem akan menyimpan perspektif pilihan tersebut dalam sessionStorage agar konsisten saat navigasi detail. Banner informasi muncul ketika berada dalam perspektif bawahan, dilengkapi dengan tombol kembali ke perspektif atasan untuk memudahkan navigasi bolak-balik.

Struktur hierarki (OPD → bawahan) memudahkan pemetaan mental organisasi, sementara penamaan konsisten dan badge jumlah (bila tersedia) meminimalkan beban kognitif saat memilih bawahan. Transisi halus saat membuka/menutup sidebar meningkatkan rasa responsif dan memberikan pengalaman pengguna yang lebih menyenangkan.

### 4.5.3 Tampilan Jadwal Kegiatan Bawahan dari Perspektif Atasan

Saat atasan memilih bawahan dari sidebar, sistem menampilkan banner notifikasi di bagian atas yang menginformasikan bahwa atasan sedang "Melihat perspektif: <Nama Bawahan> (@username)". Tampilan agenda dan kalender akan menyesuaikan untuk hanya menampilkan jadwal milik bawahan tersebut. Aksi yang relevan seperti Edit dan Hapus tetap tersedia bagi atasan sesuai wewenang.

[Pasted Image 3]

*Gambar 4.5.3 Jadwal Kegiatan Bawahan yang Dilihat melalui Perspektif Atasan*

Fitur ini mendukung pengawasan lintas OPD dan memudahkan koordinasi, karena atasan dapat melakukan peninjauan langsung terhadap kegiatan tim tanpa harus berpindah akun. Penyajian informasi jadwal bawahan mengikuti format dan konsistensi tampilan yang sama seperti pada dashboard atasan, sehingga pengalaman pengguna tetap seragam.

Atasan dapat melihat seluruh kegiatan milik bawahan, termasuk yang bersifat private dan pending, untuk memastikan transparansi dan akuntabilitas. Aksi `Edit` dan `Hapus` tetap dibatasi pada pengulangan (occurrence) agar perubahan dilakukan pada sumber kegiatan asli, menjaga integritas data jadwal berulang. Detail kegiatan menghadirkan informasi pembuat, lokasi, waktu, deskripsi, media, orang terkait, serta GUEST (kontak eksternal) dalam format yang seragam, memudahkan pemahaman konteks kegiatan secara menyeluruh.

Format kartu kegiatan dan badge tetap seragam di semua perspektif, dengan penempatan informasi (judul, waktu, lokasi) mengikuti pola berulang untuk mempercepat scanning visual. Teks deskripsi mendukung formatting sehingga catatan penting lebih mudah ditonjolkan, memberikan fleksibilitas dalam penyampaian informasi detail yang terstruktur.

### 4.5.4 Izin Publish Kegiatan

Pada Halaman Atasan terdapat tabel khusus yang memuat daftar kegiatan yang menunggu izin publikasi (pending approval). Atasan dapat membuka detail kegiatan, melakukan peninjauan cepat, kemudian menekan tombol `Izinkan` untuk mempublikasikan kegiatan agar dapat dilihat oleh semua orang di halaman publik.

[Pasted Image 4]

*Gambar 4.5.4 Bukti Proses Mengizinkan Publish Kegiatan oleh Atasan*

Tabel ini memuat kolom judul, tanggal, waktu, pembuat, OPD, serta aksi. Setelah proses izin berhasil, sistem menampilkan notifikasi keberhasilan dan daftar pending akan diperbarui. Mekanisme ini memastikan bahwa hanya kegiatan yang telah diverifikasi oleh atasan yang tampil pada halaman publik, menjaga kualitas informasi yang disajikan kepada masyarakat.

Proses izin publikasi dimulai saat atasan membuka daftar pending approval dan meninjau detail kegiatan (opsional) untuk memastikan kelayakan publikasi. Dengan menekan tombol `Izinkan`, sistem akan menandai kegiatan tersebut dengan status `is_approved = true` sehingga kegiatan dapat ditampilkan di halaman publik. Notifikasi keberhasilan akan ditampilkan dan daftar pending otomatis disegarkan untuk mencerminkan perubahan status terkini.

Perlu dicatat bahwa kegiatan dengan visibilitas private atau kantor tidak memerlukan approval untuk publikasi karena kegiatan tersebut tidak ditampilkan di homepage publik. Sebaliknya, kegiatan public yang dibuat oleh bawahan memerlukan persetujuan atasan sebelum muncul di homepage untuk menjaga standar kualitas dan validitas informasi. Notifikasi pasca-approval memberikan umpan balik eksplisit kepada atasan, sementara penyegaran daftar otomatis memastikan data yang ditampilkan selalu mutakhir. Rute detail yang konsisten (`kegiatan/:id`) memastikan tidak terjadi blank page saat atasan memeriksa konten kegiatan.

### 4.5.5 Penerimaan Pendaftaran Pengguna

Halaman Atasan juga menyediakan fitur untuk memproses permintaan akses (pendaftaran) pengguna baru. Atasan dapat memilih `Terima` atau `Tolak` terhadap setiap permintaan. Jika diterima, sistem akan mencatat persetujuan dan mengirimkan notifikasi email kepada pengguna.

[Pasted Image 5]

*Gambar 4.5.5 Bukti Menerima Pendaftaran Pengguna*

Tabel permintaan akses menampilkan nama, username, email, dan tanggal daftar. Tindakan persetujuan atau penolakan akan memperbarui status pendaftar di sistem secara real-time. Proses ini memastikan bahwa pengguna yang bergabung telah melalui tahapan verifikasi oleh atasan sebelum mendapatkan akses penuh ke sistem.

Alur penerimaan pendaftaran dimulai saat atasan membuka daftar "Permintaan Akses" dan meninjau data pendaftar yang mencakup nama, username, email, dan tanggal daftar. Atasan kemudian memilih `Terima` atau `Tolak` sesuai kebijakan organisasi. Jika memilih `Terima`, sistem akan mencatat persetujuan dan mengirimkan email notifikasi kepada pendaftar, kemudian memperbarui daftar pendaftar sehingga pengguna yang diterima muncul di sidebar bawahan untuk akses cepat.

Sistem menampilkan notifikasi saat operasi berhasil atau gagal untuk memberikan umpan balik yang jelas kepada atasan. Bila terjadi masalah jaringan, sistem akan menampilkan pesan yang meminta atasan untuk memeriksa koneksi dan mencoba kembali. Warna tombol `Terima` dan `Tolak` konsisten dengan pola tindakan positif/negatif, mempermudah pengenalan visual. Tabel dirancang ringkas dengan kolom nama, username, email, dan tanggal daftar demi kecepatan verifikasi, sementara proses `Terima` otomatis mengintegrasi pengguna baru ke sidebar bawahan untuk alur kerja tanpa jeda.

---