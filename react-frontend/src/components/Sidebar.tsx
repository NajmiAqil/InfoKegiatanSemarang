import React, { useState } from 'react';
import { OPD_LIST } from '../constants/opd';
import './Sidebar.css';

interface BawahanData {
  id: number;
  name: string;
  username: string;
  opd?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBawahan: (bawahan: string | null) => void;
  selectedBawahan: string | null;
  bawahanList: BawahanData[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSelectBawahan, selectedBawahan, bawahanList }) => {
  const [expandedDivisi, setExpandedDivisi] = useState<string[]>([]);

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

  const toggleDivisi = (divisi: string) => {
    setExpandedDivisi(prev => 
      prev.includes(divisi) 
        ? prev.filter(d => d !== divisi)
        : [...prev, divisi]
    );
  };

  // Group bawahan by OPD
  const bawahanByOpd = OPD_LIST.reduce((acc, opd) => {
    if (opd !== 'Semua Divisi') {
      acc[opd] = bawahanList.filter(b => b.opd === opd);
    }
    return acc;
  }, {} as Record<string, BawahanData[]>);

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
          
          <div className="divisi-separator"></div>
          
          {Object.entries(bawahanByOpd).map(([divisi, bawahans]) => (
            bawahans.length > 0 && (
              <div key={divisi} className="divisi-group">
                <button
                  className="divisi-header"
                  onClick={() => toggleDivisi(divisi)}
                >
                  <span className="divisi-icon">{expandedDivisi.includes(divisi) ? '▼' : '▶'}</span>
                  <span className="divisi-name">{divisi}</span>
                  <span className="divisi-count">({bawahans.length})</span>
                </button>
                
                {expandedDivisi.includes(divisi) && (
                  <div className="bawahan-list">
                    {bawahans.map((bawahan) => (
                      <button
                        key={bawahan.username}
                        className={`bawahan-item nested ${selectedBawahan === bawahan.username ? 'active' : ''}`}
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
                )}
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
