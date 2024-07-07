// src/utils/heatmapUtils.js
// This file contains utility functions used in the heatmap.

import stopwords from './stopwords';

export function calculateTimeIntervals(data) {
  const endTimes = data.map(d => d.end);
  const maxEndTime = Math.max(...endTimes);
  const numIntervals = Math.ceil(maxEndTime / 30000);
  return Array.from({ length: numIntervals }, (_, i) => i * 30);
}

export function initializeHeatmapData(speakers, timeIntervals) {
  return speakers.map(speaker => {
    return timeIntervals.map(interval => ({
      speaker,
      interval,
      count: 0,
      words: {}
    }));
  });
}

export function populateHeatmapData(heatmapData, data, speakers, timeIntervals) {
  data.forEach(d => {
    const speaker = d.speaker || d.speaker_name;
    const speakerIndex = speakers.indexOf(speaker);
    if (speakerIndex !== -1) {
      const startInterval = Math.floor(d.start / 30000);
      const endInterval = Math.min(Math.ceil(d.end / 30000), timeIntervals.length - 1);

      for (let i = startInterval; i <= endInterval; i++) {
        heatmapData[speakerIndex][i].count += 1;

        if (Array.isArray(d.words)) {
          d.words.forEach(wordObj => {
            const word = wordObj.text.toLowerCase();
            if (!stopwords.includes(word)) {
              heatmapData[speakerIndex][i].words[word] = (heatmapData[speakerIndex][i].words[word] || 0) + 1;
            }
          });
        }
      }
    }
  });
}

export function generateTooltipContent(cell, data) {
  const { speaker, interval, count, words } = cell;
  const timeStart = interval * 30000;
  const timeEnd = timeStart + 30000;
  const totalWords = Object.values(words).reduce((acc, curr) => acc + curr, 0);
  const uniqueWords = Object.keys(words).length;
  const percentage = data ? ((count / data.length) * 100).toFixed(2) : 0;

  return `
    <strong>Speaker:</strong> ${speaker}<br>
    <strong>Time:</strong> ${formatTime(timeStart)} - ${formatTime(timeEnd)}<br>
    <strong>Count:</strong> ${count}<br>
    <strong>Total Words:</strong> ${totalWords}<br>
    <strong>Unique Words:</strong> ${uniqueWords}<br>
    <strong>Percentage of Total:</strong> ${percentage}%<br>
  `;
}

export function formatTime(milliseconds) {
  const date = new Date(null);
  date.setMilliseconds(milliseconds);
  return date.toISOString().substr(11, 8);
}

export function calculateTotalWords(data) {
  if (!data || !Array.isArray(data)) {
    return 0;
  }

  let totalWords = 0;
  data.forEach(item => {
    if (item.words && Array.isArray(item.words)) {
      totalWords += item.words.length;
    }
  });

  return totalWords;
}

export function calculateUniqueWords(heatmapData) {
  let uniqueWords = new Set();
  heatmapData.forEach(speaker => {
    speaker.forEach(intervalData => {
      if (intervalData.words) {
        Object.keys(intervalData.words).forEach(word => {
          uniqueWords.add(word);
        });
      }
    });
  });
  return uniqueWords.size;
}

export function calculatePercentageOfTotal(heatmapData, totalWords) {
  const percentages = [];
  heatmapData.forEach(speakerData => {
    let speakerTotal = 0;
    speakerData.forEach(intervalData => {
      if (intervalData.words) {
        Object.values(intervalData.words).forEach(count => {
          speakerTotal += count;
        });
      }
    });
    const percentage = totalWords > 0 ? (speakerTotal / totalWords) * 100 : 0;
    percentages.push(percentage);
  });
  return percentages;
}

export function calculateTopWord(heatmapData) {
  const topWords = [];
  heatmapData.forEach(speakerData => {
    let maxCount = 0;
    let topWord = '';
    speakerData.forEach(intervalData => {
      if (intervalData.words) {
        Object.entries(intervalData.words).forEach(([word, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topWord = word;
          }
        });
      }
    });
    topWords.push(topWord);
  });
  return topWords;
}

  