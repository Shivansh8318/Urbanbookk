// src/features/shared/websocket/useBookingWebSocket.js
import useWebSocket  from 'react-use-websocket';
import { useNavigate } from 'react-router-dom';

const useBookingWebSocket = (userId, role) => {
  const navigate = useNavigate();
  const getWebSocketUrl = () => `/ws/booking/${userId}/`;

  const { sendMessage, lastMessage, readyState } = useWebSocket(getWebSocketUrl(), {
    onOpen: () => console.log(`WebSocket Connected for ${role}Booking:`, getWebSocketUrl()),
    onError: (error) => {
      console.error('WebSocket Error:', error);
      alert('WebSocket connection failed. Please check your network or try again later.');
    },
    onClose: (event) => {
      console.error('WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
      if (event.code === 1008) {
        alert('Access denied. Please log in again.');
        navigate(`/auth/${role}`);
      }
    },
    shouldReconnect: (closeEvent) => closeEvent?.code !== 1000 && closeEvent?.code !== 1008,
    reconnectAttempts: 3,
    reconnectInterval: 10000,
  });

  return { sendMessage, lastMessage, readyState };
};

export default useBookingWebSocket;