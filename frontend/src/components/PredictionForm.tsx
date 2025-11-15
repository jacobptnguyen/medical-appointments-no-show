import React, { useState, ChangeEvent, FormEvent } from 'react';
import './PredictionForm.css';
import { PredictionFormProps, PredictionRequest } from '../types';

const PredictionForm: React.FC<PredictionFormProps> = ({ 
  onSubmit, 
  neighbourhoods, 
  loading,
  neighbourhoodsLoading = false,
  neighbourhoodsError = null
}) => {
  const [formData, setFormData] = useState<PredictionRequest>({
    Gender: 0,
    Age: 30,
    Neighbourhood: 0,
    Scholarship: 0,
    Hipertension: 0,
    Diabetes: 0,
    Alcoholism: 0,
    Handcap: 0,
    SMS_received: 0,
    WaitDays: 0,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : parseInt(value) || 0
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="prediction-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="Gender">Gender</label>
          <select
            id="Gender"
            name="Gender"
            value={formData.Gender}
            onChange={handleChange}
          >
            <option value={0}>Female</option>
            <option value={1}>Male</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="Age">Age</label>
          <input
            type="number"
            id="Age"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            min="0"
            max="120"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="Neighbourhood">Neighborhood (Brazil)</label>
          <select
            id="Neighbourhood"
            name="Neighbourhood"
            value={formData.Neighbourhood}
            onChange={handleChange}
            required
            disabled={neighbourhoodsLoading || !!neighbourhoodsError}
          >
            {neighbourhoodsLoading ? (
              <option value={0}>Loading...</option>
            ) : neighbourhoodsError ? (
              <option value={0}>Error: {neighbourhoodsError}</option>
            ) : neighbourhoods.length > 0 ? (
              neighbourhoods.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))
            ) : (
              <option value={0}>No neighbourhoods available</option>
            )}
          </select>
          {neighbourhoodsError && (
            <small style={{ color: 'red', display: 'block', marginTop: '4px' }}>
              {neighbourhoodsError}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="Handcap">Handicap Level</label>
          <input
            type="number"
            id="Handcap"
            name="Handcap"
            value={formData.Handcap}
            onChange={handleChange}
            min="0"
            max="4"
            required
          />
          <small className="field-hint">
            0: no reported disability; 1-4: multiple disabilities reported
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="WaitDays">Days between scheduled and appointment</label>
          <input
            type="number"
            id="WaitDays"
            name="WaitDays"
            value={formData.WaitDays}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="checkbox-group-row">
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="Scholarship"
              checked={formData.Scholarship === 1}
              onChange={handleChange}
            />
            Scholarship
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              name="SMS_received"
              checked={formData.SMS_received === 1}
              onChange={handleChange}
            />
            SMS Received
          </label>
        </div>

        <div className="checkbox-group-row">
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="Hipertension"
              checked={formData.Hipertension === 1}
              onChange={handleChange}
            />
            Hypertension
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              name="Diabetes"
              checked={formData.Diabetes === 1}
              onChange={handleChange}
            />
            Diabetes
          </label>

          <label className="checkbox-option">
            <input
              type="checkbox"
              name="Alcoholism"
              checked={formData.Alcoholism === 1}
              onChange={handleChange}
            />
            Alcoholism
          </label>
        </div>
      </div>

      <button type="submit" className="submit-button" disabled={loading || !!neighbourhoodsError}>
        {loading ? 'Predicting...' : 'Predict No-Show'}
      </button>
    </form>
  );
};

export default PredictionForm;

