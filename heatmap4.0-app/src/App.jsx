import React, { useState, useEffect } from 'react';
import { fetchData } from './utils/fetchData'; // Assuming this is correctly implemented
import Dropdown from './components/Dropdown';
import Heatmap from './components/Heatmap';
import LoadingIndicator from './components/LoadingIndicator';
import './App.css';

const App = () => {
  const [data, setData] = useState([]); // Initialize data state as an empty array
  const [selectedFile, setSelectedFile] = useState(null); // Initialize selectedFile state as null
  const [loading, setLoading] = useState(true); // Initialize loading state as true
  const [error, setError] = useState(null); // Initialize error state as null

  useEffect(() => {
    const loadData = async () => {
      try {
        const allData = await fetchData('/data/fileList.json'); // Fetch data using fetchData utility

        // Transform allData into the expected format with fileName and data array
        const transformedData = allData.map(item => ({
          fileName: item.fileName,
          data: item.data.utterances // Adjust according to your actual structure
        }));

        setData(transformedData); // Update data state with transformed data
        setLoading(false); // Update loading state to false
      } catch (error) {
        console.error('Failed to load data', error);
        setError(error); // Set error state if data fetching fails
        setLoading(false); // Update loading state to false
      }
    };

    loadData(); // Call loadData function on component mount
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  const handleFileChange = (fileName) => {
    setSelectedFile(fileName); // Update selectedFile state when file is selected
  };

  return (
    <div className="App">
      <h1>Therapy Session Heatmap</h1>
      {loading && <LoadingIndicator />}
      {error && <div>Error loading data: {error.message}</div>}
      {!loading && !error && (
        <>
          <Dropdown files={data.map(item => item.fileName)} onChange={handleFileChange} />
          {selectedFile && (
            <Heatmap data={data.find(item => item.fileName === selectedFile)?.data} />
          )}
        </>
      )}
    </div>
  );
};

export default App;
