require("dotenv").config();
const { MongoClient } = require('mongodb');

describe('test mongodb', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should insert a new user and then delete it', async () => {
    const users = db.collection('users');

    //insert a mock user
    const mockUser = {name: 'John'};
    await users.insertOne(mockUser);

    //check if already inserted
    const insertedUser = await users.findOne({name: 'John'});
    expect(insertedUser).toEqual(mockUser);

    //delete the mock user
    const deleteUser = await users.deleteOne({name: 'John'});
    expect(deleteUser).toBeTruthy();
  });
});