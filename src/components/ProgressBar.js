import React from "react";
const ProgressBar = ({ progress }) => {
  return (
    <div className="progress vertical">
      <div style={{ width: `${progress}%` }} className="progress-bar" />
    </div>
  );
};

export default ProgressBar;
