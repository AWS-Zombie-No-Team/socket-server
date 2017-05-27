const app = require('express')();
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
const server = require('http').Server(app);
const io = require('socket.io')(server);
const R = require('axios');
const bodyParser = require('body-parser')

const config = require('./config');


const connections = {};

server.listen(config.socketPort);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const init = () => {
  const sns = new AWS.SNS();
  var params = {
    Protocol: 'http', /* required */
    TopicArn: 'arn:aws:sns:eu-west-1:505939746198:messages',
    Endpoint: `http://${config.host}:${config.port}/message-notification`
  };
  sns.subscribe(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

init();

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

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

    socket.join(user.id);

  });
});


app.post('/message-notification', function (req, res) {
  console.log(req);
  console.log(req.body);
  console.log(req.params);
  console.log(req.data);
  res.send(true);
});

