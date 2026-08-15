import nodemailer from 'nodemailer';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  let transporter;
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development fallback using Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'RepoLens AI <noreply@repolens.ai>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  if (!process.env.EMAIL_HOST) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};
