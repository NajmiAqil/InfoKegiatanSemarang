# BAB 4.4 - Halaman Tambah, Edit, dan Detail Kegiatan

**Format: Times New Roman 12pt, 1.5 spasi, Justified**

---

## 4.4 Halaman Tambah, Edit, dan Detail Kegiatan

### 4.4.1 Halaman Tambah Kegiatan

Halaman Tambah Kegiatan dan Halaman Edit Kegiatan merupakan antarmuka formulir yang memungkinkan pengguna untuk menambahkan kegiatan baru atau mengubah informasi kegiatan yang sudah ada. Kedua halaman ini memiliki struktur dan elemen form yang identik, dengan perbedaan utama terletak pada proses pengisian data awal dimana halaman edit akan menampilkan data kegiatan yang sudah tersimpan sebelumnya. Formulir ini dirancang dengan pendekatan user-friendly yang memudahkan pengguna dalam mengelola informasi kegiatan secara lengkap dan terstruktur.

[Pasted Image]

*Gambar 4.4.1 Tampilan Halaman Tambah Kegiatan dengan Visibility Public*

Tampilan formulir dibagi menjadi beberapa section yang terorganisir dengan baik. Section pertama berisi informasi dasar kegiatan yang terdiri dari field Judul Kegiatan, Tanggal Kegiatan, dan Tanggal Berakhir yang mendukung kegiatan multi-hari. Pengguna dapat memasukkan judul kegiatan dengan maksimal 255 karakter, memilih tanggal mulai menggunakan date picker, dan menentukan tanggal berakhir jika kegiatan berlangsung lebih dari satu hari. Field tanggal berakhir bersifat opsional dan akan otomatis terisi sama dengan tanggal mulai jika tidak diubah oleh pengguna.

Section kedua mengatur waktu pelaksanaan kegiatan melalui field Jenis Kegiatan yang berupa dropdown dengan pilihan seperti Rapat, Kunjungan, Sosialisasi, Pelatihan, dan lainnya. Terdapat juga field Jam Mulai dan Jam Berakhir yang menggunakan time picker interaktif dengan tampilan jam analog yang memudahkan pemilihan waktu. Time picker ini memiliki dua mode yaitu mode jam dan mode menit yang dapat diaktifkan dengan tombol toggle, sehingga pengguna dapat memilih waktu dengan presisi tinggi baik untuk jam maupun menit.

Informasi lokasi dan visibilitas kegiatan diatur pada section ketiga. Field Lokasi Kegiatan memungkinkan pengguna memasukkan tempat pelaksanaan kegiatan baik berupa nama gedung, ruangan, alamat lengkap, atau lokasi virtual seperti link meeting online. Dropdown Visibilitas memberikan tiga opsi yaitu Public yang berarti kegiatan dapat dilihat semua orang di homepage, Private yang hanya bisa dilihat oleh pembuat dan orang terkait, serta Kantor yang hanya dapat diakses oleh pengguna dalam OPD yang sama. Setiap opsi visibilitas dilengkapi dengan penjelasan singkat yang muncul sebagai helper text di bawah dropdown, seperti yang terlihat pada Gambar 4.4.1 dimana terdapat keterangan "Bisa dilihat semua orang" untuk visibility Public.

Field Divisi/OPD ditampilkan dengan behavior yang berbeda tergantung role pengguna. Untuk role bawahan, field ini otomatis terisi dengan OPD pengguna dan bersifat read-only dengan background abu-abu untuk menunjukkan bahwa tidak dapat diubah. Sementara untuk role atasan, field ini dapat diubah dan memungkinkan pemilihan OPD dari daftar yang tersedia. Hal ini mengakomodasi kebutuhan atasan yang mungkin perlu membuat kegiatan atas nama OPD tertentu atau kegiatan lintas OPD.

