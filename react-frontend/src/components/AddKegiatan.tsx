import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { OPD_OPTIONS } from '../constants/opd';
import { calculateEndDate, formatDateFull, formatTime } from '../utils/dateUtils';
import './InfoDisplay/InfoDisplay.css';
import './AddKegiatanDesign.css';

interface User {
  id: number;
  username: string;
  name: string;
}

interface ExternalContact {
  name: string;
  phone: string;
  email: string;
}

const AddKegiatan: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [username, setUsername] = useState<string>('');
  const [hasExternalContacts, setHasExternalContacts] = useState<boolean>(false);
  const [externalContacts, setExternalContacts] = useState<ExternalContact[]>([]);
  const [formData, setFormData] = useState({
    judul: '',
    tanggal: '',
    tanggal_berakhir: '',
    jenis_kegiatan: '',
    jam_mulai: '00:00',
    jam_berakhir: '00:00',
    lokasi: '',
    visibility: 'public',
    deskripsi: '',
    orang_terkait: '',
    pembuat: localStorage.getItem('username') || sessionStorage.getItem('username') || '',
    opd: localStorage.getItem('opd') || 'Diskominfo',
    repeat: 'no',
    repeat_frequency: 'daily',
    repeat_limit: 'no', // yes or no
    repeat_end_date: '',
  });
  const [showTimePicker, setShowTimePicker] = useState({ mulai: false, berakhir: false });
  const [timePickerMode, setTimePickerMode] = useState<{ mulai: 'hour' | 'minute', berakhir: 'hour' | 'minute' }>({ mulai: 'hour', berakhir: 'hour' });
  const [media, setMedia] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    const creator = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
    return creator ? [creator] : [];
  });

  // Header clock + username
  useEffect(() => {
    const storedName = localStorage.getItem('name') || sessionStorage.getItem('name') || localStorage.getItem('username') || sessionStorage.getItem('username') || '';
    if (storedName) setUsername(storedName);
    const timerID = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerID);
  }, []);

  // Fetch users for orang_terkait and ensure creator auto-included
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/approved');
        if (response.ok && isMounted) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching users:', error);
        }
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, []);

  // Ensure pembuat always exists in selectedUsers (avoid accidental removal)
  useEffect(() => {
    const pembuat = formData.pembuat || localStorage.getItem('username') || sessionStorage.getItem('username') || '';
    if (pembuat && !selectedUsers.includes(pembuat)) {
      setSelectedUsers(prev => [pembuat, ...prev]);
    }
  }, [formData.pembuat, selectedUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    // Recalculate tanggal_berakhir if tanggal changes
    if (e.target.name === 'tanggal') {
      newFormData.tanggal_berakhir = calculateEndDate(e.target.value, formData.jam_mulai, formData.jam_berakhir);
    }
    
    setFormData(newFormData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/quicktime', // .mov
    ];
    const maxBytes = 20 * 1024 * 1024; // 20MB (match backend)

    const rejected: string[] = [];
    const accepted: File[] = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        rejected.push(`${file.name} (tipe tidak didukung)`);
        return;
      }
      if (file.size > maxBytes) {
        rejected.push(`${file.name} (lebih dari 20MB)`);
        return;
      }
      accepted.push(file);
    });

    if (rejected.length > 0) {
      setError(`Beberapa file ditolak:\n- ${rejected.join('\n- ')}\nTipe yang diizinkan: JPG, PNG, GIF, MP4, AVI, MOV. Maks 20MB per file.`);
    } else {
      setError('');
    }

    setMedia(accepted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submit
    if (isSubmitting) return;
    
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    
    // Ensure pembuat is always sent
    const pembuatValue = formData.pembuat || localStorage.getItem('username') || sessionStorage.getItem('username') || 'Unknown';
    
    Object.entries(formData).forEach(([key, value]) => {
      // Skip repeat_limit and orang_terkait - handled separately
      if (key === 'repeat_limit' || key === 'orang_terkait') {
        return;
      }
      
      if (key === 'pembuat') {
        formDataToSend.append(key, pembuatValue);
      } else {
        formDataToSend.append(key, value);
      }
    });
    
    // Add selected users as orang_terkait (as JSON array)
    if (selectedUsers.length > 0) {
      formDataToSend.append('orang_terkait', JSON.stringify(selectedUsers));
    } else {
      formDataToSend.append('orang_terkait', '');
    }

    // Add external contacts if any
    if (hasExternalContacts && externalContacts.length > 0) {
      formDataToSend.append('external_contacts', JSON.stringify(externalContacts));
    }
    
    // If repeat is 'no', don't send repeat_frequency and repeat_end_date
    if (formData.repeat === 'no') {
      formDataToSend.delete('repeat_frequency');
      formDataToSend.delete('repeat_limit');
      formDataToSend.delete('repeat_end_date');
    }
    
    // If repeat_limit is 'no', don't send repeat_end_date
    if (formData.repeat_limit === 'no') {
      formDataToSend.delete('repeat_end_date');
    }

    // Append files using array syntax so Laravel recognizes them as media[]
    media.forEach((file) => {
      formDataToSend.append('media[]', file);
    });

    try {
      const currentUser = localStorage.getItem('username') || sessionStorage.getItem('username') || '';
      const currentRole = localStorage.getItem('role') || 'bawahan';
      const response = await fetch(`/api/activities?username=${encodeURIComponent(currentUser)}&role=${currentRole}`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error('Server response:', response.status, data);
        
        // Handle validation errors
        if (data?.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validasi gagal:\n${errorMessages}`);
        }
        
        throw new Error(data?.message || 'Gagal menyimpan kegiatan');
      }

      await response.json();
      
      setSuccess('Kegiatan berhasil disimpan!');
      // Reset form
      setFormData({
        judul: '',
        tanggal: '',
        tanggal_berakhir: '',
        jenis_kegiatan: '',
        jam_mulai: '00:00',
        jam_berakhir: '00:00',
        lokasi: '',
        visibility: 'public',
        deskripsi: '',
        orang_terkait: '',
        pembuat: localStorage.getItem('username') || sessionStorage.getItem('username') || '',
        opd: localStorage.getItem('opd') || 'Diskominfo',
        repeat: 'no',
        repeat_frequency: 'daily',
        repeat_limit: 'no',
        repeat_end_date: '',
      });
      setMedia([]);
      setSelectedUsers([]);
      setHasExternalContacts(false);
      setExternalContacts([]);
      
      // Redirect after 2 seconds based on user role
      setTimeout(() => {
        const userRole = localStorage.getItem('role') || 'bawahan';
        window.location.href = userRole === 'atasan' ? '/atasan' : '/bawahan';
      }, 2000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan kegiatan');
      setIsSubmitting(false);
    }
  };
  // Date helpers to align with other pages


  return (
    <div className="info-display">
      <header className="header">
        <div className="logo-container">
          <img src="/Diskominfo.jpg" alt="Logo Diskominfo" className="logo-semarang" loading="lazy" />
          <h1>DASHBOARD KEGIATAN<br />PEMERINTAH KOTA SEMARANG</h1>
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
          <h2>Selamat Datang{username ? `, ${username}` : ''}</h2>
        </section>

        <div className="add-kegiatan-page">
          <div className="add-kegiatan-container">
            <div className="add-kegiatan-header">
              <button
                type="button"
                className="back-btn"
                onClick={() => window.history.back()}
              >
                ← Kembali
              </button>
              <h1>Tambah Kegiatan Baru</h1>
            </div>

            <form onSubmit={handleSubmit} className="add-kegiatan-form">
          <div className="form-row">
            <div className="form-group">
              <label>Judul Kegiatan *</label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                required
                placeholder="Masukkan judul kegiatan"
              />
            </div>

            <div className="form-group">
              <label>Tanggal Kegiatan *</label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tanggal Berakhir</label>
              <input
                type="date"
                name="tanggal_berakhir"
                value={formData.tanggal_berakhir}
                readOnly
                className="readonly-input"
                title="Otomatis terisi jika jam berakhir melewati tengah malam"
              />
              {formData.tanggal && formData.tanggal_berakhir && formData.tanggal_berakhir !== formData.tanggal && (
                <small className="hint-warning">
                  ⚠️ Kegiatan berlanjut hingga hari berikutnya
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Jenis Kegiatan *</label>
              <select
                name="jenis_kegiatan"
                value={formData.jenis_kegiatan}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Jenis</option>
                <option value="rapat">Rapat</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="sosialisasi">Sosialisasi</option>
                <option value="pelatihan">Pelatihan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="form-group">
              <label>Jam Mulai *</label>
              <div className="time-picker-wrapper">
                <input
                  type="text"
                  value={formData.jam_mulai || 'Pilih Jam'}
                  readOnly
                  onClick={() => {
                    setShowTimePicker({ ...showTimePicker, mulai: !showTimePicker.mulai });
                    setTimePickerMode({ ...timePickerMode, mulai: 'hour' });
                  }}
                  style={{ cursor: 'pointer' }}
                  required
                />
                {showTimePicker.mulai && (
                  <div className="analog-clock-picker">
                    <div className="clock-display">
                      <span className="hour-display">{formData.jam_mulai?.split(':')[0] || '00'}</span>
                      <span className="separator">:</span>
                      <span className="minute-display">{formData.jam_mulai?.split(':')[1] || '00'}</span>
                    </div>
                    <div className="mode-toggle">
                      <button
                        type="button"
                        className={timePickerMode.mulai === 'hour' ? 'active' : ''}
                        onClick={() => setTimePickerMode({ ...timePickerMode, mulai: 'hour' })}
                      >
                        Jam
                      </button>
                      <button
                        type="button"
                        className={timePickerMode.mulai === 'minute' ? 'active' : ''}
                        onClick={() => setTimePickerMode({ ...timePickerMode, mulai: 'minute' })}
                      >
                        Menit
                      </button>
                    </div>
                    <div className="clock-face">
                      <svg className="clock-svg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                        {timePickerMode.mulai === 'hour' ? (
                          <>
                            {/* Outer circle: 1-12 */}
                            {[...Array(12)].map((_, i) => {
                              const hour = i === 0 ? 12 : i;
                              const angle = (hour * 30 - 90) * (Math.PI / 180);
                              const x = 100 + 65 * Math.cos(angle);
                              const y = 100 + 65 * Math.sin(angle);
                              const currentHour = parseInt(formData.jam_mulai?.split(':')[0] || '0');
                              const isSelected = currentHour === hour || (currentHour === 0 && hour === 12);
                              return (
                                <g key={`outer-${i}`}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="16"
                                    fill={isSelected ? '#4285f4' : 'transparent'}
                                    stroke="none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const min = formData.jam_mulai?.split(':')[1] || '00';
                                      const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
                                      const newEndDate = calculateEndDate(formData.tanggal, newTime, formData.jam_berakhir);
                                      setFormData({ ...formData, jam_mulai: newTime, tanggal_berakhir: newEndDate });
                                      setTimePickerMode({ ...timePickerMode, mulai: 'minute' });
                                    }}
                                  />
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={isSelected ? '#fff' : '#333'}
                                    fontSize="14"
                                    fontWeight="600"
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                  >
                                    {hour}
                                  </text>
                                </g>
                              );
                            })}
                            {/* Inner circle: 13-24 (00) */}
                            {[...Array(12)].map((_, i) => {
                              const hour = i + 12;
                              const displayHour = i === 0 ? '00' : hour;
                              const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
                              const x = 100 + 35 * Math.cos(angle);
                              const y = 100 + 35 * Math.sin(angle);
                              const currentHour = parseInt(formData.jam_mulai?.split(':')[0] || '0');
                              const isSelected = currentHour === hour || (currentHour === 0 && i === 0);
                              return (
                                <g key={`inner-${i}`}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="14"
                                    fill={isSelected ? '#4285f4' : 'transparent'}
                                    stroke="none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const min = formData.jam_mulai?.split(':')[1] || '00';
                                      const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
                                      const newEndDate = calculateEndDate(formData.tanggal, newTime, formData.jam_berakhir);
                                      setFormData({ ...formData, jam_mulai: newTime, tanggal_berakhir: newEndDate });
                                      setTimePickerMode({ ...timePickerMode, mulai: 'minute' });
                                    }}
                                  />
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={isSelected ? '#fff' : '#666'}
                                    fontSize="11"
                                    fontWeight="500"
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                  >
                                    {displayHour}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        ) : (
                          /* Minute selection */
                          [...Array(12)].map((_, i) => {
                            const minute = i * 5;
                            const angle = (minute * 6 - 90) * (Math.PI / 180);
                            const x = 100 + 65 * Math.cos(angle);
                            const y = 100 + 65 * Math.sin(angle);
                            const currentMinute = parseInt(formData.jam_mulai?.split(':')[1] || '0');
                            const isSelected = currentMinute === minute;
                            return (
                              <g key={`min-${i}`}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="16"
                                  fill={isSelected ? '#4285f4' : 'transparent'}
                                  stroke="none"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    const hour = formData.jam_mulai?.split(':')[0] || '00';
                                    const newTime = `${hour}:${minute.toString().padStart(2, '0')}`;
                                    const newEndDate = calculateEndDate(formData.tanggal, newTime, formData.jam_berakhir);
                                    setFormData({ ...formData, jam_mulai: newTime, tanggal_berakhir: newEndDate });
                                    setShowTimePicker({ ...showTimePicker, mulai: false });
                                  }}
                                />
                                <text
                                  x={x}
                                  y={y}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill={isSelected ? '#fff' : '#333'}
                                  fontSize="14"
                                  fontWeight="600"
                                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                >
                                  {minute.toString().padStart(2, '0')}
                                </text>
                              </g>
                            );
                          })
                        )}
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Jam Berakhir *</label>
              <div className="time-picker-wrapper">
                <input
                  type="text"
                  value={formData.jam_berakhir || 'Pilih Jam'}
                  readOnly
                  onClick={() => {
                    setShowTimePicker({ ...showTimePicker, berakhir: !showTimePicker.berakhir });
                    setTimePickerMode({ ...timePickerMode, berakhir: 'hour' });
                  }}
                  style={{ cursor: 'pointer' }}
                  required
                />
                {showTimePicker.berakhir && (
                  <div className="analog-clock-picker">
                    <div className="clock-display">
                      <span className="hour-display">{formData.jam_berakhir?.split(':')[0] || '00'}</span>
                      <span className="separator">:</span>
                      <span className="minute-display">{formData.jam_berakhir?.split(':')[1] || '00'}</span>
                    </div>
                    <div className="mode-toggle">
                      <button
                        type="button"
                        className={timePickerMode.berakhir === 'hour' ? 'active' : ''}
                        onClick={() => setTimePickerMode({ ...timePickerMode, berakhir: 'hour' })}
                      >
                        Jam
                      </button>
                      <button
                        type="button"
                        className={timePickerMode.berakhir === 'minute' ? 'active' : ''}
                        onClick={() => setTimePickerMode({ ...timePickerMode, berakhir: 'minute' })}
                      >
                        Menit
                      </button>
                    </div>
                    <div className="clock-face">
                      <svg className="clock-svg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                        {timePickerMode.berakhir === 'hour' ? (
                          <>
                            {/* Outer circle: 1-12 */}
                            {[...Array(12)].map((_, i) => {
                              const hour = i === 0 ? 12 : i;
                              const angle = (hour * 30 - 90) * (Math.PI / 180);
                              const x = 100 + 65 * Math.cos(angle);
                              const y = 100 + 65 * Math.sin(angle);
                              const currentHour = parseInt(formData.jam_berakhir?.split(':')[0] || '0');
                              const isSelected = currentHour === hour || (currentHour === 0 && hour === 12);
                              return (
                                <g key={`outer-${i}`}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="16"
                                    fill={isSelected ? '#4285f4' : 'transparent'}
                                    stroke="none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const min = formData.jam_berakhir?.split(':')[1] || '00';
                                      const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
                                      const newEndDate = calculateEndDate(formData.tanggal, formData.jam_mulai, newTime);
                                      setFormData({ ...formData, jam_berakhir: newTime, tanggal_berakhir: newEndDate });
                                      setTimePickerMode({ ...timePickerMode, berakhir: 'minute' });
                                    }}
                                  />
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={isSelected ? '#fff' : '#333'}
                                    fontSize="14"
                                    fontWeight="600"
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                  >
                                    {hour}
                                  </text>
                                </g>
                              );
                            })}
                            {/* Inner circle: 13-24 (00) */}
                            {[...Array(12)].map((_, i) => {
                              const hour = i + 12;
                              const displayHour = i === 0 ? '00' : hour;
                              const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
                              const x = 100 + 35 * Math.cos(angle);
                              const y = 100 + 35 * Math.sin(angle);
                              const currentHour = parseInt(formData.jam_berakhir?.split(':')[0] || '0');
                              const isSelected = currentHour === hour || (currentHour === 0 && i === 0);
                              return (
                                <g key={`inner-${i}`}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="14"
                                    fill={isSelected ? '#4285f4' : 'transparent'}
                                    stroke="none"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const min = formData.jam_berakhir?.split(':')[1] || '00';
                                      const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
                                      const newEndDate = calculateEndDate(formData.tanggal, formData.jam_mulai, newTime);
                                      setFormData({ ...formData, jam_berakhir: newTime, tanggal_berakhir: newEndDate });
                                      setTimePickerMode({ ...timePickerMode, berakhir: 'minute' });
                                    }}
                                  />
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={isSelected ? '#fff' : '#666'}
                                    fontSize="11"
                                    fontWeight="500"
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                  >
                                    {displayHour}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        ) : (
                          /* Minute selection */
                          [...Array(12)].map((_, i) => {
                            const minute = i * 5;
                            const angle = (minute * 6 - 90) * (Math.PI / 180);
                            const x = 100 + 65 * Math.cos(angle);
                            const y = 100 + 65 * Math.sin(angle);
                            const currentMinute = parseInt(formData.jam_berakhir?.split(':')[1] || '0');
                            const isSelected = currentMinute === minute;
                            return (
                              <g key={`min-${i}`}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="16"
                                  fill={isSelected ? '#4285f4' : 'transparent'}
                                  stroke="none"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    const hour = formData.jam_berakhir?.split(':')[0] || '00';
                                    const newTime = `${hour}:${minute.toString().padStart(2, '0')}`;
                                    const newEndDate = calculateEndDate(formData.tanggal, formData.jam_mulai, newTime);
                                    setFormData({ ...formData, jam_berakhir: newTime, tanggal_berakhir: newEndDate });
                                    setShowTimePicker({ ...showTimePicker, berakhir: false });
                                  }}
                                />
                                <text
                                  x={x}
                                  y={y}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill={isSelected ? '#fff' : '#333'}
                                  fontSize="14"
                                  fontWeight="600"
                                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                                >
                                  {minute.toString().padStart(2, '0')}
                                </text>
                              </g>
                            );
                          })
                        )}
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Lokasi Kegiatan *</label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              required
              placeholder="Masukkan lokasi kegiatan"
            />
          </div>

          <div className="form-group">
            <label>Visibilitas *</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              required
            >
              <option value="public">Public (Bisa dilihat semua orang)</option>
              <option value="kantor">Kantor (Bisa dilihat oleh pekerja lain)</option>
              <option value="private">Private (Hanya pembuat)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Divisi/OPD *</label>
            {(() => {
              const userRole = localStorage.getItem('role') || 'bawahan';
              const userOpd = localStorage.getItem('opd') || 'Diskominfo';
              
              if (userRole === 'bawahan') {
                // Bawahan: read-only field
                return (
                  <input
                    type="text"
                    value={userOpd}
                    disabled
                    className="input-disabled"
                  />
                );
              } else {
                // Atasan: dropdown
                return (
                  <select
                    name="opd"
                    value={formData.opd}
                    onChange={handleChange}
                    required
                  >
                    {OPD_OPTIONS.map((opd) => (
                      <option key={opd} value={opd}>
                        {opd}
                      </option>
                    ))}
                  </select>
                );
              }
            })()}
            <small className="muted-hint">
              {localStorage.getItem('role') === 'bawahan' 
                ? 'Anda hanya bisa membuat kegiatan untuk divisi sendiri'
                : 'Pilih divisi untuk kegiatan ini'}
            </small>
          </div>

          <div className="form-group">
            <label>Repeat *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="repeat"
                  value="no"
                  checked={formData.repeat === 'no'}
                  onChange={handleChange}
                />
                Tidak Repeat
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="repeat"
                  value="yes"
                  checked={formData.repeat === 'yes'}
                  onChange={handleChange}
                />
                Repeat
              </label>
            </div>
          </div>

          {formData.repeat === 'yes' && (
            <>
              <div className="form-group">
                <label>Frekuensi Repeat *</label>
                <select
                  name="repeat_frequency"
                  value={formData.repeat_frequency}
                  onChange={handleChange}
                  required
                >
                  <option value="daily">Setiap Hari</option>
                  <option value="weekly">Setiap Minggu</option>
                  <option value="monthly">Setiap Bulan</option>
                  <option value="yearly">Setiap Tahun</option>
                </select>
              </div>

              <div className="form-group">
                <label>Batasi Repeat?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="repeat_limit"
                      value="no"
                      checked={formData.repeat_limit === 'no'}
                      onChange={handleChange}
                    />
                    Tanpa Batas
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="repeat_limit"
                      value="yes"
                      checked={formData.repeat_limit === 'yes'}
                      onChange={handleChange}
                    />
                    Sampai Tanggal Tertentu
                  </label>
                </div>
              </div>

              {formData.repeat_limit === 'yes' && (
                <div className="form-group">
                  <label>Tanggal Berakhir Repeat *</label>
                  <input
                    type="date"
                    name="repeat_end_date"
                    value={formData.repeat_end_date}
                    onChange={handleChange}
                    min={formData.tanggal}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>
                    Kegiatan akan berulang sampai tanggal ini
                  </small>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Upload Foto / Video</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {media.length > 0 && (
              <div className="file-preview">
                <p>{media.length} file dipilih</p>
                <ul>
                  {media.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Deskripsi Kegiatan</label>
            <ReactQuill
              theme="snow"
              value={formData.deskripsi}
              onChange={(value) => setFormData({ ...formData, deskripsi: value })}
              placeholder="Masukkan deskripsi kegiatan (opsional)"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['link'],
                  [{ 'header': 1 }, { 'header': 2 }],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  [{ 'indent': '-1' }, { 'indent': '+1' }],
                  ['clean']
                ]
              }}
              style={{ backgroundColor: '#fff', minHeight: '200px' }}
            />
          </div>

          <div className="form-group">
            <label>Orang yang Terkait</label>
            <div style={{ marginBottom: '10px' }}>
              <select
                onChange={(e) => {
                  const username = e.target.value;
                  if (username && !selectedUsers.includes(username)) {
                    setSelectedUsers([...selectedUsers, username]);
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Pilih user untuk ditambahkan...</option>
                {users
                  .filter(u => {
                    const pembuat = formData.pembuat || localStorage.getItem('username') || sessionStorage.getItem('username') || '';
                    return u.username !== pembuat && !selectedUsers.includes(u.username);
                  })
                  .map(user => (
                  <option key={user.id} value={user.username}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>
            </div>
            {selectedUsers.length > 0 && (
              <div className="chips">
                {selectedUsers.map(username => {
                  const user = users.find(u => u.username === username);
                  return (
                    <div key={username} className="chip">
                      <span>{user?.name || username}{username === formData.pembuat ? ' (Pembuat)' : ''}</span>
                      {username !== formData.pembuat && (
                        <button
                          type="button"
                          onClick={() => setSelectedUsers(selectedUsers.filter(u => u !== username))}
                          className="chip-remove"
                          title="Hapus"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <small className="muted-hint" style={{ display: 'block' }}>
              Jika visibility Private, kegiatan akan muncul di jadwal orang yang terkait
            </small>
          </div>

          <div className="form-group">
            <label>Ada Orang dari Luar?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="hasExternalContacts"
                  value="no"
                  checked={!hasExternalContacts}
                  onChange={() => {
                    setHasExternalContacts(false);
                    setExternalContacts([]);
                  }}
                />
                Tidak
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="hasExternalContacts"
                  value="yes"
                  checked={hasExternalContacts}
                  onChange={() => {
                    setHasExternalContacts(true);
                    if (externalContacts.length === 0) {
                      setExternalContacts([{ name: '', phone: '', email: '' }]);
                    }
                  }}
                />
                Ya
              </label>
            </div>
          </div>

          {hasExternalContacts && (
            <div className="form-group" style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', background: '#f8fafc' }}>
              <label style={{ marginBottom: '15px', display: 'block', fontSize: '1.15rem', fontWeight: '700' }}>Daftar Orang dari Luar</label>
              {externalContacts.map((contact, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>Orang {index + 1}</strong>
                    {externalContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setExternalContacts(externalContacts.filter((_, i) => i !== index))}
                        style={{
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '1rem', fontWeight: '600' }}>Nama *</label>
                      <input
                        type="text"
                        placeholder="Nama lengkap"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...externalContacts];
                          updated[index].name = e.target.value;
                          setExternalContacts(updated);
                        }}
                        required={hasExternalContacts}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '1rem', fontWeight: '600' }}>Nomor Telepon *</label>
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...externalContacts];
                          updated[index].phone = e.target.value;
                          setExternalContacts(updated);
                        }}
                        required={hasExternalContacts}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1.1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '1rem', fontWeight: '600' }}>Email *</label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={contact.email}
                        onChange={(e) => {
                          const updated = [...externalContacts];
                          updated[index].email = e.target.value;
                          setExternalContacts(updated);
                        }}
                        required={hasExternalContacts}
                        style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1.1rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExternalContacts([...externalContacts, { name: '', phone: '', email: '' }])}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  width: '100%',
                  marginTop: '10px'
                }}
              >
                + Tambah Orang Lagi
              </button>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => window.history.back()} disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>

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

export default AddKegiatan;
