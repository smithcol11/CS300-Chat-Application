const request = require('supertest')
const http = require('http');
require("dotenv").config();

let httpServer;
let token=process.env.TOKEN;

/**
 * Setup HTTP servers
 */
beforeAll((done) => {
  httpServer = http.createServer().listen(3000);
  done();
});

/**
 *  Cleanup HTTP servers
 */
afterAll((done) => {
  httpServer.close();
  done();
});

describe('Test post Endpoints', () => {
  it('should fail because of authorization', async () => {
    const res = await request(httpServer)
      .post('/login')
      .send({
        user: 'cs300',
      })
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toBe('Not authorized user')
  })
})
 
describe('Test get Endpoints', () => {
  it('should pass and get all chatrooms', async () => {
    request(httpServer).get('/login').set('Authorization', `Bearer ${token}`).then((res) =>{
        expect(res.statusCode).toEqual(200)
        expect(res.body.message).toBeTruthy()
      })
  })
})