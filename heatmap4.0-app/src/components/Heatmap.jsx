// src/components/Heatmap.jsx
// This component will now use the HeatmapChart and Tooltip components.

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import HeatmapChart from './HeatmapChart';
import Tooltip from './Tooltip';
import '../components/Heatmap.css';

const Heatmap = ({ data }) => {
  const tooltipRef = useRef(null);
  const [tooltipContent, setTooltipContent] = useState('');

  return (
    <div className="heatmap-container">
      <h2>Conversation Heatmap</h2>
      {data && data.length > 0 ? (
        <>
          <HeatmapChart data={data} tooltipRef={tooltipRef} setTooltipContent={setTooltipContent} />
          <Tooltip content={tooltipContent} tooltipRef={tooltipRef} />
        </>
      ) : (
        <div>No data available for heatmap.</div>
      )}
    </div>
  );
};

Heatmap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    speaker: PropTypes.string,
    speaker_name: PropTypes.string,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    words: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string.isRequired
    })),
    word_count: PropTypes.number
  })).isRequired
};

export default Heatmap;
