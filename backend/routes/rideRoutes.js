const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, rideController.addRide);
router.get('/', auth, rideController.getHistory);
router.get('/dashboard', auth, rideController.getDashboard);

module.exports = router;
