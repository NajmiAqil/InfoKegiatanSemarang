import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetailKegiatan.css';

interface User {
  id: number;
  name: string;
  username: string;
  nomor_hp?: string;
}

interface Activity {
  no: number;
  kegiatan: string;
  tanggal: string;
  tanggal_berakhir?: string;
  jam: string;
  jam_mulai?: string;
  jam_berakhir?: string;
  tempat: string;
  jenis?: string;
  jenis_kegiatan?: string;
  lokasi?: string;
  visibility?: string;
  deskripsi?: string;
  orang_terkait?: string;
  external_contacts?: string | string[] | { nama: string; nomor: string }[];
  pembuat?: string;
  media?: string | string[];
  repeat?: string;
  repeat_frequency?: string;
  repeat_end_date?: string;
}

const DetailKegiatan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Scroll ke atas saat halaman detail dibuka
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users/approved');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchActivityDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const username = sessionStorage.getItem('detailUsername') || localStorage.getItem('username') || sessionStorage.getItem('username') || '';
      const role = localStorage.getItem('role') || 'bawahan';
      const roleParam = role ? `&role=${role}` : '';
      const url = `/api/activities/${id}${username ? `?username=${encodeURIComponent(username)}` : ''}${roleParam}`;
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Kegiatan tidak ditemukan');
        } else if (response.status === 403) {
          setError('Anda tidak memiliki akses untuk melihat kegiatan ini');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }
      const data = await response.json();
      setActivity(data);
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('Gagal memuat detail kegiatan');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActivityDetail();
    fetchUsers();
  }, [fetchActivityDetail, fetchUsers]);

  

  const getDisplayNamesForOrangTerkait = (orangTerkait: string | undefined) => {
    if (!orangTerkait) return '';
    try {
      const usernames = JSON.parse(orangTerkait);
      if (!Array.isArray(usernames)) return orangTerkait;
      return usernames
        .map(username => {
          const user = users.find(u => u.username === username);
          return user
            ? `${user.name} (${user.nomor_hp || '-'})`
            : username;
        })
        .join(', ');
    } catch (e) {
      // If not JSON, return as-is (legacy data)
      return orangTerkait;
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return dateStr;
  };

  const formatExternalContacts = (contacts: string | string[] | { nama: string; nomor: string }[] | undefined) => {
    if (!contacts) return '';
    
    // If it's already a string, try to parse it as JSON first
    if (typeof contacts === 'string') {
      try {
        const parsed = JSON.parse(contacts);
        if (Array.isArray(parsed)) {
          return parsed
            .map((contact: any) => {
              const name = contact.name || contact.nama || '';
              const phone = contact.phone || contact.nomor || '-';
              const email = contact.email || '-';
              return `${name}(${phone};${email})`;
            })
            .join('\n');
        }
      } catch {
        // If parsing fails, return as-is
        return contacts;
      }
      return contacts;
    }
    
    // If it's an array
    if (Array.isArray(contacts)) {
      // Check if it's array of objects
      if (contacts.length > 0 && typeof contacts[0] === 'object') {
        return contacts
          .map((contact: any) => {
            const name = contact.name || contact.nama || '';
            const phone = contact.phone || contact.nomor || '-';
            const email = contact.email || '-';
            return `${name}(${phone};${email})`;
          })
          .join('\n');
      }
      // If it's array of strings
      return (contacts as string[]).join('\n');
    }
    
    return String(contacts);
  };

  if (isLoading) {
    return (
      <div className="detail-kegiatan">
        <div className="loading-message">Memuat detail kegiatan...</div>
      </div>
    );
  }

  const getBackPath = () => {
    // Check if there's a stored path from where user navigated
    const fromPath = sessionStorage.getItem('fromPath');
    
    // If fromPath exists, use it (will be '/' for homepage, '/atasan' or '/bawahan' for dashboards)
    if (fromPath) {
      return fromPath;
    }
    
    // Fallback: check if user is logged in
    const username = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
    
    // If no username (not logged in), return to homepage
    if (!username) {
      return '/';
    }
    
    // Use role from localStorage to determine back path
    const role = localStorage.getItem('role') || 'bawahan';
    return role === 'atasan' ? '/atasan' : '/bawahan';
  };

  if (error || !activity) {
    return (
      <div className="detail-kegiatan">
        <div className="error-container">
          <h2>{error || 'Kegiatan tidak ditemukan'}</h2>
          <button onClick={() => navigate(getBackPath())} className="btn-back">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-kegiatan">
      <header className="detail-header">
        <div className="header-content">
          <button onClick={() => navigate(getBackPath())} className="btn-back">
            ← Kembali
          </button>
          <div className="logo-container">
            <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" loading="lazy" />
            <h1>DETAIL KEGIATAN</h1>
          </div>
        </div>
      </header>

      <main className="detail-content">
        <div className="detail-card">
          {/* Header Section */}
          <div 
            className="detail-hero"
            style={{
              backgroundImage: activity.media && (Array.isArray(activity.media) ? activity.media[0] : activity.media) 
                ? `linear-gradient(rgba(139, 11, 11, 0.85), rgba(166, 27, 27, 0.85)), url(/storage/${Array.isArray(activity.media) ? activity.media[0] : activity.media})`
                : 'linear-gradient(135deg, #8b0b0b 0%, #a61b1b 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="detail-badge">
              {activity.jenis_kegiatan || activity.jenis || 'Kegiatan'}
            </div>
            <h1 className="detail-title">{activity.kegiatan}</h1>
            {activity.visibility && (
              <span className={`visibility-badge ${activity.visibility.toLowerCase()}`}>
                {activity.visibility === 'public' && '🌐 Publik'}
                {activity.visibility === 'private' && '🔒 Privat'}
                {activity.visibility === 'kantor' && '🏢 Kantor'}
              </span>
            )}
          </div>

          {/* Media */}
          {activity.media && (Array.isArray(activity.media) ? activity.media.length > 0 : activity.media) && (
            <div className="detail-section">
              <h3>📎 Media</h3>
              <div className="media-container">
                {Array.isArray(activity.media) ? (
                  // Handle array of media files
                  activity.media.map((mediaFile, index) => {
                    const isImage = typeof mediaFile === 'string' && mediaFile.match(/\.(jpg|jpeg|png|gif)$/i);
                    const mediaUrl = `http://localhost:8000/storage/${mediaFile}`;
                    return (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        {isImage ? (
                          <img 
                            src={mediaUrl} 
                            alt={`Media kegiatan ${index + 1}`}
                            className="media-image"
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                            loading="lazy"
                          />
                        ) : (
                          <a 
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="media-link"
                          >
                            📄 Lihat File: {mediaFile}
                          </a>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Handle single media file (string)
                  (() => {
                    const isImage = typeof activity.media === 'string' && activity.media.match(/\.(jpg|jpeg|png|gif)$/i);
                    const mediaUrl = `http://localhost:8000/storage/${activity.media}`;
                    return isImage ? (
                      <img 
                        src={mediaUrl} 
                        alt="Media kegiatan"
                        className="media-image"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                        loading="lazy"
                      />
                    ) : (
                      <a 
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="media-link"
                      >
                        📄 Lihat File: {activity.media}
                      </a>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="detail-grid">
            {/* Tanggal */}
            <div className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <label>Tanggal</label>
                <p>{formatDisplayDate(activity.tanggal)}</p>
                {activity.tanggal_berakhir && activity.tanggal_berakhir !== activity.tanggal && (
                  <p className="subtitle">s/d {formatDisplayDate(activity.tanggal_berakhir)}</p>
                )}
              </div>
            </div>

            {/* Waktu */}
            <div className="info-item">
              <div className="info-icon">🕐</div>
              <div className="info-content">
                <label>Waktu</label>
                <p>
                  {activity.jam_mulai || activity.jam || '-'}
                  {activity.jam_berakhir && ` - ${activity.jam_berakhir}`}
                </p>
              </div>
            </div>

            {/* Lokasi */}
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <label>Lokasi</label>
                <p>{activity.lokasi || activity.tempat}</p>
              </div>
            </div>

            {/* Pembuat */}
            {activity.pembuat && (
              <div className="info-item">
                <div className="info-icon">👤</div>
                <div className="info-content">
                  <label>Penulis</label>
                  <p>{activity.pembuat}</p>
                </div>
              </div>
            )}
          </div>

          {/* Deskripsi */}
          {activity.deskripsi && (
            <div className="detail-section">
              <h3>📝 Deskripsi</h3>
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ __html: activity.deskripsi }}
              />
            </div>
          )}

          {/* Orang Terkait */}
          {activity.orang_terkait && (
            <div className="detail-section">
              <h3>👥 Orang Terkait</h3>
              <p>{getDisplayNamesForOrangTerkait(activity.orang_terkait)}</p>
            </div>
          )}

          {/* Orang dari Luar */}
          {activity.external_contacts && (
            <div className="detail-section">
              <h3>👤 GUEST</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{formatExternalContacts(activity.external_contacts)}</p>
            </div>
          )}

          {/* Repeat Info */}
          {activity.repeat === 'yes' && activity.repeat_frequency && (
            <div className="detail-section">
              <h3>🔄 Pengulangan</h3>
              <p>
                Kegiatan ini berulang setiap{' '}
                <strong>
                  {activity.repeat_frequency === 'daily' && 'Hari'}
                  {activity.repeat_frequency === 'weekly' && 'Minggu'}
                  {activity.repeat_frequency === 'monthly' && 'Bulan'}
                  {activity.repeat_frequency === 'yearly' && 'Tahun'}
                </strong>
                {activity.repeat_end_date && (
                  <span> sampai {formatDisplayDate(activity.repeat_end_date)}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="detail-footer">
        <p>&copy; {new Date().getFullYear()} Diskominfo Kota Semarang</p>
      </footer>
    </div>
  );
};

export default DetailKegiatan;
