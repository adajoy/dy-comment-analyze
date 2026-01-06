import 'dotenv/config';
import { WebSocket, WebSocketServer } from 'ws';
import processMessage from './processMessage';

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8159;

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

// Track active connections
let connectionCount = 0;
const clients = new Map<WebSocket, number>();

console.log(`🚀 WebSocket server started on port ${PORT}`);
console.log(`Waiting for connections...`);

// Handle new connections
wss.on('connection', (ws: WebSocket) => {
  connectionCount++;
  const clientId = connectionCount;
  clients.set(ws, clientId);
  
  console.log(`\n✅ Client #${clientId} connected`);
  console.log(`📊 Total active connections: ${clients.size}`);

  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    const message = data.toString();
    const timestamp = new Date().toISOString();
    
    // console.log(`\n📨 Message from Client #${clientId}:`);
    // console.log(`   Time: ${timestamp}`);
    // console.log(`   Content: ${message}`);
    processMessage(message);
    
    // Optional: Echo the message back to confirm receipt
    try {
      ws.send(JSON.stringify({
        status: 'received',
        clientId,
        timestamp,
        originalMessage: message
      }));
    } catch (error) {
      console.error(`❌ Error sending acknowledgment to Client #${clientId}:`, error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`\n❌ Client #${clientId} disconnected`);
    console.log(`📊 Total active connections: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error: Error) => {
    console.error(`\n⚠️  Error from Client #${clientId}:`, error.message);
  });
});

// Handle server errors
wss.on('error', (error: Error) => {
  console.error('\n❌ WebSocket Server Error:', error);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n\n🛑 Shutting down WebSocket server...');
  
  // Close all client connections
  clients.forEach((clientId, ws) => {
    console.log(`   Closing connection to Client #${clientId}`);
    ws.close();
  });
  
  // Close the server
  wss.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
};

// Listen for shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

