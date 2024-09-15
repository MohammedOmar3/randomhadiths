import React from 'react';
import '../../SkeletonLoader.css'; // Ensure this path is correct

const SkeletonLoader = ({ width, height, borderRadius, className }) => {
    return (
      <div
        className={`skeleton-loader ${className || ''}`} // Combine base class with additional className
        style={{
          width: width || '100%',
          height: height || '20px',
          borderRadius: borderRadius || '4px',
        }}
      ></div>
    );
  };
export default SkeletonLoader;
