var nodemailer = require('nodemailer');
require('dotenv').config();
var transporter = null;
class EmailService {

    constructor() {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    sendEmail(options) {
        transporter.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });
    }
}
module.exports = EmailService