Section pengaturan pengulangan kegiatan (repeat) memberikan fleksibilitas untuk kegiatan yang bersifat rutin. Pengguna dapat memilih radio button antara "Tidak Repeat" atau "Repeat", dan jika memilih repeat maka akan muncul dropdown Frekuensi Repeat dengan opsi Setiap Hari, Setiap Minggu, Setiap Bulan, dan Setiap Tahun. Terdapat juga field Batas Repeat yang memungkinkan pengguna menentukan sampai tanggal berapa pengulangan kegiatan akan berlangsung, dengan dua pilihan yaitu "Tanpa Batas" yang berarti kegiatan akan terus berulang tanpa batas waktu atau "Sampai Tanggal Tertentu" yang mengaktifkan date picker untuk memilih tanggal akhir pengulangan.

Upload file media didukung melalui section Upload Foto/Video yang menggunakan input file multiple dengan validasi tipe dan ukuran. Sistem menerima format gambar (JPEG, PNG, JPG, GIF, WebP, HEIC) dan video (MP4, AVI, MOV) dengan batas maksimal 50MB per file. Setelah file dipilih, akan muncul preview thumbnail untuk gambar atau nama file untuk video, dilengkapi dengan tombol remove (X) berwarna merah untuk menghapus file yang tidak diinginkan. Pada Gambar 4.4.1 terlihat bahwa file "898282.png" telah dipilih dan ditampilkan dalam section "1 file dipilih".

Field Deskripsi Kegiatan menggunakan rich text editor yang dilengkapi dengan toolbar formatting. Toolbar ini menyediakan berbagai opsi pemformatan teks seperti Bold (B), Italic (I), Underline (U), Strikethrough, Link, Heading, dan List (bullet/numbered). Rich text editor ini memungkinkan pengguna membuat deskripsi yang terstruktur dan mudah dibaca dengan dukungan HTML formatting, sehingga informasi detail kegiatan dapat disampaikan dengan lebih jelas dan menarik.

Section Orang yang Berhubungan menggunakan multi-select dropdown yang menampilkan daftar pengguna yang sudah diapprove dalam sistem. Dropdown ini dilengkapi dengan fitur search yang memudahkan pencarian nama pengguna dari daftar yang mungkin cukup panjang. Setiap pengguna terpilih akan ditampilkan sebagai badge/chip yang dapat dihapus dengan mengklik tombol X pada badge tersebut. Pada Gambar 4.4.1 terlihat bahwa telah dipilih beberapa orang yaitu "mahes (Pembuat)", "Aqil Najmi", "Sinta windu", dan "aly bahara". Helper text di bawah dropdown menjelaskan bahwa "Jika visibility Private, kegiatan akan terlihat di jalur orang yang terkait meski beda OPD" untuk memberikan pemahaman tentang aturan visibilitas yang berlaku.

Fitur "Ada Orang dari Luar" memungkinkan pengguna menambahkan informasi kontak eksternal yang tidak terdaftar dalam sistem. Ketika radio button "Ya" dipilih, akan muncul section "Daftar Orang dari Luar" yang berisi form dinamis dengan field Nama, Nomor Telepon, dan Email. Tombol "+ Tambah Orang Lagi" berwarna biru memungkinkan penambahan multiple kontak eksternal secara dinamis, dan setiap entry dapat dihapus menggunakan tombol "Hapus" berwarna merah. Pada Gambar 4.4.1 terlihat contoh input orang dari luar dengan nama "Mustafa Firdaus", nomor telepon "0815337239", dan email "mustafa@gmail.com". Form ini sangat berguna untuk mendokumentasikan partisipan dari luar organisasi seperti narasumber, tamu undangan, atau stakeholder eksternal.

### 4.4.2 Halaman Edit Kegiatan

[Pasted Image 2]

*Gambar 4.4.2 Tampilan Halaman Edit Kegiatan*

