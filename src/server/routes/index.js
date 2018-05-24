import express from 'express';

export default function() {
  var router = express.Router();

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  router.get('/game', function(req, res, next) {
    var game = {
      'bestOf': 7,
      teamA: {
        name: 'Nordic Gaming',
        setScore: 2
      },
      teamB: {
        name: 'Vapour eSports',
        setScore: 1
      }
    };


    var data = {
      title: `Game ${game.teamA.name} vs ${game.teamB.name} `,
      size: '2k',
      game,
    };

    res.render('game', data);
  });

  return router;
};
