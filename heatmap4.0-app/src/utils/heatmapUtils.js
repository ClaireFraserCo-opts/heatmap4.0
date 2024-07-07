// heatmapUtils.js

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
        } else if (Array.isArray(d.utterances)) {
          d.utterances.forEach(utterance => {
            if (utterance.speaker === speaker) {
              utterance.words.forEach(wordObj => {
                const word = wordObj.text.toLowerCase();
                if (!stopwords.includes(word)) {
                  heatmapData[speakerIndex][i].words[word] = (heatmapData[speakerIndex][i].words[word] || 0) + 1;
                }
              });
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
  const totalWords = calculateTotalWords(data, speaker);
  const uniqueWords = calculateUniqueWords(words);
  const topWord = calculateTopWord(words);

  const percentage = data ? ((count / data.length) * 100).toFixed(2) : 0;

  return `
    <strong>Speaker:</strong> ${speaker}<br>
    <strong>Time:</strong> ${formatTime(timeStart)} - ${formatTime(timeEnd)}<br>
    <strong>Count:</strong> ${count}<br>
    <strong>Total Words:</strong> ${totalWords}<br>
    <strong>Unique Words:</strong> ${uniqueWords}<br>
    <strong>Percentage of Total:</strong> ${percentage}%<br>
    <strong>Top Word:</strong> ${topWord}<br>
  `;
}

export function formatTime(milliseconds) {
  const date = new Date(null);
  date.setMilliseconds(milliseconds);
  return date.toISOString().substr(11, 8);
}

export function calculateTotalWords(data, speaker) {
  if (!data || !Array.isArray(data)) {
    return 0;
  }

  const speakerData = data.find(d => d.speaker === speaker || d.speaker_name === speaker);
  if (!speakerData) return 0;

  if (Array.isArray(speakerData.words)) {
    return speakerData.words.length;
  } else if (Array.isArray(speakerData.utterances)) {
    return speakerData.utterances.reduce((total, utterance) => {
      if (utterance.speaker === speaker && Array.isArray(utterance.words)) {
        return total + utterance.words.length;
      }
      return total;
    }, 0);
  }

  return 0;
}

export function calculateUniqueWords(words) {
  if (!words) return 0;

  const uniqueWords = new Set(Object.keys(words));
  return uniqueWords.size;
}

export function calculateTopWord(words) {
  if (!words) return '';

  let maxCount = 0;
  let topWord = '';
  Object.entries(words).forEach(([word, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topWord = word;
    }
  });
  return topWord;
}