Halaman Edit Kegiatan memiliki tampilan dan struktur yang identik dengan halaman tambah kegiatan, namun dengan data yang sudah terisi sebelumnya dari kegiatan yang akan diedit. Pada Gambar 4.4.2 terlihat bahwa form sudah terisi dengan data kegiatan "belajar" yang memiliki tanggal 12/04/2025, jenis kegiatan Rapat, jam 02:00 - 10:00, dan lokasi Diskon. Kegiatan ini memiliki setting repeat dengan frekuensi "Setiap Minggu" dan batas repeat "Sampai Tanggal Tertentu" yaitu 12/25/2025, menunjukkan bahwa fitur pengulangan kegiatan dapat dikonfigurasi dengan fleksibel.

Pada halaman edit, media yang sudah terupload sebelumnya tidak ditampilkan dalam section khusus "File yang sudah diunggah", namun pengguna tetap dapat menambahkan file baru melalui section Upload Foto/Video. Sistem akan mempertahankan file lama yang tidak dihapus dan menambahkan file baru yang diupload. Field Orang yang Berhubungan juga sudah terisi dengan data sebelumnya dan dapat dimodifikasi dengan menambah atau menghapus pengguna dari daftar.

Di bagian bawah formulir terdapat dua tombol aksi utama yaitu tombol "Batal" dengan warna abu-abu yang akan membatalkan proses dan kembali ke halaman sebelumnya, serta tombol "Simpan Kegiatan" berwarna merah marun yang akan memproses penyimpanan data. Pada halaman edit, tombol "Simpan Kegiatan" akan melakukan update data kegiatan yang sudah ada. Kedua tombol ini memiliki efek hover yang memberikan feedback visual kepada pengguna bahwa elemen tersebut dapat diklik.

Formulir dilengkapi dengan sistem validasi yang komprehensif untuk memastikan data yang diinput sesuai dengan requirement. Field-field yang wajib diisi seperti Judul Kegiatan, Tanggal Kegiatan, Jenis Kegiatan, Jam Mulai, Jam Berakhir, Lokasi Kegiatan, dan Visibilitas akan menampilkan pesan error jika tidak diisi dengan benar. Validasi juga diterapkan pada format data seperti validasi tanggal berakhir yang tidak boleh lebih awal dari tanggal mulai, validasi jam berakhir yang harus lebih lambat dari jam mulai, serta validasi format email untuk kontak eksternal.

### 4.4.3 Halaman Detail Kegiatan

[Pasted Image 3]

*Gambar 4.4.3 Tampilan Halaman Detail Kegiatan*

Halaman Detail Kegiatan merupakan tampilan read-only yang menyajikan informasi lengkap tentang sebuah kegiatan dalam format yang informatif dan mudah dibaca. Halaman ini dapat diakses dengan mengklik kegiatan dari homepage, dashboard bawahan, atau dashboard atasan. Pada Gambar 4.4.3 terlihat detail kegiatan "Mahabaratha" yang memiliki badge visibility "Pekat" (Private) berwarna oranye di bagian hero section. Bagian header halaman menampilkan tombol "← Kembali" yang memungkinkan pengguna untuk kembali ke halaman sebelumnya sesuai dengan path asal navigasi, logo Diskominfo Kota Semarang, dan judul "DETAIL KEGIATAN" yang memberikan identitas visual pada halaman.

Section hero di bagian atas menampilkan judul kegiatan "Mahabaratha" dengan background yang menggunakan gambar media yang diupload sebagai background dengan overlay gradient merah semi-transparan, menciptakan visual yang menarik dan profesional. Di bagian ini juga ditampilkan badge "Pekat" yang menunjukkan bahwa kegiatan ini memiliki visibility Private, sehingga hanya dapat dilihat oleh pembuat dan orang-orang yang terdaftar dalam daftar orang terkait.

