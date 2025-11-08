// API Types
export interface PredictionRequest {
  Gender: number; // 0 = Female, 1 = Male
  Age: number;
  Neighbourhood: number; // Label encoded
  Scholarship: number; // 0 or 1
  Hipertension: number; // 0 or 1
  Diabetes: number; // 0 or 1
  Alcoholism: number; // 0 or 1
  Handcap: number; // 0 or 1 (or more)
  SMS_received: number; // 0 or 1
  WaitDays: number; // Days between scheduled and appointment
}

export interface PredictionResponse {
  prediction: number; // 0 = Show, 1 = No-Show
  probability: number; // Probability of No-Show
}

export interface Neighbourhood {
  id: number;
  name: string;
}

export interface NeighbourhoodsResponse {
  neighbourhoods: Neighbourhood[];
}

// Component Props
export interface PredictionFormProps {
  onSubmit: (formData: PredictionRequest) => void;
  neighbourhoods: Neighbourhood[];
  loading: boolean;
}

