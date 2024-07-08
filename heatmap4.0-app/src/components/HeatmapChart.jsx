// src/components/HeatmapChart.jsx: Heatmap rendering logic.

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { calculateTimeIntervals, initializeHeatmapData, populateHeatmapData, generateTooltipContent } from '../utils/heatmapUtils';
import ScaleLegend from './ScaleLegend';
import { interpolateYlGnBu, interpolateInferno, interpolatePlasma, interpolateViridis, interpolateWarm } from 'd3-scale-chromatic';

const colorSchemes = {
  YlGnBu: interpolateYlGnBu,
  Inferno: interpolateInferno,
  Plasma: interpolatePlasma,
  Viridis: interpolateViridis,
  Warm: interpolateWarm
};

const HeatmapChart = ({ data, tooltipRef, setTooltipContent }) => {
  const svgRef = useRef();
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedColorScheme, setSelectedColorScheme] = useState('YlGnBu');

  useEffect(() => {
    if (!data || !data.length) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 50, right: 25, bottom: 100, left: 150 };
    const width = 700 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const speakers = [...new Set(data.map(d => d.speaker || d.speaker_name))];
    const timeIntervals = calculateTimeIntervals(data);
    const initializedHeatmapData = initializeHeatmapData(speakers, timeIntervals);
    populateHeatmapData(initializedHeatmapData, data, speakers, timeIntervals);

    setHeatmapData(initializedHeatmapData);

    const xScale = d3.scaleBand()
      .domain(d3.range(timeIntervals.length))
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(speakers)
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential(colorSchemes[selectedColorScheme])
      .domain([0, d3.max(initializedHeatmapData.flatMap(row => row.map(cell => cell.count)))]);

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const cells = g.selectAll('rect')
      .data(initializedHeatmapData.flatMap((row, i) => row.map((cell, j) => ({ cell, x: j, y: i }))));

    cells.enter()
      .append('rect')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.cell.speaker))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.cell.count))
      .on('mouseover', handleMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

    function handleMouseOver(event, d) {
      d3.select(this)
        .style('stroke', 'black')
        .style('stroke-width', 2);

      setTooltipContent(generateTooltipContent(d.cell, data));

      handleMouseMove(event);
    }

    function handleMouseMove(event) {
      tooltipRef.current.style.opacity = 1;
      tooltipRef.current.style.left = `${event.pageX + 15}px`;
      tooltipRef.current.style.top = `${event.pageY + 15}px`;
    }

    function handleMouseOut() {
      d3.select(this)
        .style('stroke', 'none');

      tooltipRef.current.style.opacity = 0;
    }

    const yLabels = g.selectAll('.y-label')
      .data(speakers)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .text((d, i) => `Speaker ${i + 1}`);

    svg.append('text')
      .attr('x', margin.left)
      .attr('y', margin.top - 20)
      .attr('text-anchor', 'left')
      .style('font-size', '22px')
      .text('Conversation Heatmap');

  }, [data, setTooltipContent, tooltipRef, selectedColorScheme]);

  return (
    <>
      <div>
        <label htmlFor="color-scheme-select">Select Color Scheme: </label>
        <select
          id="color-scheme-select"
          value={selectedColorScheme}
          onChange={e => setSelectedColorScheme(e.target.value)}
        >
          {Object.keys(colorSchemes).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      <svg ref={svgRef} width={700} height={650}></svg>
      {heatmapData.length > 0 && (
        <ScaleLegend
          colorScale={d3.scaleSequential(colorSchemes[selectedColorScheme])
            .domain([0, d3.max(heatmapData.flatMap(row => row.map(cell => cell.count)))])}
          width={700}
          height={20}
          margin={{ left: 150, right: 25, top: 50, bottom: 0 }}
        />
      )}
    </>
  );
};

HeatmapChart.propTypes = {
  data: PropTypes.array.isRequired,
  tooltipRef: PropTypes.object.isRequired,
  setTooltipContent: PropTypes.func.isRequired,
};

export default HeatmapChart;
