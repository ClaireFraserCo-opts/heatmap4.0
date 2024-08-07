// src/components/ScaleLegend.jsx: Positioned at the bottom and centered.

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const ScaleLegend = ({ colorScale, width, height, margin }) => {
  const legendRef = useRef();

  useEffect(() => {
    const svg = d3.select(legendRef.current);
    const legendWidth = width - margin.left - margin.right;
    const legendHeight = height;

    const legendScale = d3.scaleLinear()
      .domain([0, 1]) // We're representing word frequency, so domain is [0, 1]
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".0%"));

    svg.selectAll('*').remove();

    const legendGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    const colorDomain = d3.range(0, 1, 1.0 / (legendWidth - 1));

    colorDomain.forEach((d, i) => {
      legendGradient.append('stop')
        .attr('offset', `${(i / (legendWidth - 1)) * 100}%`)
        .attr('stop-color', colorScale(d));
    });

    svg.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    svg.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);
  }, [colorScale, width, height, margin]);

  return <svg ref={legendRef} width={width} height={height + 50}></svg>; // Adjust height for the axis
};

ScaleLegend.propTypes = {
  colorScale: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.object.isRequired,
};

export default ScaleLegend;
