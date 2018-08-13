/* import '../sass/style.scss'; */

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './typeAhead';
import makeMap from './modules/map';
import ajaxStar from './modules/star';

autocomplete($('#address'), $('#lng'), $('#lat'));

typeAhead($('.search'));

makeMap($('#map'));

const starForms = $$('form.star');
starForms.on('submit', ajaxStar);
