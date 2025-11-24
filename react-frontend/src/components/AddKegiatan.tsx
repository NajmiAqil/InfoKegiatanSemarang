import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AddKegiatan.css';

const AddKegiatan: React.FC = () => {
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

  // Calculate tanggal_berakhir based on jam_mulai and jam_berakhir
  const calculateEndDate = (startDate: string, startTime: string, endTime: string) => {
    if (!startDate || !startTime || !endTime) return startDate;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // If end time is less than or equal to start time, it means next day
    if (endMinutes <= startMinutes) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    }
    
    return startDate;
  };

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
    if (e.target.files) {
      setMedia(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();
    
    // Ensure pembuat is always sent
    const pembuatValue = formData.pembuat || localStorage.getItem('username') || sessionStorage.getItem('username') || 'Unknown';
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'pembuat') {
        formDataToSend.append(key, pembuatValue);
      } else {
        formDataToSend.append(key, value);
      }
    });
    
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

    media.forEach((file, index) => {
      formDataToSend.append(`media[${index}]`, file);
    });

    // Debug: log form data
    console.log('Submitting form data:', {
      judul: formData.judul,
      tanggal: formData.tanggal,
      tanggal_berakhir: formData.tanggal_berakhir,
      jenis_kegiatan: formData.jenis_kegiatan,
      jam_mulai: formData.jam_mulai,
      jam_berakhir: formData.jam_berakhir,
      lokasi: formData.lokasi,
      visibility: formData.visibility,
      repeat: formData.repeat,
      repeat_frequency: formData.repeat_frequency,
      repeat_limit: formData.repeat_limit,
      repeat_end_date: formData.repeat_end_date,
      pembuat: pembuatValue,
      mediaCount: media.length
    });

    try {
      const response = await fetch('/api/activities', {
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

      const responseData = await response.json();
      console.log('Success response:', responseData);
      
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
        repeat: 'no',
        repeat_frequency: 'daily',
        repeat_limit: 'no',
        repeat_end_date: '',
      });
      setMedia([]);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/atasan';
      }, 2000);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan kegiatan');
    }
  };

  return (
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
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                title="Otomatis terisi jika jam berakhir melewati tengah malam"
              />
              {formData.tanggal && formData.tanggal_berakhir && formData.tanggal_berakhir !== formData.tanggal && (
                <small style={{ color: '#f57c00', fontSize: '0.85rem', marginTop: '4px' }}>
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
                                      const h = hour === 12 ? 0 : hour;
                                      const min = formData.jam_mulai?.split(':')[1] || '00';
                                      const newTime = `${h.toString().padStart(2, '0')}:${min}`;
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
                                      const h = hour === 12 ? 0 : hour;
                                      const min = formData.jam_berakhir?.split(':')[1] || '00';
                                      const newTime = `${h.toString().padStart(2, '0')}:${min}`;
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
              <option value="kantor">Kantor (Hanya atasan & bawahan)</option>
              <option value="private">Private (Hanya pembuat)</option>
            </select>
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
            <label>Orang yang Berhubungan</label>
            <input
              type="text"
              name="orang_terkait"
              value={formData.orang_terkait}
              onChange={handleChange}
              placeholder="Nama orang terkait (opsional)"
            />
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Simpan Kegiatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKegiatan;
