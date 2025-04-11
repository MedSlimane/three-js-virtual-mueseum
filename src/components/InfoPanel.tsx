import React from 'react';

interface InfoPanelProps {
  text: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ text }) => {
  return (
    <div className="info-panel">
      <p>{text}</p>
    </div>
  );
};

export default InfoPanel;