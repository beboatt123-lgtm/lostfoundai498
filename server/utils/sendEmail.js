const { Resend } = require('resend');

const sendEmail = async (options) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: 'LostFound <onboarding@resend.dev>', // Default for unverified domains
        to: options.email,
        subject: options.subject,
        html: options.html,
    });

    if (error) {
        console.error('Resend Error:', error);
        throw new Error('Failed to send email via Resend');
    }

    return data;
};

module.exports = sendEmail;
