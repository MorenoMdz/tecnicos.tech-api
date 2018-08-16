/* import '../sass/style.scss'; */
//const autocomplete = require('./autocomplete');

const { $, $$ } = require('./bling');
const typeAhead = require('./typeAhead');

console.log($('.search'));
typeAhead($('.search'));

console.log('changed');

//autocomplete($('#address'), $('#lng'), $('#lat'));

//makeMap($('#map'));

/* const starForms = $$('form.star');
starForms.on('submit', ajaxStar); */
