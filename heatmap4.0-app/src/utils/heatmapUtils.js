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
      words: {},
      wordCount: 0,
      density: 0,
      score: 0,
      frequency: 0,
      confidence: 0,
      utterances: [],
    }));
  });
}

export function populateHeatmapData(heatmapData, data, speakers, timeIntervals) {
  let maxCount = 0, maxDensity = 0, maxScore = 0, maxFrequency = 0, maxConfidence = 0;

  data.forEach(d => {
    const speaker = d.speaker || d.speaker_name;
    const speakerIndex = speakers.indexOf(speaker);
    if (speakerIndex !== -1) {
      const startInterval = Math.floor(d.start / 30000);
      const endInterval = Math.min(Math.ceil(d.end / 30000), timeIntervals.length - 1);

      const wordCount = d.word_count || (Array.isArray(d.words) ? d.words.length : (Array.isArray(d.utterances) ? d.utterances.reduce((acc, u) => acc + u.text.split(' ').length, 0) : 0));
      const density = d.density || (Array.isArray(d.words) ? d.words.length / (d.end - d.start) : (Array.isArray(d.utterances) ? d.utterances.reduce((acc, u) => acc + u.text.split(' ').length, 0) / (d.end - d.start) : 0));
      const score = d.score || 0; // Adjust based on your calculation
      const frequency = d.frequent_wc_base || 0; // Adjust based on your calculation
      const confidence = d.confidence || 0;

      for (let i = startInterval; i <= endInterval; i++) {
        const cell = heatmapData[speakerIndex][i];
        cell.count += 1;
        cell.wordCount += wordCount;
        cell.density += density;
        cell.score += score;
        cell.frequency += frequency;
        cell.confidence += confidence;

        maxCount = Math.max(maxCount, cell.count);
        maxDensity = Math.max(maxDensity, cell.density);
        maxScore = Math.max(maxScore, cell.score);
        maxFrequency = Math.max(maxFrequency, cell.frequency);
        maxConfidence = Math.max(maxConfidence, cell.confidence);

        if (Array.isArray(d.words)) {
          d.words.forEach(wordObj => {
            const word = wordObj.text.toLowerCase();
            if (!stopwords.includes(word)) {
              cell.words[word] = (cell.words[word] || 0) + 1;
            }
          });
        } else if (Array.isArray(d.utterances)) {
          d.utterances.forEach(utterance => {
            if (utterance.speaker === speaker) {
              const wordsArray = utterance.text.match(/\b\w+\b/g); // Extract words using regex
              if (wordsArray) {
                wordsArray.forEach(word => {
                  const normalizedWord = word.toLowerCase();
                  if (!stopwords.includes(normalizedWord)) {
                    cell.words[normalizedWord] = (cell.words[normalizedWord] || 0) + 1;
                  }
                });
              }
              cell.utterances.push(utterance);
            }
          });
        }
      }
    }
  });

  // Normalize heatmap data
  heatmapData.forEach(speakerData => {
    speakerData.forEach(cell => {
      cell.count = cell.count / maxCount;
      cell.density = cell.density / maxDensity;
      cell.score = cell.score / maxScore;
      cell.frequency = cell.frequency / maxFrequency;
      cell.confidence = cell.confidence / maxConfidence;
    });
  });
}

export function generateTooltipContent(cell) {
  const { speaker, interval, count, words, wordCount, density, score, frequency, confidence, utterances } = cell;
  const timeStart = interval * 30000;
  const timeEnd = timeStart + 30000;

  let mostUsedWord = '';
  let maxWordCount = 0;

  if (words) {
    Object.entries(words).forEach(([word, count]) => {
      if (!stopwords.includes(word.toLowerCase()) && count > maxWordCount) {
        maxWordCount = count;
        mostUsedWord = word;
      }
    });
  }

  if (utterances.length > 0) {
    const allWords = {};
    utterances.forEach(utterance => {
      const wordsArray = utterance.text.match(/\b\w+\b/g);
      if (wordsArray) {
        wordsArray.forEach(word => {
          const normalizedWord = word.toLowerCase();
          if (!stopwords.includes(normalizedWord)) {
            if (!allWords[normalizedWord]) {
              allWords[normalizedWord] = 0;
            }
            allWords[normalizedWord]++;
          }
        });
      }
    });
    Object.entries(allWords).forEach(([word, count]) => {
      if (count > maxWordCount) {
        maxWordCount = count;
        mostUsedWord = word;
      }
    });
  }

  return `
    <strong>Speaker:</strong> ${speaker}<br>
    <strong>Time:</strong> ${formatTime(timeStart)} - ${formatTime(timeEnd)}<br>
    <strong>Count:</strong> ${(count * 100).toFixed(2)}%<br>
    <strong>Total Words:</strong> ${wordCount}<br>
    <strong>Most Used Word:</strong> ${mostUsedWord}<br>
    <strong>Density:</strong> ${(density * 100).toFixed(2)} words per second<br>
    <strong>Score:</strong> ${(score * 100).toFixed(2)}<br>
    <strong>Frequency:</strong> ${(frequency * 100).toFixed(2)}<br>
    <strong>Confidence:</strong> ${(confidence * 100).toFixed(2)}<br>
  `;
}

export function stopwordsFilter(words) {
  return words.filter(word => !stopwords.includes(word.toLowerCase()));
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

  return speakerData.word_count || (Array.isArray(speakerData.words) ? speakerData.words.length : (Array.isArray(speakerData.utterances) ? speakerData.utterances.reduce((acc, u) => acc + u.text.split(' ').length, 0) : 0));
}

export function calculateUniqueWords(words) {
  if (!words) return 0;

  const uniqueWords = new Set(Object.keys(words));
  return uniqueWords.size;
}
