import { useEffect, useState } from 'react';
import ReconnectingWebSocket from 'react-native-reconnecting-websocket';

const useWebSocket = (userId, onMessage) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new ReconnectingWebSocket(
      `wss://urbanbookk-1.onrender.com/ws/booking/${userId}/`
    );
    setWs(websocket);

    websocket.onopen = () => console.log('WebSocket Connected');
    websocket.onmessage = onMessage;
    websocket.onerror = (e) => console.error('WebSocket Error:', e);
    websocket.onclose = () => console.log('WebSocket Disconnected');

    return () => {
      if (websocket) websocket.close();
    };
  }, [userId]);

  return ws;
};

export default useWebSocket;