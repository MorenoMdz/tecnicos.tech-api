const { $, $$ } = require('./bling');
const typeAhead = require('./typeAhead');
const { loadProgressBar } = require('axios-progress-bar');

typeAhead($('.search'));
loadProgressBar();
