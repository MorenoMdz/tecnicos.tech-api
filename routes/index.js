const express = require('express');
const router = express.Router();
// load controllers
const repairController = require('../controllers/repairController');
const technicianController = require('../controllers/technicianController');
const hwController = require('../controllers/hwController');
const problemController = require('../controllers/problemController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const postController = require('../controllers/postController');
const feedbackController = require('../controllers/feedbackController');
const homeController = require('../controllers/homeController');
const admController = require('../controllers/admController');
const aws = require('../handlers/aws');
const { catchErrors } = require('../handlers/errorHandlers');

/* Home */
router.get('/', homeController.homeDisplay, postController.getAllPosts);
router.get(
  '/posts/page/:page',
  homeController.homeDisplay,
  postController.getAllPosts
);
router.post(
  '/feedbackPost',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(feedbackController.addFeedback)
);

/* Adm */
router.get(
  '/config',
  authController.isLoggedIn,
  authController.isMod,
  authController.isActive,
  catchErrors(hwController.getHwList),
  catchErrors(feedbackController.getAllFeedbacks),
  catchErrors(technicianController.getInactiveTechList),
  admController.configPanel
);

router.post(
  '/addHw',
  authController.isLoggedIn,
  authController.isMod,
  authController.isActive,
  aws.upload,
  catchErrors(hwController.addNewHw)
);

router.post(
  '/updateHw',
  authController.isLoggedIn,
  authController.isMod,
  authController.isActive,
  aws.upload,
  catchErrors(hwController.updateHw)
);

/* Hardware routes */
router.get(
  '/hardware/:slug',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(hwController.getHwBySlug)
);

router.get(
  '/hardwares',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(hwController.getAllHw)
);

router.get(
  '/hardwares/page/:page',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(hwController.getAllHw)
);

/* Problem routes */
router.get(
  '/problems',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(problemController.getProblemList)
);

router.get(
  '/problems/page/:page',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(problemController.getProblemList)
);

router.post(
  '/addNewProblem',
  authController.isLoggedIn,
  authController.isActive,
  aws.upload,
  catchErrors(problemController.addNewProblem)
);

router.get(
  '/problem/:slug',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(problemController.getProblemBySlug)
);

/* Repair routes */
router.get(
  '/repairs',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(repairController.getAllRepairs)
);
router.get(
  '/repairs/page/:page',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(repairController.getAllRepairs)
);
router.get(
  '/repair/:slug',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(repairController.getRepairBySlug)
);
router.post(
  '/addRepair',
  authController.isLoggedIn,
  authController.isActive,
  aws.upload,
  catchErrors(repairController.createRepair)
);

/* Comment routes */
router.post(
  '/comment/:id',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(commentController.addComment)
);

/* Posts */
router.post(
  '/addNewPost',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(postController.addPost)
);
router.get(
  '/posts/:id',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(postController.getPostById)
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

router.get(
  '/account',
  authController.isLoggedIn,
  authController.isActive,
  technicianController.account
);
router.post(
  '/account',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(technicianController.updateAccount)
);

/* Tech List */
router.get('/techs', catchErrors(technicianController.getTechList));
router.get('/tech/:id', catchErrors(technicianController.getTech));

/* API Endpoints */
router.get('/api/search', catchErrors(problemController.searchProblem));
router.post(
  '/api/repairs/:id/star',
  authController.isLoggedIn,
  authController.isActive,
  catchErrors(repairController.starsRepair)
);
router.post(
  '/api/tech/:id/activate',
  authController.isLoggedIn,
  authController.isActive,
  authController.isMod,
  catchErrors(technicianController.activateUser)
);
router.post(
  '/api/tech/:id/deactivate',
  authController.isLoggedIn,
  authController.isActive,
  authController.isMod,
  catchErrors(technicianController.deactivateUser)
);

router.post(
  '/api/feedback/:id/updateStatus',
  authController.isLoggedIn,
  authController.isActive,
  authController.isMod,
  catchErrors(feedbackController.updateFeedbackStatus)
);

module.exports = router;
