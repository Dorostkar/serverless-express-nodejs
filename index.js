const AWS = require('aws-sdk');
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const USER_TABLE = process.env.USER_TABLE;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
app.use(bodyParser.json({ strict: false }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Get User endpoint
app.get('/users/:userId', function(req, res) {
  const params = {
    TableName: 'users-table-dev',
    Key: {
      userId: req.params.userId
    }
  };

  dynamoDB.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get user' });
    }
    if (result.Item) {
      const { userId, name } = result.Item;
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});
// Create User endpoint
app.post('/users', (req, res) => {
  const { userId, name } = req.body;

  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }
  const params = {
    TableName: 'users-table-dev',
    Item: {
      userId: userId,
      name: name
    }
  };

  dynamoDB.put(params, error => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' + error });
    }
    res.json({ userId, name });
  });
});

module.exports.handler = serverless(app);
