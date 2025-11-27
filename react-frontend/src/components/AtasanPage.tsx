import React, { useState, useEffect } from 'react';
import './InfoDisplay/InfoDisplay.css';
import CalendarMonth from './InfoDisplay/CalendarMonth';
import Sidebar from './Sidebar';
import type { Activity } from './InfoDisplay/InfoDisplayTypes';

interface PendingUser {
  id: number;
  name: string;
  username: string;
  email: string;
  created_at: string;
}

interface ApprovedBawahan {
  id: number;
  name: string;
  username: string;
}

const AtasanPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [tomorrowActivities, setTomorrowActivities] = useState<Activity[]>([]);
  const [allTodayActivities, setAllTodayActivities] = useState<Activity[]>([]); // For calendar
  const [allTomorrowActivities, setAllTomorrowActivities] = useState<Activity[]>([]); // For calendar
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [username, setUsername] = useState('Atasan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBawahan, setSelectedBawahan] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedBawahan, setApprovedBawahan] = useState<ApprovedBawahan[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Persist selected bawahan for detail views
    if (selectedBawahan) {
      sessionStorage.setItem('selectedBawahan', selectedBawahan);
    } else {
      sessionStorage.removeItem('selectedBawahan');
    }

    // Get username from localStorage or sessionStorage
    const storedUser = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (storedUser) {
      setUsername(storedUser);
    }

    const timerID = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchActivities();
    fetchPendingUsers();
    fetchApprovedBawahan();
    const fetchIntervalID = setInterval(fetchActivities, 300000);

    return () => {
      clearInterval(timerID);
      clearInterval(fetchIntervalID);
    };
  }, [selectedBawahan]);

  const fetchPendingUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchApprovedBawahan = async () => {
    try {
      const response = await fetch('/api/users/approved-bawahan');
      if (response.ok) {
        const data = await response.json();
        setApprovedBawahan(data);
      }
    } catch (error) {
      console.error('Error fetching approved bawahan:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedUser = localStorage.getItem('username') || sessionStorage.getItem('username') || 'Atasan';
      
      // Jika ada bawahan dipilih, fetch sebagai perspektif bawahan tersebut
      if (selectedBawahan) {
        const bawahanUrl = `/api/activities?username=${encodeURIComponent(selectedBawahan)}`;
        const bawahanResponse = await fetch(bawahanUrl);
        if (bawahanResponse.ok) {
          const bawahanData = await bawahanResponse.json();
          // Set semua data (kalender dan tabel) dari perspektif bawahan
          setAllTodayActivities(bawahanData.today || []);
          setAllTomorrowActivities(bawahanData.tomorrow || []);
          setTodayActivities(bawahanData.today || []);
          setTomorrowActivities(bawahanData.tomorrow || []);
        }
      } else {
        // Jika tidak ada bawahan dipilih, fetch sebagai atasan
        const atasanUrl = `/api/activities?username=${encodeURIComponent(storedUser)}`;
        const atasanResponse = await fetch(atasanUrl);
        if (atasanResponse.ok) {
          const atasanData = await atasanResponse.json();
          setAllTodayActivities(atasanData.today || []);
          setAllTomorrowActivities(atasanData.tomorrow || []);
          setTodayActivities(atasanData.today || []);
          setTomorrowActivities(atasanData.tomorrow || []);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || !navigator.onLine) {
          setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
        } else if (error.message.includes('HTTP error! status: 404')) {
          setError(null);
          setTodayActivities([]);
          setTomorrowActivities([]);
          setAllTodayActivities([]);
          setAllTomorrowActivities([]);
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

  const handleDelete = async (activityId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    try {
      const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
      const response = await fetch(`/api/activities/${activityId}?username=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 403) {
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

  const handleApproveUser = async (userId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menerima user ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menerima user');
      }

      alert('User berhasil diterima. Email notifikasi telah dikirim.');
      fetchPendingUsers(); // Refresh pending list
      fetchApprovedBawahan(); // Refresh approved list for sidebar
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Gagal menerima user. Silakan coba lagi.');
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menolak user ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menolak user');
      }

      alert('User berhasil ditolak.');
      fetchPendingUsers(); // Refresh list
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Gagal menolak user. Silakan coba lagi.');
    }
  };

  const handleEdit = (activityId: number) => {
    window.location.href = `/edit-kegiatan/${activityId}`;
  };

  const canModify = (activity: Activity) => {
    const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username');
    return activity.pembuat === currentUser;
  };

  const sampleToday: Activity[] = [];

  const sampleTomorrow: Activity[] = [
    { no: 1, kegiatan: 'Pengecekan Infrastruktur IT', tanggal: '11 Nov 2025', jam: '08:30', tempat: 'Dinas PU', jenis: 'tomorrow' },
    { no: 2, kegiatan: 'Festival Budaya Kota', tanggal: '11 Nov 2025', jam: '19:00', tempat: 'Alun-Alun', jenis: 'tomorrow' },
  ];

  const getTodayString = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${monthNames[today.getMonth()]} ${new Date().getFullYear()}`;
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${monthNames[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;
  };

  // Convert ISO date (2025-11-25) to display format (25 Nov 2025)
  const formatDisplayDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
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

  return (
    <div className="info-display">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onSelectBawahan={setSelectedBawahan}
        selectedBawahan={selectedBawahan}
        bawahanList={approvedBawahan}
      />
      
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Toggle Sidebar"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.8rem',
              cursor: 'pointer',
              color: '#333',
              padding: '5px 10px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = '#333';
            }}
          >
            ☰
          </button>
          
          <div className="logo-container">
            <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" />
            <h1>DASHBOARD ATASAN<br />PEMERINTAH KOTA SEMARANG</h1>
          </div>
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
          
          {/* Indikator perspektif bawahan */}
          {selectedBawahan && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              👁️ Melihat perspektif: <strong>{approvedBawahan.find(b => b.username === selectedBawahan)?.name || selectedBawahan}</strong> (@{selectedBawahan})
              <button
                onClick={() => setSelectedBawahan(null)}
                style={{
                  marginLeft: '15px',
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕ Kembali ke {username} View
              </button>
            </div>
          )}
          
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
                            
                            return filteredActivities.map((activity: Activity) => {
                              const displayDate = activity.tanggal.includes('-') ? formatDisplayDate(activity.tanggal) : activity.tanggal;
                              return (
                                <tr 
                                  key={`today-${activity.no}`} 
                                  className="activity-row" 
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                  onClick={() => {
                                    sessionStorage.setItem('fromPath', '/atasan');
                                    const perspective = selectedBawahan || (localStorage.getItem('username') || sessionStorage.getItem('username') || '');
                                    sessionStorage.setItem('detailUsername', perspective);
                                    window.location.href = `/kegiatan/${activity.id || activity.no}`;
                                  }}
                                >
                                  <td>{activity.no}</td>
                                  <td><div className="activity-title">{activity.kegiatan}</div></td>
                                  <td>{displayDate}</td>
                                  <td>{activity.jam}</td>
                                  <td>{activity.pembuat || '-'}</td>
                                  <td><div className="activity-place">{activity.tempat}</div></td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    {canModify(activity) && (
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleEdit(activity.id || activity.no)}
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
                                          onClick={() => handleDelete(activity.id || activity.no)}
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
                                const displayDate = activity.tanggal.includes('-') ? formatDisplayDate(activity.tanggal) : activity.tanggal;
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
                            
                            return filteredActivities.map((activity: Activity) => {
                              const displayDate = activity.tanggal.includes('-') ? formatDisplayDate(activity.tanggal) : activity.tanggal;
                              return (
                                <tr 
                                  key={`tomorrow-${activity.no}`} 
                                  className="activity-row" 
                                  style={{ background: '#fff', cursor: 'pointer' }}
                                  onClick={() => {
                                    sessionStorage.setItem('fromPath', '/atasan');
                                    const perspective = selectedBawahan || (localStorage.getItem('username') || sessionStorage.getItem('username') || '');
                                    sessionStorage.setItem('detailUsername', perspective);
                                    window.location.href = `/kegiatan/${activity.id || activity.no}`;
                                  }}
                                >
                                  <td>{activity.no}</td>
                                  <td><div className="activity-title">{activity.kegiatan}</div></td>
                                  <td>{displayDate}</td>
                                  <td>{activity.jam}</td>
                                  <td>{activity.pembuat || '-'}</td>
                                  <td><div className="activity-place">{activity.tempat}</div></td>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    {canModify(activity) && (
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleEdit(activity.id || activity.no)}
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
                                          onClick={() => handleDelete(activity.id || activity.no)}
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
                    ...(allTodayActivities.length === 0 ? sampleToday : allTodayActivities),
                    ...(allTomorrowActivities.length === 0 ? sampleTomorrow : allTomorrowActivities)
                  ]} 
                  fromPath="/atasan"
                />
              </section>
            )}
          </>
        )}

        {/* Permintaan Akses Section */}
        <section className="agenda-section" style={{ marginTop: '30px' }}>
          <h2>Permintaan Akses</h2>
          {loadingUsers ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Memuat permintaan akses...</p>
          ) : pendingUsers.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Tidak ada permintaan akses saat ini</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Tanggal Daftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#388e3c'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#4caf50'}
                          >
                            ✓ Terima
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#d32f2f'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f44336'}
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ paddingBottom: '20px' }} />

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

export default AtasanPage;
