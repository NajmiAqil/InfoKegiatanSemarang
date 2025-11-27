export interface Activity {
  no: number;
  id?: number;
  kegiatan: string;
  tanggal: string; // human-readable date like '10 Nov 2025' or ISO
  tanggal_berakhir?: string; // ISO end date if multi-day
  jam: string;
  jam_mulai?: string; // HH:MM
  jam_berakhir?: string; // HH:MM
  tempat: string;
  jenis?: 'today' | 'tomorrow';
  pembuat?: string;
  media?: string | string[];
  deskripsi?: string;
  visibility?: string; // public | private | kantor
}

export interface Berita {
  id: number;
  kategori: string;
  judul: string;
  tanggal: string;
  deskripsi: string;
  media?: string | string[];
}
