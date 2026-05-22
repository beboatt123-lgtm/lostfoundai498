const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `Lost & Found <${process.env.EMAIL_USER}>`,
        to: options.email || options.to,
        subject: options.subject,
        html: options.html,
    };

    if (options.message || options.text) {
        mailOptions.text = options.message || options.text;
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw new Error(`Email Send Error: ${error.message}`);
    }
};

module.exports = sendEmail;
