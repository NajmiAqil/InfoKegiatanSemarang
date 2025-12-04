import React, { useState, useEffect, useCallback } from 'react';
import { OPD_LIST } from '../constants/opd';
import { formatDisplayDate, formatDateFull, formatTime } from '../utils/dateUtils';
import './InfoDisplay/InfoDisplay.css';
import CalendarMonth from './InfoDisplay/CalendarMonth';
import type { Activity } from './InfoDisplay/InfoDisplayTypes';

const BawahanPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [tomorrowActivities, setTomorrowActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [username, setUsername] = useState('Bawahan');
  const [userOpd, setUserOpd] = useState<string>('Diskominfo'); // Default OPD
  const [selectedOpd, setSelectedOpd] = useState<string>('Semua Divisi'); // Filter OPD

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedUser = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Bawahan';
      let url = `/api/activities?username=${encodeURIComponent(storedUser)}&role=bawahan`;
      if (selectedOpd !== 'Semua Divisi') {
        url += `&opd=${encodeURIComponent(selectedOpd)}`;
      }
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

  useEffect(() => {
    // Get name for display from localStorage or sessionStorage
    const storedName = localStorage.getItem('name') || sessionStorage.getItem('name') || localStorage.getItem('username') || sessionStorage.getItem('username');
    if (storedName) {
      setUsername(storedName);
    }

    // Get user's OPD from localStorage
    const storedOpd = localStorage.getItem('opd') || 'Diskominfo';
    setUserOpd(storedOpd);

    const timerID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchActivities();
    const fetchIntervalID = setInterval(fetchActivities, 300000);

    return () => {
      clearInterval(timerID);
      clearInterval(fetchIntervalID);
    };
  }, [selectedOpd, fetchActivities]);

  const handleDelete = async (activity: Activity) => {
    // Cek apakah ini occurrence dari kegiatan repeat
    if ((activity as any).is_occurrence) {
      const originalDate = (activity as any).original_date;
      alert(`Ini adalah kemunculan berulang dari kegiatan.\n\nUntuk menghapus, silakan hapus kegiatan pada tanggal asli: ${formatDisplayDate(originalDate)}\n\nMenghapus kegiatan asli akan menghapus semua kemunculan berulangnya.`);
      return;
    }

    const activityId = activity.id || activity.no;
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    try {
      const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
      console.log('Delete attempt - User:', currentUser, 'Activity ID:', activityId);
      const response = await fetch(`/api/activities/${activityId}?username=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Delete failed:', response.status, errorData);
        if (response.status === 403) {
          alert(`Tidak berhak menghapus: ${errorData.message}`);
          throw new Error('Anda tidak berhak menghapus kegiatan ini');
        }
        throw new Error('Gagal menghapus kegiatan');
      }

      alert('Kegiatan berhasil dihapus');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Gagal menghapus kegiatan. Silakan coba lagi.');
    }
  };

  const handleEdit = (activity: Activity) => {
    // Cek apakah ini occurrence dari kegiatan repeat
    if ((activity as any).is_occurrence) {
      const originalDate = (activity as any).original_date;
      alert(`Ini adalah kemunculan berulang dari kegiatan.\n\nUntuk mengedit, silakan edit kegiatan pada tanggal asli: ${formatDisplayDate(originalDate)}\n\nMengedit kegiatan asli akan mempengaruhi semua kemunculan berulangnya.`);
      return;
    }
    window.location.href = `/edit-kegiatan/${activity.id || activity.no}`;
  };

  const canModify = (activity: Activity) => {
    const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username');
    const canEdit = activity.pembuat === currentUser;
    console.log('canModify check:', { 
      activityId: activity.id || activity.no, 
      pembuat: activity.pembuat, 
      currentUser, 
      canEdit 
    });
    return canEdit;
  };

  const sampleToday: Activity[] = [];

  const sampleTomorrow: Activity[] = [
    { no: 1, kegiatan: 'Pengecekan Infrastruktur IT', tanggal: '11 Nov 2025', jam: '08:30', tempat: 'Dinas PU', jenis: 'tomorrow' },
    { no: 2, kegiatan: 'Festival Budaya Kota', tanggal: '11 Nov 2025', jam: '19:00', tempat: 'Alun-Alun', jenis: 'tomorrow' },
  ];

  const formatDateFull = (date: Date) => {
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

  return (
    <div className="info-display">
      <header className="header">
        <div className="logo-container">
            <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" loading="lazy" />
          <h1>DASHBOARD BAWAHAN<br />PEMERINTAH KOTA SEMARANG</h1>
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
            onClick={() => (window.location.href = '/')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { window.location.href = '/'; } }}
            aria-label="Logout"
          >
            Logout
          </div>
        </div>
      </header>

      <main className="content">
        <section className="agenda-section">
          <h2>Selamat Datang, {username}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              style={{
                padding: '14px 32px',
                background: '#FFB300',
                color: '#9B0000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => (window.location.href = '/add-kegiatan')}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              + Tambah Kegiatan Baru
            </button>
          </div>
        </section>

        {/* OPD Filter - Bawahan can view public from other OPDs */}
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
            <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginLeft: '10px' }}>
              (Divisi Anda: {userOpd})
            </span>
          </div>
        </div>

        {/* View toggle (Kalender / Tabel) */}
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

        {isLoading ? (
          <div className="loading-message">Memuat data kegiatan...</div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchActivities} className="retry-button">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <>
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
                            <th>PEMBUAT</th>
                            <th>TEMPAT</th>
                            <th>AKSI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredActivities = (todayActivities.length === 0 ? sampleToday : todayActivities)
                              .filter((activity: Activity) => {
                                // Compare by actual date rather than string to avoid locale mismatches
                                let activityDate: Date;
                                if (activity.tanggal.includes('-')) {
                                  activityDate = new Date(activity.tanggal);
                                } else {
                                  const [day, monthStr, year] = activity.tanggal.split(' ');
                                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                  const month = monthNames.indexOf(monthStr);
                                  activityDate = new Date(Number(year), month, Number(day));
                                }
                                activityDate.setHours(0,0,0,0);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                return activityDate.getTime() === today.getTime();
                              });
                            
                            if (filteredActivities.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '1.1rem', fontStyle: 'italic' }}>
                                    Tidak ada kegiatan
                                  </td>
                                </tr>
                              );
                            }
                            
                            return filteredActivities.map((activity: Activity, index: number) => {
                              const displayDate = activity.tanggal.includes('-') ? formatDisplayDate(activity.tanggal) : activity.tanggal;
                              return (
                                <tr 
                                  key={`today-${activity.no}`} 
                                  className="activity-row" 
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                  onClick={() => {
                                    sessionStorage.setItem('fromPath', '/bawahan');
                                    const perspective = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
                                    sessionStorage.setItem('detailUsername', perspective);
                                    window.location.href = `/kegiatan/${activity.id || activity.no}`;
                                  }}
                                >
                                  <td>{index + 1}</td>
                                  <td><div className="activity-title">{activity.kegiatan}</div></td>
                                  <td>{displayDate}</td>
                                  <td>{activity.jam}</td>
                                  <td>{activity.pembuat || '-'}</td>
                                  <td><div className="activity-place">{activity.tempat}</div></td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    {canModify(activity) && (
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleEdit(activity)}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#FFB300',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'background 0.2s'
                                          }}
                                          onMouseOver={(e) => e.currentTarget.style.background = '#FFA000'}
                                          onMouseOut={(e) => e.currentTarget.style.background = '#FFB300'}
                                          title="Edit kegiatan"
                                        >
                                          ✏️ Edit
                                        </button>
                                        <button
                                          onClick={() => handleDelete(activity)}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#d32f2f',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'background 0.2s'
                                          }}
                                          onMouseOver={(e) => e.currentTarget.style.background = '#b71c1c'}
                                          onMouseOut={(e) => e.currentTarget.style.background = '#d32f2f'}
                                          title="Hapus kegiatan"
                                        >
                                          🗑️ Hapus
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

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
                            <th>PEMBUAT</th>
                            <th>TEMPAT</th>
                            <th>AKSI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredActivities = (tomorrowActivities.length === 0 ? sampleTomorrow : tomorrowActivities)
                              .filter((activity: Activity) => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(0, 0, 0, 0);
                                
                                // Parse activity date
                                let activityDate: Date;
                                if (activity.tanggal.includes('-')) {
                                  // ISO format: 2025-11-25
                                  activityDate = new Date(activity.tanggal);
                                } else {
                                  // Display format: 25 Nov 2025
                                  const [day, monthStr, year] = activity.tanggal.split(' ');
                                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                  const month = monthNames.indexOf(monthStr);
                                  activityDate = new Date(Number(year), month, Number(day));
                                }
                                activityDate.setHours(0, 0, 0, 0);
                                
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                // Show activities from tomorrow onwards (including tomorrow)
                                return activityDate > today;
                              });
                            
                            if (filteredActivities.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '1.1rem', fontStyle: 'italic' }}>
                                    Tidak ada kegiatan
                                  </td>
                                </tr>
                              );
                            }
                            
                            return filteredActivities.map((activity: Activity, index: number) => {
                              const displayDate = activity.tanggal.includes('-') ? formatDisplayDate(activity.tanggal) : activity.tanggal;
                              return (
                                <tr 
                                  key={`tomorrow-${activity.no}`} 
                                  className="activity-row" 
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                  onClick={() => {
                                    sessionStorage.setItem('fromPath', '/bawahan');
                                    const perspective = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
                                    sessionStorage.setItem('detailUsername', perspective);
                                    window.location.href = `/kegiatan/${activity.id || activity.no}`;
                                  }}
                                >
                                  <td>{index + 1}</td>
                                  <td><div className="activity-title">{activity.kegiatan}</div></td>
                                  <td>{displayDate}</td>
                                  <td>{activity.jam}</td>
                                  <td>{activity.pembuat || '-'}</td>
                                  <td><div className="activity-place">{activity.tempat}</div></td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    {canModify(activity) && (
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleEdit(activity)}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#FFB300',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'background 0.2s'
                                          }}
                                          onMouseOver={(e) => e.currentTarget.style.background = '#FFA000'}
                                          onMouseOut={(e) => e.currentTarget.style.background = '#FFB300'}
                                          title="Edit kegiatan"
                                        >
                                          ✏️ Edit
                                        </button>
                                        <button
                                          onClick={() => handleDelete(activity)}
                                          style={{
                                            padding: '6px 12px',
                                            background: '#d32f2f',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'background 0.2s'
                                          }}
                                          onMouseOver={(e) => e.currentTarget.style.background = '#b71c1c'}
                                          onMouseOut={(e) => e.currentTarget.style.background = '#d32f2f'}
                                          title="Hapus kegiatan"
                                        >
                                          🗑️ Hapus
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <section className="calendar-large">
                <h2>KALENDER AGENDA</h2>
                <CalendarMonth 
                  activities={[
                    ...(todayActivities.length === 0 ? sampleToday : todayActivities),
                    ...(tomorrowActivities.length === 0 ? sampleTomorrow : tomorrowActivities)
                  ]} 
                  fromPath="/bawahan"
                />
              </section>
            )}
          </>
        )}

        <div style={{ paddingBottom: '20px' }} />

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

export default BawahanPage;
