import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoDisplay.css';
import CalendarMonth from './CalendarMonth';
import type { Activity, Berita } from './InfoDisplayTypes';

// --- 1. Definisi Tipe Data ---

// types moved to InfoDisplayTypes.ts


// --- Komponen Utama InfoDisplay ---

const InfoDisplay = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [tomorrowActivities, setTomorrowActivities] = useState<Activity[]>([]);
  const [news, setNews] = useState<Berita[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (Logika fetchActivities) ...
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Panggil API Anda
      const response = await fetch('/api/activities'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodayActivities(data.today || []);
      setTomorrowActivities(data.tomorrow || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || !navigator.onLine) {
          setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
        } else if (error.message.includes('HTTP error! status: 404')) {
          // Jika API endpoint tidak ada/kosong, tampilkan sample data tanpa error
          setError(null);
          setTodayActivities([]);
          setTomorrowActivities([]);
        } else if (error.message.includes('HTTP error! status: 500')) {
          setError('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        } else {
          setError(`Terjadi kesalahan saat memuat data: ${error.message}`);
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHighlightActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Gabungkan semua activities
      const allActivities = [...(data.today || []), ...(data.tomorrow || [])];
      
      // Filter untuk 3 hari ke depan dari hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      
      const highlightActivities = allActivities
        .filter((activity: Activity) => {
          // Parse tanggal activity
          const activityDateStr = formatDisplayDate(activity.tanggal);
          const [day, monthStr, year] = activityDateStr.split(' ');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const month = monthNames.indexOf(monthStr);
          const activityDate = new Date(Number(year), month, Number(day));
          activityDate.setHours(0, 0, 0, 0);
          
          // Cek apakah dalam range hari ini sampai 3 hari ke depan
          return activityDate >= today && activityDate <= threeDaysLater;
        })
        .slice(0, 6) // Ambil max 6 kegiatan untuk di-slide
        .map((activity: Activity): Berita => {
          // Extract first 6 words from deskripsi
          let shortDesc = '';
          if (activity.deskripsi) {
            // Remove HTML tags
            const plainText = activity.deskripsi.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const words = plainText.split(' ');
            shortDesc = words.slice(0, 6).join(' ');
            if (words.length > 6) {
              shortDesc += '...';
            }
          }
          
          return {
            id: activity.no,
            kategori: activity.jenis || 'Kegiatan',
            judul: activity.kegiatan,
            tanggal: formatDisplayDate(activity.tanggal) + ' • ' + activity.jam,
            deskripsi: shortDesc || activity.tempat,
            media: activity.media,
          };
        });
      
      setNews(highlightActivities);
    } catch (error) {
      console.error('Error fetching highlight activities:', error);
      setNews([]);
    }
  };

  useEffect(() => {
    const timerID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchActivities();
    fetchHighlightActivities();
    const fetchIntervalID = setInterval(() => {
      fetchActivities();
      fetchHighlightActivities();
    }, 300000); // 5 menit

    return () => {
      clearInterval(timerID);
      clearInterval(fetchIntervalID);
    };
  }, []);

  // Helper untuk mendapatkan tanggal hari ini dalam format yang sama dengan data
  const getTodayString = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    // Format: 'DD MMM YYYY' (e.g., '23 Nov 2025')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${monthNames[today.getMonth()]} ${year}`;
  };

  // Helper untuk mendapatkan tanggal besok
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const year = tomorrow.getFullYear();
    return `${day} ${monthNames[tomorrow.getMonth()]} ${year}`;
  };

  // Helper untuk mengonversi format ISO (YYYY-MM-DD) ke format display (DD MMM YYYY)
  const formatDisplayDate = (dateStr: string) => {
    if (dateStr.includes('-')) {
      // Format ISO: YYYY-MM-DD
      const [year, month, day] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return dateStr; // Sudah dalam format display
  };

  const formatDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds} WIB`;
  };

  const handleRetry = () => {
    fetchActivities();
  };

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  // ... (Akhir logika) ...

  // Helper untuk mengelompokkan activities berdasarkan tanggal (untuk tampilan kalender sederhana)
  interface ActivityGroup {
    date: string;
    items: Activity[];
  }

  const groupActivitiesByDate = (activities: Activity[]): ActivityGroup[] => {
    const map = new Map<string, Activity[]>();
    activities.forEach(a => {
      const d = a.tanggal;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(a);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  };


  return (
    <div className="info-display">
      <header className="header">
        <div className="logo-container">
          <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" />
          <h1>INFORMASI KEGIATAN<br />PEMERINTAH KOTA SEMARANG</h1>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div className="datetime">
            <div className="date">{formatDate(currentTime)}</div>
            <div className="time">{formatTime(currentTime)}</div>
          </div>
          <div
            className="login-box"
            role="button"
            tabIndex={0}
            onClick={() => (window.location.href = '/login')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { window.location.href = '/login'; } }}
            aria-label="Login"
          >
            Login
          </div>
        </div>
      </header>

      {/* View toggle (Kalender / Tabel) placed above the agenda tabs */}
      <div className="view-toggle">
        <button
          className={`view-button ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
          aria-pressed={viewMode === 'calendar'}
        >
          📅 Kalender
        </button>
        <button
          className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
          aria-pressed={viewMode === 'table'}
        >
          🗂️ Tabel
        </button>
      </div>

      {viewMode === 'table' && (
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            AGENDA HARI INI
          </button>
          <button
            className={`tab-button ${activeTab === 'tomorrow' ? 'active' : ''}`}
            onClick={() => setActiveTab('tomorrow')}
          >
            AGENDA BESOK
          </button>
        </div>
      )}

      <main className="content">
        {isLoading ? (
          <div className="loading-message">Memuat data kegiatan...</div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-button">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Agenda rendering: if viewMode==='table' show per-tab tables; if 'calendar' show one large calendar replacing tables */}
            {viewMode === 'table' ? (
              <>
                {/* Bagian Agenda Hari Ini */}
                {activeTab === 'today' && (
                  <section className="agenda-section">
                    <h2>AGENDA HARI INI</h2>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>NO</th>
                            <th>KEGIATAN</th>
                            <th>TANGGAL</th>
                            <th>JAM</th>
                            <th>TEMPAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayActivities.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                Tidak ada kegiatan hari ini
                              </td>
                            </tr>
                          ) : (
                            todayActivities
                              .map((activity: Activity) => ({
                                ...activity,
                                tanggal: formatDisplayDate(activity.tanggal)
                              }))
                              .map((activity: Activity) => (
                                <tr 
                                  key={`today-${activity.no}`} 
                                  className="activity-row" 
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                  onClick={() => {
                                    sessionStorage.setItem('fromPath', '/');
                                    navigate(`/kegiatan/${activity.no}`);
                                  }}
                                >
                                  <td>{activity.no}</td>
                                  <td><div className="activity-title">{activity.kegiatan}</div></td>
                                  <td>{activity.tanggal}</td>
                                  <td>{activity.jam}</td>
                                  <td><div className="activity-place">{activity.tempat}</div></td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Bagian Agenda Besok */}
                {activeTab === 'tomorrow' && (
                  <section className="agenda-section">
                    <h2>AGENDA BESOK</h2>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>NO</th>
                            <th>KEGIATAN</th>
                            <th>TANGGAL</th>
                            <th>JAM</th>
                            <th>TEMPAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Filter kegiatan yang tanggalnya setelah hari ini
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            const filteredActivities = tomorrowActivities.filter((activity: Activity) => {
                              // Parse tanggal dari format ISO (YYYY-MM-DD)
                              const activityDate = new Date(activity.tanggal);
                              activityDate.setHours(0, 0, 0, 0);
                              
                              // Hanya tampilkan kegiatan setelah hari ini
                              return activityDate > today;
                            });
                            
                            return filteredActivities.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                  Tidak ada kegiatan besok
                                </td>
                              </tr>
                            ) : (
                              filteredActivities
                                .map((activity: Activity) => ({
                                  ...activity,
                                  tanggal: formatDisplayDate(activity.tanggal)
                                }))
                                .map((activity: Activity) => (
                                  <tr 
                                    key={`tomorrow-${activity.no}`} 
                                    className="activity-row" 
                                    style={{ background: '#fff', cursor: 'pointer' }}
                                    onClick={() => {
                                      sessionStorage.setItem('fromPath', '/');
                                      navigate(`/kegiatan/${activity.no}`);
                                    }}
                                  >
                                    <td>{activity.no}</td>
                                    <td><div className="activity-title">{activity.kegiatan}</div></td>
                                    <td>{activity.tanggal}</td>
                                    <td>{activity.jam}</td>
                                    <td><div className="activity-place">{activity.tempat}</div></td>
                                  </tr>
                                ))
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            ) : (
              /* Large calendar view replacing tables */
              <section className="calendar-large">
                <h2>KALENDER AGENDA</h2>
                <CalendarMonth 
                  activities={[
                    ...todayActivities,
                    ...tomorrowActivities
                  ]} 
                  fromPath="/"
                />
              </section>
            )}
          </>
        )}

        <div style={{ paddingBottom: '20px' }} /> {/* Jarak antara Agenda dan Berita */}

        {/* =================================================== */}
        {/* ✅ BAGIAN BERITA TERBARU (CAROUSEL 3 CARDS) */}
        {/* =================================================== */}
        <section className="news-section">
          <h2 className="section-title">Kegiatan Mendatang</h2>
          
          {news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Belum ada kegiatan dalam 3 hari ke depan
            </div>
          ) : (
            <div className="news-carousel-wrapper">
              {/* Navigation Arrows */}
              {news.length > 3 && (
                <>
                  <button 
                    className="carousel-arrow carousel-arrow-left"
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button 
                    className="carousel-arrow carousel-arrow-right"
                    onClick={() => setCurrentSlide(Math.min(news.length - 3, currentSlide + 1))}
                    disabled={currentSlide >= news.length - 3}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
              
              {/* Cards Container */}
              <div className="news-cards-container" style={{ 
                transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                transition: 'transform 0.3s ease-in-out'
              }}>
                {news.map((berita: Berita) => {
                  // Get first media file if available
                  const mediaFile = Array.isArray(berita.media) ? berita.media[0] : berita.media;
                  const hasMedia = mediaFile && typeof mediaFile === 'string';
                  const isImage = hasMedia && mediaFile.match(/\.(jpg|jpeg|png|gif)$/i);
                  const mediaUrl = hasMedia ? `http://localhost:8000/storage/${mediaFile}` : '';
                  
                  return (
                    <div 
                      className="news-card" 
                      key={berita.id}
                      onClick={() => {
                        sessionStorage.setItem('fromPath', '/');
                        navigate(`/kegiatan/${berita.id}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div 
                        className="news-card-visual"
                        style={{
                          backgroundImage: isImage ? `linear-gradient(rgba(139, 11, 11, 0.6), rgba(166, 27, 27, 0.6)), url(${mediaUrl})` : 'linear-gradient(135deg, #8b0b0b 0%, #a61b1b 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <h3 className="news-card-title-mobile">{berita.judul}</h3> 
                      </div>
                      
                      <div className="news-card-content">
                        <span className="news-category">{berita.kategori}</span>
                        <h3 className="news-card-title">{berita.judul}</h3>
                        <p className="news-date">{berita.tanggal}</p>
                        <p className="news-description">📍 {berita.deskripsi}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Dots Navigation */}
              {news.length > 3 && (
                <div className="carousel-dots">
                  {Array.from({ length: Math.max(1, news.length - 2) }).map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>


        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-section footer-about">
              <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="footer-logo" />
              <p>Pusat Informasi Jadwal Kegiatan Resmi Pemerintah Kota Semarang. Dikelola oleh Diskominfo Kota Semarang.</p>
              <p>Jl. Pemuda No.148, Sekayu, Semarang Tengah, Kota Semarang</p>
            </div>
            <div className="footer-section footer-links">
              <h4>Tautan Terkait</h4>
              <ul>
                <li><a href="https://semarangkota.go.id/">Website Resmi Pemkot Semarang</a></li>
                <li><a href="https://diskominfo.semarangkota.go.id/">Website Diskominfo</a></li>
                <li><a href="#">Layanan Publik</a></li>
                <li><a href="#">Peta Situs</a></li>
              </ul>
            </div>
            <div className="footer-section footer-social">
              <h4>Media Sosial</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">F</a>
                <a href="#" aria-label="Instagram">I</a>
                <a href="#" aria-label="Twitter">X</a>
                <a href="#" aria-label="YouTube">Y</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Diskominfo Kota Semarang. Hak Cipta Dilindungi.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default InfoDisplay;