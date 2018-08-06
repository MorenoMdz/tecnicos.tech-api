const express = require('express');
const router = express.Router();
// load controllers
const repairController = require('../controllers/repairController');
const technicianController = require('../controllers/technicianController');
const hwController = require('../controllers/hwController');
const problemController = require('../controllers/problemController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', (req, res) => {
  res.render('layout');
}); // will go and run the homePage method

/* Hardware Route | Perms: Adm/Mod */
router.get('/config', authController.isLoggedIn, hwController.getAllHw);
router.post(
  '/addHw',
  authController.isLoggedIn,
  hwController.upload,
  catchErrors(hwController.resize),
  catchErrors(hwController.addNewHw)
);

router.get(
  '/addForm',
  authController.isLoggedIn,
  repairController.addRepairForm
);

/* Hardware routes */
router.get(
  '/hardware/:slug',
  authController.isLoggedIn,
  catchErrors(hwController.getHwBySlug)
);

router.get(
  '/hardwares',
  authController.isLoggedIn,
  catchErrors(hwController.getHwList)
);

/* Problem routes */
router.get(
  '/problems',
  authController.isLoggedIn,
  catchErrors(problemController.getProblemList)
);

router.get(
  '/addProblem',
  authController.isLoggedIn,
  catchErrors(problemController.addProblem)
);

/* router.post(
  '/findModels',
  authController.isLoggedIn,
  hwController.upload,
  catchErrors(problemController.resize),
  catchErrors(problemController.findModels)
); */

router.post(
  '/addNewProblem',
  authController.isLoggedIn,
  hwController.upload,
  catchErrors(problemController.resize),
  catchErrors(problemController.addNewProblem)
);
router.get(
  '/problem/:slug',
  authController.isLoggedIn,
  hwController.upload,
  catchErrors(problemController.resize),
  catchErrors(problemController.getProblemBySlug)
);

/* Repair routes */
router.get(
  '/repairs',
  authController.isLoggedIn,
  catchErrors(repairController.getAllRepairs)
);
router.get(
  '/repairs/page/:page',
  authController.isLoggedIn,
  catchErrors(repairController.getAllRepairs)
);
router.get(
  '/repair/:slug',
  authController.isLoggedIn,
  catchErrors(repairController.getRepairBySlug)
);
router.post(
  '/addRepair',
  authController.isLoggedIn,
  repairController.upload,
  catchErrors(repairController.resize),
  catchErrors(repairController.createRepair)
);

/* Comment routes */
router.post(
  '/comment/:id',
  authController.isLoggedIn,
  catchErrors(commentController.addComment)
);

/* User routes */
router.get('/register', technicianController.registerForm);
router.post(
  '/register',
  technicianController.validateRegister,
  technicianController.registerTechnician,
  authController.login
);
router.get('/login', technicianController.loginForm);
router.get('/logout', authController.logout);
router.post('/login', authController.login);

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

router.get('/account', authController.isLoggedIn, technicianController.account);
router.post('/account', catchErrors(technicianController.updateAccount));

/* API Endpoints */
/* 
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/hearts', catchErrors(storeController.heartStore)); 
*/

module.exports = router;
