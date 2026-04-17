import { initialHospitals, initialAmbulances } from '../data/mockData';

// Simulated delay to mimic real network requests
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const MockAPI = {
  /**
   * GET /hospitals
   * Returns list of hospitals with current ICU availability
   */
  getHospitals: async (currentHospitals) => {
    await simulateDelay();
    // In a real app this would fetch fresh data.
    // For our mock, if current state is provided, we return it to persist simulation changes.
    return currentHospitals || initialHospitals;
  },

  /**
   * GET /ambulances
   * Returns list of all ambulances
   */
  getAmbulances: async (currentAmbulances) => {
    await simulateDelay();
    return currentAmbulances || initialAmbulances;
  },

  /**
   * POST /request
   * Creates an emergency request
   * Payload: { user_location, assigned_ambulance_id, assigned_hospital_id }
   */
  createRequest: async (payload) => {
    await simulateDelay(1000); // slightly longer for "processing"

    if (!payload.assigned_hospital_id || !payload.assigned_ambulance_id) {
      throw new Error("Missing required parameters for emergency request.");
    }

    // Generate a fake ETA based on simple distance heuristic (will be refined later with Mapbox routing if needed)
    const randomMins = Math.floor(Math.random() * 5) + 3; // 3 to 7 mins

    return {
      status: "success",
      request_id: `req-${Math.floor(Math.random() * 10000)}`,
      ambulance_id: payload.assigned_ambulance_id,
      hospital_id: payload.assigned_hospital_id,
      eta: `${randomMins} mins`
    };
  }
};