Section Media menampilkan gambar yang telah diupload dengan ukuran yang cukup besar dan jelas. Pada Gambar 4.4.3 terlihat bahwa media kegiatan berupa gambar karakter anime yang ditampilkan dengan proper aspect ratio dan border radius yang memberikan kesan modern. Untuk gambar dengan ekstensi JPG, JPEG, PNG, atau GIF akan ditampilkan sebagai thumbnail yang dapat diklik untuk melihat dalam ukuran penuh, sedangkan untuk file video atau file lainnya akan ditampilkan sebagai link download dengan icon dokumen dan nama file.

Info Grid menampilkan informasi dasar kegiatan dalam layout grid yang terorganisir dengan baik. Setiap item informasi dilengkapi dengan icon yang relevan seperti icon kalender untuk tanggal yang menampilkan "05 Des 2025" dengan keterangan "s/d 06 Des 2025" menunjukkan kegiatan multi-hari, icon jam untuk waktu pelaksanaan "10:00 - 02:00", icon lokasi untuk tempat "miholik", dan icon user untuk pembuat kegiatan "mahes". Format tanggal ditampilkan dalam bahasa Indonesia dengan pola yang mudah dibaca dan dipahami oleh pengguna.

Section Deskripsi Kegiatan menampilkan konten "haantin dong" yang merupakan deskripsi singkat dari kegiatan tersebut. Meskipun pada contoh ini deskripsi cukup sederhana, sistem mendukung rich text dengan formatting seperti bold, italic, heading, dan list yang telah diinput melalui rich text editor pada saat pembuatan atau pengeditan kegiatan.

Section Orang Terkait menampilkan daftar pengguna internal yang terlibat dalam kegiatan dalam format "username (-)". Pada Gambar 4.4.3 terlihat "mahes (-), Aqil Najmi (-)" yang menunjukkan bahwa mahes sebagai pembuat dan Aqil Najmi sebagai orang terkait. Data nomor telepon ditampilkan dengan tanda "-" yang menandakan informasi nomor HP tidak tersedia atau tidak diisi dalam profil pengguna tersebut.

### 4.4.4 Implementasi Access Control dan Approval Workflow

Sistem visibility control dan approval workflow merupakan fitur penting yang mengatur hak akses dan publikasi kegiatan. Proses submit form pada halaman tambah kegiatan akan mengirimkan data dalam format FormData ke endpoint API `/api/activities` menggunakan method POST. Data yang dikirim mencakup semua field form termasuk file media yang di-upload. Untuk role atasan dan kegiatan dengan visibilitas public, kegiatan akan langsung diapprove (is_approved = true), sedangkan untuk role bawahan dengan visibilitas public, kegiatan akan masuk ke status pending approval yang membutuhkan persetujuan dari atasan.

[Pasted Image 4]

*Gambar 4.4.4 Dashboard Bawahan dengan Kegiatan Private dan Public Pending Approval*

Pada Gambar 4.4.4 terlihat dashboard user "mahes" yang telah membuat kegiatan. Kalender menampilkan beberapa tanggal dengan dot indicator biru yang menunjukkan adanya kegiatan pada tanggal-tanggal tersebut seperti tanggal 5, 10, 11, 12, 18, dan 25 Desember 2025. User dengan role bawahan dapat melihat kegiatan yang mereka buat di dashboard mereka sendiri, namun untuk kegiatan public yang belum diapprove oleh atasan, kegiatan tersebut belum akan muncul di homepage publik.

[Pasted Image 5]

*Gambar 4.4.5 Homepage Tidak Menampilkan Kegiatan yang Belum Diapprove*

Gambar 4.4.5 membuktikan bahwa homepage (Informasi Kegiatan Pemerintah Kota Semarang) tidak menampilkan kegiatan apapun dengan pesan "Kegiatan Mendatang" dan keterangan "Belum ada kegiatan dalam 7 hari ke depan". Hal ini terjadi karena kegiatan dengan visibility public yang dibuat oleh user bawahan seperti "mahes" masih berstatus pending approval dan belum diizinkan terbit oleh atasan. Sistem ini memastikan bahwa hanya kegiatan yang telah diverifikasi dan disetujui oleh atasan yang dapat ditampilkan kepada publik, menjaga kualitas dan validitas informasi yang dipublikasikan.

