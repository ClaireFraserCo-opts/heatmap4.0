// src/components/Tooltip.jsx
//This component will handle rendering the tooltip.
import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({ content, tooltipRef }) => (
  <div ref={tooltipRef} className="tooltip" dangerouslySetInnerHTML={{ __html: content }}></div>
);

Tooltip.propTypes = {
  content: PropTypes.string.isRequired,
  tooltipRef: PropTypes.object.isRequired,
};

export default Tooltip;
