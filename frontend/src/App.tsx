import React, { useState, useEffect } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import { PredictionRequest, PredictionResponse, Neighbourhood, NeighbourhoodsResponse } from './types';
import api from './api/client';

function App() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [neighbourhoodsLoading, setNeighbourhoodsLoading] = useState<boolean>(true);
  const [neighbourhoodsError, setNeighbourhoodsError] = useState<string | null>(null);

  useEffect(() => {
    setNeighbourhoodsLoading(true);
    setNeighbourhoodsError(null);
    
    api.get<NeighbourhoodsResponse>('/neighbourhoods')
      .then(response => {
        const data = response?.data;
        const list = Array.isArray(data?.neighbourhoods) ? data.neighbourhoods : [];
        setNeighbourhoods(list);
        setNeighbourhoodsError(null);
      })
      .catch(err => {
        console.error('Error fetching neighbourhoods:', err);
        
        // Extract error message
        let errorMsg = 'Failed to load neighbourhoods';
        if (err.response?.status === 503) {
          errorMsg = 'Backend model not loaded. Check if label_encoder.pkl exists.';
        } else if (err.response?.status === 404) {
          errorMsg = 'API endpoint not found. Check backend URL.';
        } else if (err.message === 'Network Error') {
          errorMsg = 'Cannot connect to backend. Is the server running?';
        } else if (err.response?.data?.detail) {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = err.message || 'Unknown error';
        }
        
        setNeighbourhoodsError(errorMsg);
        setNeighbourhoods([]);
      })
      .finally(() => {
        setNeighbourhoodsLoading(false);
      });
  }, []);

  const handlePrediction = async (formData: PredictionRequest) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await api.post<PredictionResponse>('/predict', formData);
      setPrediction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Medical Appointments No-Show Predictor</h1>
        <p>Enter patient information to predict the likelihood of a no-show</p>
      </header>
      
      <main className="App-main">
        <div className={`layout ${prediction ? 'with-result' : ''}`}>
          <PredictionForm 
            onSubmit={handlePrediction}
            neighbourhoods={neighbourhoods}
            loading={loading}
            neighbourhoodsLoading={neighbourhoodsLoading}
            neighbourhoodsError={neighbourhoodsError}
          />
          
          <div className="side-panel">
            {neighbourhoodsError && (
              <div className="error-message">
                <p><strong>Neighbourhoods Error:</strong> {neighbourhoodsError}</p>
              </div>
            )}
            {error && (
              <div className="error-message">
                <p>Error: {error}</p>
              </div>
            )}
            
            {prediction && (
              <div className="prediction-result">
                <h2>Prediction Result</h2>
                <div className="result-content">
                  <p className="prediction-label">
                    {prediction.prediction === 1 ? 'No-Show' : 'Show'}
                  </p>
                  <p className="probability">
                    Probability of No-Show: {(prediction.probability * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

