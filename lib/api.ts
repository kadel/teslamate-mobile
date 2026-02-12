import axios from 'axios';
import { getApiUrl, getApiToken } from './store';

const createClient = async () => {
  const baseURL = await getApiUrl();
  const token = await getApiToken();

  return axios.create({
    baseURL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export interface Car {
  car_id: number;
  name: string;
}

export interface CarStatus {
  state: string;
  odometer: number;
  car_status: {
    locked: boolean;
    sentry_mode: boolean;
  };
  car_geodata: {
    latitude: number;
    longitude: number;
  };
  climate_details: {
    inside_temp: number;
    outside_temp: number;
  };
  battery_details: {
    battery_level: number;
    ideal_battery_range: number;
    usable_battery_level: number;
  };
  charging_details: {
    charging_state: string;
    charge_energy_added: number;
    charge_limit_soc: number;
    time_to_full_charge: number;
    charger_power: number;
    charger_voltage: number;
    charger_actual_current: number;
    charger_phases: number | null;
  };
}

export interface Drive {
  drive_id: number;
  start_date: string;
  end_date: string;
  odometer_details: {
    odometer_distance: number;
  };
  duration_min: number;
  energy_consumed_net: number;
  consumption_net: number;
  start_address: string;
  end_address: string;
  speed_avg: number;
  speed_max: number;
  inside_temp_avg: number;
  outside_temp_avg: number;
}

export interface DriveDetail {
  detail_id: number;
  date: string;
  latitude: number;
  longitude: number;
  speed: number;
  power: number;
  odometer: number;
  battery_level: number;
  elevation: number;
  climate_info: {
    inside_temp: number | null;
    outside_temp: number | null;
  };
}

export interface DriveWithDetails extends Drive {
  drive_details: DriveDetail[];
}

export const fetchDriveDetails = async (carId: number, driveId: number): Promise<DriveWithDetails> => {
  const client = await createClient();
  const response = await client.get(`/api/v1/cars/${carId}/drives/${driveId}`);
  return response.data.data.drive;
};

export const fetchCars = async (): Promise<Car[]> => {
  const client = await createClient();
  const response = await client.get('/api/v1/cars');
  return response.data.data.cars;
};

export const fetchCarStatus = async (carId: number): Promise<CarStatus> => {
  const client = await createClient();
  const response = await client.get(`/api/v1/cars/${carId}/status`);
  return response.data.data.status;
};

export const fetchDrives = async (carId: number): Promise<Drive[]> => {
  const client = await createClient();
  const response = await client.get(`/api/v1/cars/${carId}/drives`);
  return response.data.data.drives;
};

export const wakeUp = async (carId: number) => {
  const client = await createClient();
  const response = await client.post(`/api/v1/cars/${carId}/wake_up`);
  return response.data;
};

/** Quick connectivity check — fetches the cars list and throws on failure */
export const testConnection = async (): Promise<void> => {
  const client = await createClient();
  await client.get('/api/v1/cars', { timeout: 10000 });
};
