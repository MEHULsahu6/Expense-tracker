const express = require('express');
const router = express.Router();

const about = require('../controller/static.controller');
const contact = require('../controller/static.controller');

router.get('/about',about.about);
router.get('/contact',contact.contact);

module.exports = router;
