import express from 'express';

export default function() {
  var router = express.Router();

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.get('/game-overlay', function(req, res, next) {
    res.render('game-overlay', { title: 'Game Overlay' });
  });

  return router;
};
