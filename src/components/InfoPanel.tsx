/** @jsxImportSource react */
import React from 'react'; // Removed useState import
import './InfoPanel.css';

// Define the props type, including an optional imageUrl
export interface InfoPanelProps {
  text: string;
  imageUrl?: string; // Optional image URL
  isVisible: boolean; // Add prop for visibility state
  onToggle: () => void; // Add prop for toggle handler
}

// InfoPanel component displays text and optionally an image
const InfoPanel: React.FC<InfoPanelProps> = ({ text, imageUrl, isVisible, onToggle }) => {
  // Don't render the panel container at all if there's no text (or default text)
  // Or if the parent explicitly hides it (though CSS handles visual hiding)
  if (!text || text === 'Approach an exhibit to learn more.') {
    return null;
  }

  return (
    // Add collapsed class based on isVisible prop
    <div className={`info-panel ${isVisible ? '' : 'collapsed'}`}>
      {/* Toggle Button - Use onToggle prop */}
      <button onClick={onToggle} className="info-panel-toggle-button">
        {isVisible ? '<' : '>'} {/* Change icon based on state */}
      </button>

      {/* Content is always rendered, CSS handles visibility */}
      <>
        {imageUrl && <img src={imageUrl} alt={text.substring(0, 30)} className="info-panel-image" />}
        <p>{text}</p>
      </>
    </div>
  );
};

export default InfoPanel;