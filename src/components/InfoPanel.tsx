/** @jsxImportSource react */
import React from 'react';
import './InfoPanel.css';

// Define the props type, including an optional imageUrl
export interface InfoPanelProps {
  text: string;
  imageUrl?: string; // Optional image URL
}

// InfoPanel component displays text and optionally an image
const InfoPanel: React.FC<InfoPanelProps> = ({ text, imageUrl }) => {
  // Don't render the panel if there's no text (or default text)
  if (!text || text === 'Approach an exhibit to learn more.') {
    return null;
  }

  return (
    <div className="info-panel">
      {/* Conditionally render the image if imageUrl is provided */}
      {imageUrl && <img src={imageUrl} alt={text.substring(0, 30)} className="info-panel-image" />}
      <p>{text}</p>
    </div>
  );
};

export default InfoPanel;