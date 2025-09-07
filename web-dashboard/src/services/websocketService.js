class WebSocketService {
  constructor() {
    this.websocket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Reduced attempts
    this.reconnectDelay = 2000; // Increased delay
    this.isConnecting = false;
    this.fallbackPolling = null;
    this.useFallback = false;
  }

  connect() {
    if (this.isConnecting || (this.websocket && this.websocket.readyState === WebSocket.OPEN)) {
      console.log('🔄 WebSocket already connecting or connected');
      return;
    }

    this.isConnecting = true;
    console.log('🔄 Attempting to connect to IoT WebSocket...');

    try {
      // Connect to IoT service real-time WebSocket
      this.websocket = new WebSocket('ws://localhost:8011/api/v1/iot/realtime');
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.emit('connection_status', { connected: false, error: error.message });
      // Start fallback immediately if WebSocket creation fails
      this.useFallback = true;
      this.startFallbackPolling();
    }
  }

  setupEventListeners() {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      console.log('🔄 IoT WebSocket connected to real-time stream');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.emit('connection_status', { connected: true });
      this.emit('iot_connected', { message: 'Real-time IoT data streaming active' });
    };

    this.websocket.onclose = (event) => {
      console.log('🔌 IoT WebSocket disconnected:', event.code, event.reason || 'No reason provided');
      this.isConnecting = false;

      // If it wasn't a clean close and we're not already using fallback, start fallback
      if (event.code !== 1000 && !this.useFallback) {
        console.log('📡 WebSocket closed unexpectedly, starting fallback polling...');
        this.useFallback = true;
        this.startFallbackPolling();
      } else if (event.code === 1000) {
        this.emit('connection_status', { connected: false, reason: 'Clean disconnect' });
      }
    };

    this.websocket.onerror = (error) => {
      console.warn('⚠️ IoT WebSocket error (this is normal, falling back to polling):', error.type || 'Connection error');
      this.isConnecting = false;
      this.emit('connection_error', {
        error: 'WebSocket connection failed, using fallback',
        details: error.type || 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Immediately start fallback polling instead of trying to reconnect
      if (!this.useFallback) {
        console.log('📡 Starting fallback polling due to WebSocket error...');
        this.useFallback = true;
        this.startFallbackPolling();
      }
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Real-time IoT data received:', data);

        // Emit specific events based on data type
        if (data.type === 'new_alert') {
          this.emit('iot_alert', data.alert);
        } else if (data.type === 'action_completed') {
          this.emit('iot_action_completed', data);
        } else {
          // Regular metrics update
          this.emit('iot_metrics', data);
          this.emit('performance_metrics', data);
        }

        // Always emit the raw data
        this.emit('iot_realtime_data', data);

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.warn('⚠️ Max WebSocket reconnection attempts reached, falling back to polling');
      this.useFallback = true;
      this.startFallbackPolling();
      this.emit('connection_failed', {
        message: 'WebSocket unavailable, using fallback polling',
        fallback: true
      });
    }
  }

  startFallbackPolling() {
    if (this.fallbackPolling) {
      clearInterval(this.fallbackPolling);
    }

    console.log('📡 Starting fallback polling for IoT data...');
    this.emit('connection_status', { connected: true, fallback: true });

    // Poll every 5 seconds as fallback
    this.fallbackPolling = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8011/api/v1/iot/metrics');
        if (response.ok) {
          const data = await response.json();
          // Simulate WebSocket message format
          this.emit('iot_realtime_data', {
            timestamp: new Date().toISOString(),
            metrics: data.metrics,
            type: 'fallback_polling'
          });
        }
      } catch (error) {
        console.error('❌ Fallback polling failed:', error);
        this.emit('connection_status', { connected: false, fallback: true, error: error.message });
      }
    }, 5000);
  }

  stopFallbackPolling() {
    if (this.fallbackPolling) {
      clearInterval(this.fallbackPolling);
      this.fallbackPolling = null;
      console.log('🛑 Stopped fallback polling');
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send data to server
  send(event, data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ event, data }));
    } else {
      console.warn('WebSocket not connected, cannot send data');
    }
  }

  // Subscribe to specific channels
  subscribe(channel) {
    this.send('subscribe', { channel });
  }

  unsubscribe(channel) {
    this.send('unsubscribe', { channel });
  }

  // Join specific rooms
  joinRoom(room) {
    this.send('join_room', { room });
  }

  leaveRoom(room) {
    this.send('leave_room', { room });
  }

  // Send chat messages
  sendMessage(message, room = 'general') {
    this.send('chat_message', {
      message,
      room,
      timestamp: new Date().toISOString()
    });
  }

  // Request real-time data
  requestLiveData(dataType) {
    this.send('request_live_data', { type: dataType });
  }

  // Update user status
  updateUserStatus(status) {
    this.send('user_status', { status });
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close(1000, 'Client disconnect');
      this.websocket = null;
    }
    this.stopFallbackPolling();
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.useFallback = false;
  }

  isConnected() {
    return (this.websocket && this.websocket.readyState === WebSocket.OPEN) ||
           (this.useFallback && this.fallbackPolling !== null);
  }

  getConnectionId() {
    return this.websocket ? 'iot-realtime-connection' : null;
  }

  // IoT-specific methods
  requestIoTMetrics() {
    this.send('request_metrics', { timestamp: new Date().toISOString() });
  }

  subscribeToDeviceUpdates(deviceId) {
    this.send('subscribe_device', { device_id: deviceId });
  }

  unsubscribeFromDeviceUpdates(deviceId) {
    this.send('unsubscribe_device', { device_id: deviceId });
  }
}

export const websocketService = new WebSocketService();
