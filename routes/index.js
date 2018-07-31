const express = require('express');
const router = express.Router();
// load controllers
const repairController = require('../controllers/repairController');
const technicianController = require('../controllers/technicianController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', (req, res) => {
  res.render('layout');
}); // will go and run the homePage method

router.get(
  '/addForm',
  /* authController.isLoggedIn,*/ repairController.addRepairForm
);
router.post(
  '/addRepair',
  repairController.upload,
  catchErrors(repairController.resize),
  catchErrors(repairController.createRepair)
);

router.get('/repairs', catchErrors(repairController.getAllRepairs));
router.get('/repairs/page/:page', catchErrors(repairController.getAllRepairs));
router.get('/repair/:slug', catchErrors(repairController.getRepairBySlug));

/* Register new User */
router.get('/register', technicianController.registerForm);
router.post(
  '/register',
  technicianController.validateRegister,
  technicianController.registerTechnician,
  authController.login
);

/* API Endpoints */
/* 
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/hearts', catchErrors(storeController.heartStore)); 
*/

module.exports = router;
