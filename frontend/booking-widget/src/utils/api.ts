import axios from 'axios';

const windowApi = (window as unknown as { __BOOKING_WIDGET_API__?: string }).__BOOKING_WIDGET_API__;

export const api = axios.create({
  baseURL: windowApi ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
});
