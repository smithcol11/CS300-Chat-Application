const getFirstUserName = require('./mockAPI');
const axios = require('axios');

jest.mock('axios');

it('returns the name of the first user', async () => {
  axios.get.mockResolvedValue({
    data: [
      {
        userId: 1,
        name: 'root',
        password: 'Fake pwd'
      },
      {
        userId: 2,
        id: 'root2',
        password: 'Fake pwd'
      }
    ]
  });

  const name = await getFirstUserName();
  expect(name).toEqual('root');
});