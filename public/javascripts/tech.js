const { $, $$ } = require('./bling');
const typeAhead = require('./typeAhead');
const { loadProgressBar } = require('axios-progress-bar');

typeAhead($('.search'));
loadProgressBar();

console.log('bundleds');
/* floating button */
/* $('#main').click(function() {
  $('#mini-fab').toggleClass('hidden');
});

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
$.material.init(); */
