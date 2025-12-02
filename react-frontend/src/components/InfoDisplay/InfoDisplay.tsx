import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPD_LIST } from '../../constants/opd';
import { formatDisplayDate, formatDateFull, formatTime, monthNames } from '../../utils/dateUtils';
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
  const [selectedOpd, setSelectedOpd] = useState<string>('Semua Divisi');

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Panggil API dengan filter OPD jika bukan "Semua Divisi"
      const url = selectedOpd === 'Semua Divisi' 
        ? '/api/activities' 
        : `/api/activities?opd=${encodeURIComponent(selectedOpd)}`;
      const response = await fetch(url); 
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
  }, [selectedOpd]);

  const fetchHighlightActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Gabungkan semua activities (backend already filters public for homepage)
      const allActivities = [...(data.today || []), ...(data.tomorrow || [])];
      
      // Filter untuk: kegiatan baru dibuat hari ini ATAU kegiatan dalam 3 hari ke depan
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      
      const highlightActivities = allActivities
        .filter((activity: Activity) => {
          // Parse tanggal activity
          const activityDateStr = formatDisplayDate(activity.tanggal);
          const [day, monthStr, year] = activityDateStr.split(' ');
          const month = monthNames.indexOf(monthStr);
          const activityDate = new Date(Number(year), month, Number(day));
          activityDate.setHours(0, 0, 0, 0);
          
          // Cek created_at untuk kegiatan baru dibuat hari ini
          let isNewToday = false;
          if (activity.created_at) {
            const createdDate = new Date(activity.created_at);
            createdDate.setHours(0, 0, 0, 0);
            isNewToday = createdDate.getTime() === today.getTime();
          }
          
          // Cek apakah dalam range hari ini sampai 3 hari ke depan
          const isUpcoming = activityDate >= today && activityDate <= threeDaysLater;
          
          // Tampilkan jika baru dibuat hari ini ATAU akan datang dalam 3 hari
          return isNewToday || isUpcoming;
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
            // Pakai primary key id untuk navigasi detail agar tidak salah record
            id: activity.id ?? activity.no,
            kategori: activity.jenis || 'Kegiatan',
            judul: activity.kegiatan,
            tanggal: formatDisplayDate(activity.tanggal) + ' • ' + (activity.jam_mulai || activity.jam),
            deskripsi: shortDesc || activity.tempat,
            media: activity.media,
          };
        });
      
      setNews(highlightActivities);
    } catch (error) {
      console.error('Error fetching highlight activities:', error);
      setNews([]);
    }
  }, []); // formatDisplayDate is imported, not a dependency

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
  }, [selectedOpd, fetchActivities, fetchHighlightActivities]); // Re-fetch when OPD selection changes

  // (dipindahkan ke atas untuk dipakai useCallback)

  const handleRetry = () => {
    fetchActivities();
  };

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');


  return (
    <div className="info-display">
      <header className="header">
        <div className="logo-container">
          <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" loading="lazy" />
          <h1>INFORMASI KEGIATAN<br />PEMERINTAH KOTA SEMARANG</h1>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div className="datetime">
            <div className="date">{formatDateFull(currentTime)}</div>
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

      {/* OPD Filter Dropdown */}
      <div className="opd-filter-container">
        <div className="opd-filter-wrapper">
          <label htmlFor="opd-select">
            Filter Divisi:
          </label>
          <select
            id="opd-select"
            value={selectedOpd}
            onChange={(e) => setSelectedOpd(e.target.value)}
          >
            {OPD_LIST.map((opd) => (
              <option key={opd} value={opd}>
                {opd}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                          {(() => {
                            // Gunakan tanggal lokal (sesuai header datetime) untuk menentukan kegiatan hari ini
                            const clientToday = new Date();
                            clientToday.setHours(0,0,0,0);

                            // Gabungkan semua activities dari response agar tidak terpengaruh timezone backend
                            const combined = [...todayActivities, ...tomorrowActivities];

                            // Hilangkan duplikat berdasarkan id/no
                            const uniqueMap = new Map<string|number, Activity>();
                            combined.forEach(a => uniqueMap.set(a.id ?? a.no, a));
                            const unique = Array.from(uniqueMap.values());

                            const inToday = unique.filter(a => {
                              if (!a.tanggal) return false;
                              const start = new Date(a.tanggal);
                              const end = new Date(a.tanggal_berakhir || a.tanggal);
                              start.setHours(0,0,0,0); end.setHours(0,0,0,0);
                              return start <= clientToday && clientToday <= end; // berada dalam rentang multi-day
                            });

                            if (inToday.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Tidak ada kegiatan hari ini
                                  </td>
                                </tr>
                              );
                            }

                            return inToday
                              .sort((a,b) => {
                                const jamA = (a.jam_mulai || a.jam || '00:00');
                                const jamB = (b.jam_mulai || b.jam || '00:00');
                                return jamA.localeCompare(jamB);
                              })
                              .map((activity: Activity, index: number) => {
                                const startDisplay = formatDisplayDate(activity.tanggal);
                                const endDisplay = activity.tanggal_berakhir ? formatDisplayDate(activity.tanggal_berakhir) : startDisplay;
                                const jamTampil = activity.jam_mulai && activity.jam_berakhir
                                  ? `${activity.jam_mulai} - ${activity.jam_berakhir}`
                                  : (activity.jam_mulai || activity.jam);
                                return (
                                  <tr
                                    key={`today-${activity.id ?? activity.no}`}
                                    className="activity-row"
                                    style={{ background: '#fff', cursor: 'pointer' }}
                                    onClick={() => {
                                      sessionStorage.setItem('fromPath', '/');
                                      navigate(`/kegiatan/${activity.id}`);
                                    }}
                                  >
                                    <td>{index + 1}</td>
                                    <td><div className="activity-title">{activity.kegiatan}</div></td>
                                    <td>{startDisplay === endDisplay ? startDisplay : `${startDisplay} - ${endDisplay}`}</td>
                                    <td>{jamTampil}</td>
                                    <td><div className="activity-place">{activity.tempat}</div></td>
                                  </tr>
                                );
                              });
                          })()}
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
                                .map((activity: Activity, index: number) => (
                                  <tr 
                                    key={`tomorrow-${activity.no}`} 
                                    className="activity-row" 
                                    style={{ background: '#fff', cursor: 'pointer' }}
                                    onClick={() => {
                                      sessionStorage.setItem('fromPath', '/');
                                      navigate(`/kegiatan/${activity.id}`);
                                    }}
                                  >
                                    <td>{index + 1}</td>
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
              <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="footer-logo" loading="lazy" />
              <p>Pusat Informasi Jadwal Kegiatan Resmi Pemerintah Kota Semarang. Dikelola oleh Diskominfo Kota Semarang.</p>
              <p>Jl. Pemuda No.148, Sekayu, Semarang Tengah, Kota Semarang</p>
            </div>
            <div className="footer-section footer-links">
              <h4>Tautan Terkait</h4>
              <ul>
                <li><a href="https://semarangkota.go.id/" target="_blank" rel="noopener noreferrer">Website Resmi Pemkot Semarang</a></li>
                <li><a href="https://diskominfo.semarangkota.go.id/" target="_blank" rel="noopener noreferrer">Website Diskominfo</a></li>
                <li><a href="https://semarangkota.go.id/layanan" target="_blank" rel="noopener noreferrer">Layanan Publik</a></li>
                <li><a href="https://semarangkota.go.id/peta-situs" target="_blank" rel="noopener noreferrer">Peta Situs</a></li>
              </ul>
            </div>
            <div className="footer-section footer-social">
              <h4>Media Sosial</h4>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">F</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">I</a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">X</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">Y</a>
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