const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

// create a 'transport'
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined;
};

// To reuse it later just pass a new filename, a new subject and a new user to send it to.
exports.send = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Tecnicos Tech Admin <administrador@tecnicos.tech>',
    to: options.to,
    subject: options.subject,
    html: html,
    text: text,
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
