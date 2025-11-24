import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpSuccess.css';

const SignUpSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-success-container">
      <div className="signup-success-box">
        <div className="success-icon">✓</div>
        <h1>Pendaftaran Berhasil!</h1>
        <p className="success-message">
          Akun Anda telah berhasil didaftarkan dan sedang menunggu persetujuan dari Atasan.
        </p>
        <p className="success-info">
          Anda akan menerima email konfirmasi setelah akun Anda disetujui. 
          Silakan periksa inbox email Anda secara berkala.
        </p>
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          Kembali ke Halaman Utama
        </button>
      </div>
    </div>
  );
};

export default SignUpSuccess;
