const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');

let socket;
let httpServer;
let ioServer;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  httpServer = http.createServer().listen(5000);
  ioServer = ioBack(httpServer);
  done();
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach((done) => {
  socket = io.connect(`http://localhost:5000`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    done();
  });
});

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

describe('basic socket.io example', () => {
  test('should communicate', (done) => {

    // if server connected
    ioServer.on('connection', (mySocket) => {
        expect(mySocket).toBeDefined();
    });

    //once connected, server emit Hello World, see if client can receive that 
    ioServer.emit('echo', 'Hello World');
    socket.once('echo', (message) => {
      // Check that the message matches
      expect(message).toBe('Hello World');
      done();
    });
  });
  
  test('should communicate with waiting for socket.io handshakes from client', (done) => {
    // Emit something from Client to Server
    socket.emit('examlpe', 'Hello from cs300');
    // Use timeout to wait for socket.io server handshakes
    setTimeout(() => {
      ioServer.once('echo', (message) => {
        // Check that the message matches
        expect(message).toBe('Hello from cs300');
        done();
      });
      done();
    }, 50);
  }); 
});