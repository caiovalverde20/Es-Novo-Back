const nodemailer = require('nodemailer');

require('dotenv/config')

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_SENDER_HOST,
  port: process.env.MAIL_SENDER_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_SENDER_USER,
    pass: process.env.MAIL_SENDER_PASS
  },
  tls: {
    rejectUnauthorized: false
  }

});

function createMail(userMail, subject, text) {
  const mailOptions = {
    from: process.env.MAIL_SENDER_EMAIL,
    to: userMail,
    subject: subject,
    text: text,
    html: '<strong>' + text + '</strong>'
  };

  return mailOptions
}

module.exports = {
  async sendMail(userMail, subject, text) {
    
    const mail = createMail(userMail, subject, text);
    
    try {
      await transporter.sendMail(mail);
      return { status: 200, message: "Email enviado, por favor cheque a caixa de SPAM!"};

    } catch (err) {
      return { status: 500, message: err.message};
    }
  }
}