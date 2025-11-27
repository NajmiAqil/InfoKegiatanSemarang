import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  no: number | string;
  id?: number;
  tanggal: string; // ISO date string (e.g. "2025-11-22") accepted by new Date()
  jam?: string;
  kegiatan?: string;
  tempat?: string;
  pembuat?: string;
}

interface Props {
  activities: Activity[];
  fromPath?: string; // Path to return to when clicking activity
}

const weekdayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }

const CalendarMonth: React.FC<Props> = ({ activities, fromPath = '/' }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<Date>(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(new Date());

  const monthMatrix = useMemo(() => {
    const first = startOfMonth(current);
    const startWeekday = first.getDay();
    const total = daysInMonth(current);

    const cells: Date[] = [];

    // previous month's tail
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(current.getFullYear(), current.getMonth(), -i);
      cells.push(d);
    }

    // this month
    for (let i = 1; i <= total; i++) cells.push(new Date(current.getFullYear(), current.getMonth(), i));

    // next month's head to fill 6 rows (6*7=42)
    let nextDay = 1;
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const d = new Date(current.getFullYear(), current.getMonth()+1, nextDay++);
      cells.push(d);
    }

    // chunk into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7));
    return weeks;
  }, [current]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    console.log('CalendarMonth - Processing activities:', activities.length);
    activities.forEach(a => {
      const parsed = new Date(a.tanggal);
      const key = parsed.toDateString();
      console.log('CalendarMonth - Activity:', a.id, a.tanggal, '→', key);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    console.log('CalendarMonth - Events by date:', map);
    return map;
  }, [activities]);

  const goPrev = () => setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1));
  const goNext = () => setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1));

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  const selectedEvents = selected ? (eventsByDate.get(selected.toDateString()) || []) : [];

  const handleDelete = async (activityId: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus kegiatan');
      }

      alert('Kegiatan berhasil dihapus');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Gagal menghapus kegiatan. Silakan coba lagi.');
    }
  };

  const handleEdit = (activityId: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/edit-kegiatan/${activityId}`;
  };

  const canModify = (activity: Activity) => {
    const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username');
    // Don't show edit/delete buttons if not logged in or not on dashboard
    if (!currentUser || fromPath === '/') {
      return false;
    }
    return activity.pembuat === currentUser;
  };

  // Bahasa Indonesia hari dan bulan
  const hariIndo = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulanIndo = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function formatTanggalIndo(date: Date) {
    return `${hariIndo[date.getDay()]}, ${date.getDate()} ${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;
  }

  // Toggle panel: klik hari yang sama akan sembunyikan panel
  function handleSelectDay(day: Date) {
    if (selected && isSameDay(selected, day)) {
      setSelected(null);
    } else {
      setSelected(day);
    }
  }

  return (
    <div className="calendar-month">
      <div className="calendar-header">
        <button className="cal-nav" onClick={goPrev} aria-label="Bulan sebelumnya">‹</button>
        <div className="cal-title">{bulanIndo[current.getMonth()]} {current.getFullYear()}</div>
        <button className="cal-nav" onClick={goNext} aria-label="Bulan berikutnya">›</button>
      </div>

      <div className="calendar-body">
        <div className="calendar-grid-wrapper">
          <div className="calendar-grid">
            {weekdayNames.map(w => (
              <div key={w} className="calendar-weekday">{w}</div>
            ))}

            {monthMatrix.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map(day => {
                  const isCurrentMonth = day.getMonth() === current.getMonth();
                  const key = day.toDateString();
                  const ev = eventsByDate.get(key) || [];
                  const today = new Date();
                  return (
                    <button
                      key={key}
                      className={`calendar-cell ${isCurrentMonth ? '' : 'muted'} ${selected && isSameDay(selected, day) ? 'selected' : ''} ${isSameDay(day, today) ? 'today' : ''}`}
                      onClick={() => handleSelectDay(day)}
                      aria-pressed={selected ? isSameDay(selected, day) : false}
                    >
                      <div className="cell-number">{day.getDate()}</div>
                      <div className="cell-events">
                        {ev.slice(0,3).map((e, idx) => (
                          <span key={idx} className="cell-dot" title={`${e.jam} - ${e.kegiatan}`}></span>
                        ))}
                        {ev.length > 3 && <span className="cell-more">+{ev.length - 3}</span>}
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {selected && (
          <aside className="events-panel">
            <div className="events-panel-header">
              <div className="events-panel-title">Kegiatan {formatTanggalIndo(selected)}</div>
            </div>

            <div className="events-list">
              {selectedEvents.length === 0 ? (
                <div className="no-events">Tidak ada kegiatan.</div>
              ) : (
                selectedEvents.map(ev => (
                  <div 
                    key={`evt-${ev.no}-${ev.jam}`} 
                    className="event-card"
                    onClick={() => {
                      sessionStorage.setItem('fromPath', fromPath);
                      // Use selected bawahan when atasan perspective, else current user
                      const perspective = (fromPath === '/atasan')
                        ? (sessionStorage.getItem('selectedBawahan') || localStorage.getItem('username') || sessionStorage.getItem('username') || '')
                        : (localStorage.getItem('username') || sessionStorage.getItem('username') || '');
                      sessionStorage.setItem('detailUsername', perspective);
                      navigate(`/kegiatan/${ev.id || ev.no}`);
                    }}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div className="event-card-body">
                      <div className="event-card-title">{ev.kegiatan}</div>
                      <div className="event-card-time">{ev.jam}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="event-card-badge">Jadwal</div>
                      {canModify(ev) && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => handleEdit(ev.no, e)}
                            style={{
                              padding: '4px 8px',
                              background: '#FFB300',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            title="Edit kegiatan"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => handleDelete(ev.no, e)}
                            style={{
                              padding: '4px 8px',
                              background: '#d32f2f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                            title="Hapus kegiatan"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CalendarMonth;
