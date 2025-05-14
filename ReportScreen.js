import React, { useState, useEffect } from 'react';

const ReportScreen = ({ navigation, route }) => {
  console.log('ReportScreen mounted with params:', route.params);
  const { scanId, alertData } = route.params || {};
  console.log('Parsed params:', { scanId, alertData });

  // Initialize scanData state with alertData or null
  const [scanData, setScanData] = useState(() => {
    console.log('Initializing scanData with:', alertData);
    return alertData || null;
  });

  useEffect(() => {
    console.log('scanData updated:', scanData);
  }, [scanData]);

  return (
    <div>
      {/* Your component JSX goes here */}
      <h1>Report Screen</h1>
    </div>
  );
};

export default ReportScreen;