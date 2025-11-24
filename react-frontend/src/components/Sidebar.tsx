import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBawahan: (bawahan: string | null) => void;
  selectedBawahan: string | null;
  bawahanList: string[];
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
              key={bawahan}
              className={`bawahan-item ${selectedBawahan === bawahan ? 'active' : ''}`}
              onClick={() => handleBawahanClick(bawahan)}
            >
              <span className="bawahan-icon">👤</span>
              <span className="bawahan-name">{bawahan}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
