import express from 'express';
import hbs from 'hbs';
import favicon from 'serve-favicon';
import logger from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import debugWrapper from 'debug';
import WebSocket from 'ws';
import fs from 'fs';
import fse from 'fs-extra';

import routes from './routes';

const debug = debugWrapper('express-app:server');

let server = null;

function normalizePort(val) {
  const port = parseInt(val, 10);

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

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug('requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug('Port/Pipe is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

export default function () {
  const filePath = path.join(__dirname, '..', 'data', 'game.json');
  fse.ensureFileSync(filePath);
  debug(filePath);

  hbs.registerHelper('inc', value => parseInt(value, 0) + 1);

  const app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');


  // uncomment after placing your favicon in /public
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', routes());

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');

    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });

  const port = normalizePort(process.env.PORT || '3200');
  app.set('port', port);

  server = http.createServer(app);

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // connection is up, let's add a simple simple event
    ws.on('message', (message) => {
      if (message !== 'game') { return; }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;
        ws.send(data);
      });
    });
  });

  fs.watch(filePath, (event, filename) => {
    if (!filename) {
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      wss.clients.forEach((ws) => {
        ws.send(data);
      });
    });
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(() => {});
      return true;
    });
  }, 10000);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  debug(`Server running on port ${port}`);
}