Kegiatan dengan visibilitas private atau kantor akan otomatis diapprove tanpa memandang role pengguna karena kegiatan tersebut tidak akan ditampilkan di homepage publik. Kegiatan private hanya dapat dilihat oleh pembuat atau pengguna yang terdaftar dalam daftar orang_terkait, sementara kegiatan kantor dapat diakses oleh semua pengguna dalam OPD yang sama atau pengguna yang terdaftar dalam orang_terkait untuk mendukung kolaborasi lintas OPD.

[Pasted Image 6]

*Gambar 4.4.6 Dashboard User Aqil Najmi Menampilkan Kegiatan Private dari Mahes*

Pada Gambar 4.4.6 terlihat dashboard user "Aqil Najmi" yang menampilkan kegiatan "Mahabaratha" pada tanggal 5 Desember 2025 dengan badge "Jadwal" berwarna hijau. Meskipun kegiatan ini memiliki visibility Private dan dibuat oleh user "mahes", kegiatan tersebut dapat dilihat di dashboard Aqil Najmi karena username "Aqil Najmi" terdaftar dalam daftar Orang Terkait pada kegiatan tersebut (seperti yang terlihat pada Gambar 4.4.3). Hal ini menunjukkan implementasi access control yang tepat dimana kegiatan private dapat dibagikan secara selektif kepada pengguna tertentu yang membutuhkan informasi tersebut, bahkan jika mereka berada di OPD yang berbeda.

[Pasted Image 7]

*Gambar 4.4.7 Dashboard User Sinta Windu Tidak Menampilkan Kegiatan Private*

Sebaliknya, Gambar 4.4.7 menampilkan dashboard user "Sinta windu" pada tanggal 4 Desember 2025 yang tidak menampilkan kegiatan apapun dengan pesan "Tidak ada kegiatan". Meskipun kegiatan "Mahabaratha" ada di sistem dan akan terlihat keesokan harinya (5 Desember), user Sinta tidak dapat melihat kegiatan tersebut karena username "Sinta windu" tidak terdaftar dalam daftar Orang Terkait pada kegiatan private tersebut. Ini memvalidasi bahwa sistem access control berfungsi dengan benar dalam membatasi akses kegiatan private hanya kepada pembuat dan orang-orang yang secara eksplisit ditambahkan ke daftar orang terkait.

Implementasi time picker menggunakan komponen SVG custom yang menampilkan jam analog dengan angka-angka yang tersusun melingkar. Pengguna dapat mengklik langsung pada angka jam atau menit yang diinginkan, dan sistem akan menghitung posisi berdasarkan koordinat klik untuk menentukan nilai waktu yang dipilih. Visualisasi ini memberikan user experience yang intuitif dan modern dibandingkan dengan dropdown atau input text biasa untuk pemilihan waktu.

Keseluruhan desain halaman ini mengikuti prinsip progressive disclosure dimana informasi dan opsi yang relevan hanya ditampilkan ketika dibutuhkan, seperti field tanggal berakhir repeat yang hanya muncul saat pengguna memilih opsi "Sampai Tanggal Tertentu", atau form kontak eksternal yang hanya muncul saat pengguna memilih "Ya" pada "Ada Orang dari Luar". Pendekatan ini membuat formulir tidak terlihat overwhelming meskipun memiliki banyak field, karena kompleksitas ditampilkan secara bertahap sesuai kebutuhan pengguna. Implementasi responsive design memastikan halaman dapat diakses dengan optimal dari berbagai ukuran layar, dengan automatic scroll to top saat halaman pertama kali dibuka untuk memberikan user experience yang konsisten dan nyaman.




