import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

export function mountBookingWidget(el: HTMLElement, apiUrl?: string) {
  if (apiUrl) {
    (window as unknown as { __BOOKING_WIDGET_API__?: string }).__BOOKING_WIDGET_API__ = apiUrl;
  }
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Auto-mount if a target element exists
const autoEl = document.getElementById('booking-widget-root');
if (autoEl) {
  mountBookingWidget(autoEl);
}
