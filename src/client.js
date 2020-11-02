import net from 'net';
import readline from 'readline';
import { types } from './constants.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'ChatApp> '
});

const config = {
  port: 8080
};
const clients = net.connect(config, () => {
  console.log('connected to server!');
});

clients.on('error', (error) => {
  console.log(error.message);
});

clients.on('data', (data) => {
  process.stdout.clearLine(-1);
  process.stdout.cursorTo(0);
  const type = data[0];
  const messageFrom = data.slice(1, 257).toString();
  const message = data.slice(257).toString();

  switch (type) {
    case types.CONNECT:
      console.log('C', messageFrom, 'User connected');
      break;
    case types.DISCONNECT:
      console.log('D', messageFrom, 'User disconnected');
      break;
    case types.MESSAGE:
      console.log('M', messageFrom, message || 'Unknown message');
      break;
    case types.INITIAL:
      console.log('W', messageFrom, message);
      break;
    default:
      console.log('Invalid type');
      break;
  }
  rl.prompt();
});

clients.on('end', () => {
  console.log('disconnected from server');
});

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'exit':
      rl.close();
      break;
    default:
      clients.write(line.trim());
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('You were disconnected!');
  clients.end();
  process.exit(0);
});
