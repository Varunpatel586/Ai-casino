// src/host/startHost.js
import WebSocketHost from './WebSocketHost.js';

console.log('🚀 Starting Turing Test Host Server...');
console.log('========================================\n');

const port = process.env.PORT || 8080;
const host = new WebSocketHost(port);

host.start();

console.log('💡 Instructions for Host:');
console.log('1. Keep this terminal open to run the host server');
console.log('2. Players will automatically connect when "human" mode is selected');
console.log('3. Check status at: http://localhost:' + port);
console.log('4. To test connection: http://localhost:' + port + '/status');
console.log('5. Press Ctrl+C to stop the server\n');

console.log('🎯 Game Flow:');
console.log('• Round 3 randomly selects AI or Human mode');
console.log('• If Human: automatically connects to this server');
console.log('• Host chats with players through the game interface');
console.log('• Players guess if they are talking to AI or Human\n');