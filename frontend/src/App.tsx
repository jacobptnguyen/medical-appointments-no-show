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

  useEffect(() => {
    // Fetch neighbourhoods on component mount
    api.get<NeighbourhoodsResponse>('/neighbourhoods')
      .then(response => {
        const data = response?.data;
        const list = Array.isArray(data?.neighbourhoods) ? data.neighbourhoods : [];
        setNeighbourhoods(list);
      })
      .catch(err => {
        console.error('Error fetching neighbourhoods:', err);
        setNeighbourhoods([]);
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
          />
          
          <div className="side-panel">
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

