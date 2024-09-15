import React from 'react';
import loaderImage from '../../images/loader.png'; // Adjust relative path as needed
import '../../SkeletonLoader.css'; // Ensure this path is correct

const SkeletonLoader = ({ width, height, borderRadius }) => {
    return (
      <div
        className="skeleton-loader"
        style={{
          width: width || '100px',
          height: height || '100px',
          borderRadius: borderRadius || '0px',
        }}
      >
        <img src={loaderImage} alt="Loading" className="pulsing-image" />
      </div>
    );
  };
export default SkeletonLoader;
