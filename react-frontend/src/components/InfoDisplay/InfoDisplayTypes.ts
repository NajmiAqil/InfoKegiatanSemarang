export interface Activity {
  no: number;
  id?: number;
  kegiatan: string;
  tanggal: string; // human-readable date like '10 Nov 2025' or ISO
  jam: string;
  tempat: string;
  jenis?: 'today' | 'tomorrow';
  pembuat?: string;
  media?: string | string[];
  deskripsi?: string;
}

export interface Berita {
  id: number;
  kategori: string;
  judul: string;
  tanggal: string;
  deskripsi: string;
  media?: string | string[];
}
