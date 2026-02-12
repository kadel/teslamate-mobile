import * as SecureStore from 'expo-secure-store';

const API_URL_KEY = 'teslamate_api_url';
const API_TOKEN_KEY = 'teslamate_api_token';

export const getApiUrl = async () => {
  return (await SecureStore.getItemAsync(API_URL_KEY)) || 'http://teslamateapi.apps.home.tomaskral.eu';
};

export const setApiUrl = async (url: string) => {
  await SecureStore.setItemAsync(API_URL_KEY, url);
};

export const getApiToken = async () => {
  return await SecureStore.getItemAsync(API_TOKEN_KEY);
};

export const setApiToken = async (token: string) => {
  await SecureStore.setItemAsync(API_TOKEN_KEY, token);
};
