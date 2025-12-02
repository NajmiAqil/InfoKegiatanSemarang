export interface Activity {
  no: number;
  id?: number;
  kegiatan: string;
  judul?: string;
  tanggal: string; // human-readable date like '10 Nov 2025' or ISO
  tanggal_berakhir?: string; // ISO end date if multi-day
  jam: string;
  jam_mulai?: string; // HH:MM
  jam_berakhir?: string; // HH:MM
  tempat: string;
  jenis?: 'today' | 'tomorrow';
  pembuat?: string;
  opd?: string;
  media?: string | string[];
  deskripsi?: string;
  visibility?: string; // public | private | kantor
  created_at?: string; // ISO timestamp when activity was created
  updated_at?: string; // ISO timestamp when activity was updated
  is_approved?: boolean; // Approval status for public activities
  approved_by?: string; // Username of atasan who approved
  approved_at?: string; // Timestamp when approved
}

export interface Berita {
  id: number;
  kategori: string;
  judul: string;
  tanggal: string;
  deskripsi: string;
  media?: string | string[];
}
