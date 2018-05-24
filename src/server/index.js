import express from 'express';
import favicon from 'serve-favicon';
import logger from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import routes from './routes';
import debugWrapper from 'debug';
import WebSocket from 'ws';
import fs from 'fs';
import fse from 'fs-extra';

const debug = debugWrapper('express-app:server');

let server = null;

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

export default function() {
  const app = express();

  //view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "hbs");

  //uncomment after placing your favicon in /public
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", routes());

  //catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error("Not Found");

    err.status = 404;
    next(err);
  });

  //development error handler
  //will print stacktrace
  if (app.get("env") === "development") {
    app.use(function(err, req, res) {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err
      });
    });
  }

  //production error handler
  //no stacktraces leaked to user
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {}
    });
  });


  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  server = http.createServer(app);

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws: WebSocket) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
      //log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });
  });

  setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      if (!ws.isAlive) return ws.terminate();

      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 10000);

  var filePath = path.join(__dirname, '..', 'data', 'game.json');
  fse.ensureFileSync(filePath);

  fs.watch(filePath, function(event, filename) {
    if(!filename) {
      return
    }

    var file = fs.readFileSync(filePath);
    console.log('File content at : ' + new Date() + ' is \n' + file);
  });

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  console.log('Server running on port ' + port);
}
