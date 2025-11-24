import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetailKegiatan.css';

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

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all activities and find the one with matching id
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Combine all activities
      const allActivities = [...(data.today || []), ...(data.tomorrow || [])];
      
      // Find activity by id (no)
      const foundActivity = allActivities.find((act: Activity) => act.no === Number(id));
      
      if (!foundActivity) {
        setError('Kegiatan tidak ditemukan');
      } else {
        setActivity(foundActivity);
      }
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('Gagal memuat detail kegiatan');
    } finally {
      setIsLoading(false);
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
    
    const usernameLower = username.toLowerCase();
    
    // Determine if user is atasan or bawahan
    if (usernameLower === 'mahes' || usernameLower === 'yani') {
      return '/bawahan';
    } else {
      return '/atasan';
    }
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
            <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" />
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
                {activity.visibility === 'public' ? '🌐 Publik' : '🔒 Privat'}
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
              <p>{activity.orang_terkait}</p>
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
