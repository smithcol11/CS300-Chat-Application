const request = require("supertest");
const app = require("./app")
const mongoose = require("mongoose");
require("dotenv").config();
const server = app.listen(3000)

describe("Test the root path", () => {
  
  beforeAll(() => {
    mongoose.connect(process.env.DATABASE);
  });

  test("It should response the GET method", (done) => {
    request(app)
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
    test("It should response the GET method", (done) => {
      request(app)
        .get("/index")
        .then(response => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
    test("It should response the GET method", (done) => {
      request(app)
        .get("/login")
        .then(response => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });
    test("It should response the GET method", (done) => {
      request(app)
        .get("/register")
        .then(response => {
          expect(response.statusCode).toBe(200);
          done();
        });
    });

    afterAll((done) => {
      mongoose.disconnect(done);
    });
});

server.close();