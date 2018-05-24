import express from 'express';

export default function() {
  var router = express.Router();

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.get('/game', function(req, res, next) {
    var game = 

    var data = {
      title: `Game ${game.teamA.name} vs ${game.teamB.name} `,
      size: '2k',
      game,
    };

    res.render('game', data);
  });

  return router;
};
