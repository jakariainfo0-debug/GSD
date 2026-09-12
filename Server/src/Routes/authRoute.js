const {
  loginController,
  registrationController,
} = require('../Controllers/authController');

const router = require('express').Router();

router.post('/login', loginController);
router.post('/singup', registrationController);

module.exports = router;
