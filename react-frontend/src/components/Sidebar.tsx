import React from 'react';
import './Sidebar.css';

interface BawahanData {
  id: number;
  name: string;
  username: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBawahan: (bawahan: string | null) => void;
  selectedBawahan: string | null;
  bawahanList: BawahanData[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSelectBawahan, selectedBawahan, bawahanList }) => {

  const handleBawahanClick = (bawahan: string) => {
    if (selectedBawahan === bawahan) {
      onSelectBawahan(null); // Deselect jika klik yang sama
    } else {
      onSelectBawahan(bawahan);
    }
  };

  const handleShowAll = () => {
    onSelectBawahan(null);
  };

  return (
    <>
      {/* Overlay untuk close sidebar saat klik di luar */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Daftar Bawahan</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="sidebar-content">
          <button 
            className={`bawahan-item ${selectedBawahan === null ? 'active' : ''}`}
            onClick={handleShowAll}
          >
            <span className="bawahan-icon">👥</span>
            <span className="bawahan-name">Semua Kegiatan</span>
          </button>
          
          {bawahanList.map((bawahan) => (
            <button
              key={bawahan.username}
              className={`bawahan-item ${selectedBawahan === bawahan.username ? 'active' : ''}`}
              onClick={() => handleBawahanClick(bawahan.username)}
            >
              <span className="bawahan-icon">👤</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span className="bawahan-name" style={{ fontWeight: '600' }}>{bawahan.name}</span>
                <span style={{ fontSize: '0.85em', opacity: 0.8 }}>@{bawahan.username}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
