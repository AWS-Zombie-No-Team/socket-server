const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const R = require('axios');
const bodyParser = require('body-parser')

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

const connections = {};

server.listen(9999);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  const query = socket.request._query;
  return R({
    url: 'https://mpnzwe6g7c.execute-api.eu-west-1.amazonaws.com/dev/me',
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
  console.log(req.body, req.params);
  res.send(true);
});

