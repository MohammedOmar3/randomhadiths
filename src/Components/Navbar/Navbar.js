import React from 'react';
import downloadIcon from '../../images/download.png'; 
import shareIcon from '../../images/share.png'; 
import copyIcon from '../../images/copy.png'; 

const Navbar = ({ onDownload, onShare, onCopy }) => {
  return (
    <div className="navbar">
      <span className="navbar-text">nstxo.com</span>
      <div className="functions navbar-buttons">
        <button onClick={onDownload} className="navbar-icon-button">
          <img src={downloadIcon} alt="Download" className="navbar-icon" />
        </button>
        <button onClick={onShare} className="navbar-icon-button">
          <img src={shareIcon} alt="Share" className="navbar-icon" />
        </button>
        <button onClick={onCopy} className="navbar-icon-button">
          <img src={copyIcon} alt="Copy" className="navbar-icon" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;