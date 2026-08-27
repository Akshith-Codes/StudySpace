const express = require('express');
const { getOccupancyOverview, getOccupancyForSpace } = require('../controllers/occupancyController');

const router = express.Router();

router.get('/', getOccupancyOverview);
router.get('/:spaceId', getOccupancyForSpace);

module.exports = router;
