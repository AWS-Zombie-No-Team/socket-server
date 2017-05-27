const app = require('express')();
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
const sns = new AWS.SNS();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const R = require('axios');
const bodyParser = require('body-parser')

const config = require('./config');


const connections = {};

server.listen(config.socketPort);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.text());

const init = () => {
  var params = {
    Protocol: 'http', /* required */
    TopicArn: config.topic,
    Endpoint: `http://${config.host}:${config.port}/message-notification`
  };
  sns.subscribe(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

io.sockets.on('connection', (socket) => {
  const query = socket.request._query;
  return R({
    url: `${config.api}/me`,
    method: 'get',
    headers: { AuthToken: query.token }
  }).then(res => {

    const user = res.data.data;
    console.log('User', user.id, 'connected');
    connections[user.id] = {
      user,
      socket,
    };

    socket.on('disconnect', () => {
      connections[user.id] = null;
      console.log('User', user.id, 'disconnected');
    });


    // {\"compoundkey\":\"Hloya-Jack\",\"msg\":\"Hi you saw zombies\",\"msg_status\":\" received\",\"receiver\":\"Hloya\",\"sender\":\"Jack\",\"source_location\":{\"lat\":50.453844,\"lon\":30.428284},

    socket.on('send-message', (data) => {
      if (user.contacts.indexOf(data.to) !== -1) {
        sns.publish({
          TopicArn: config.topic,
          Message: JSON.stringify({
            compoundkey: [user.id, data.to].sort().join('-'),
            msg: data.message,
            msg_status: 'sent',
            receiver: data.to,
            sender: user.id,
            source_location: data.location,
          })
        }, (err, res) => {
          console.log(err, res);
        });
      }
    });
  });
});


app.post('/message-notification', function (req, res) {
  const message = JSON.parse(req.body.Message);
  const { sender, receiver } = message;

  if (connections[receiver]) {
    connections[receiver].socket.emit('receive-message', message);
  }

  res.send(true);
});

