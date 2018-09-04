const fs = require('fs');

exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = obj => JSON.stringify(obj, null, 2);

// inserting an SVG
exports.icon = name => fs.readFileSync(`./public/images/icons/${name}.svg`);

exports.siteName = `Técnicos Tech`;

exports.menu = [
  { slug: '/hardwares', title: 'Aparelhos' },
  { slug: '/techs', title: 'Técnicos' },
];
