import net from 'net';
import readline from 'readline';

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
  console.log(data.toString());
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
