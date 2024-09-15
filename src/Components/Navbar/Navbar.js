import React from 'react';
import downloadIcon from '../../images/download.png'; // Adjust the path as necessary
import shareIcon from '../../images/share.png'; // Adjust the path as necessary
import copyIcon from '../../images/screenshot.png'; // Adjust the path as necessary

const Navbar = () => {
  return (
    <div className="navbar">
      <span>nstxo.com</span>
      <div className="functions">
        <a href="#home">
          <img src={downloadIcon} alt="Home" className="navbar-icon" />
        </a>
        <a href="#about">
          <img src={shareIcon} alt="About" className="navbar-icon" />
        </a>
        <a href="#contact">
          <img src={copyIcon} alt="Contact" className="navbar-icon" />
        </a>
      </div>
    </div>
  );
}

export default Navbar;