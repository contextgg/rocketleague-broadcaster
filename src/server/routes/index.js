import express from 'express';

const all = {
  nordicgaming: {
    title: 'Nordic Gaming Australia',
    sizes: ['1080p', '1440p'],
  },
};

const routes = () => {
  const router = express.Router();

  /* GET home page. */
  router.get('/', (req, res) => {
    const data = {
      orgs: all,
    };

    res.render('index', data);
  });

  /* GET org landing page. */
  router.get('/:org', (req, res) => {
    const name = req.params.org;
    const org = all[name];
    if (!org) {
      throw new Error('Organisation not found');
    }

    const data = {
      name,
      org,
    };

    res.render('organisation', data);
  });

  /* GET org overlays. */
  router.get('/:org/:size', (req, res) => {
    const name = req.params.org;
    const org = all[name];
    if (!org) {
      throw new Error('Organisation not found');
    }

    const data = {
      size: req.params.size,
      name,
      org,
    };

    res.render('overlays', data);
  });

  /* GET game overlay */
  router.get('/:org/:size/game', (req, res) => {
    const name = req.params.org;
    const org = all[name];
    if (!org) {
      throw new Error('Organisation not found');
    }

    const data = {
      demo: req.query.demo,
      size: req.params.size,
      name,
      org,
      scripts: ['/default/scripts/game.js'],
    };

    res.render('game', data);
  });

  return router;
};

export default routes;
