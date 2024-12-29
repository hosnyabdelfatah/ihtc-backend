const nodemailer = require('nodemailer');
const pug = require('pug');
const {convert} = require('html-to-text');
const sgMail = require('@sendgrid/mail');

module.exports = class Email {
    constructor(user, url, message) {
        this.to = user.email;
        this.firstName = user.fname + " " + user.lname;
        this.url = url;
        this.from = process.env.EMAIL_FROM;
        this.message = message;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //     // Sendgrid
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            return nodemailer.createTransport({
                service: 'SendGrid',
                ignoreTLS: true,
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            ignoreTLS: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the IHTC Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }

    async sendResetSuccess() {
        await this.send(
            "resetSuccess",
            "Your password reset success!"
        );
    }
};
