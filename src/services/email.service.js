require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});




// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,name) {
    const subject = 'Welcome to backend-ledgers!';
    const text = `Hi ${name},\n\nWelcome to backend-ledgers! We're excited to have you on board.\n\nBest regards,\nThe backend-ledgers team`;
    const html = `<p>Hi ${name},</p><p>Welcome to backend-ledgers! We're excited to have you on board.</p><p>Best regards,<br>The backend-ledgers team</br></p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail,userName,amount,toAccount,balance) {
    const subject = 'Transaction Alert';
    const text = `Hi ${userName},\n\nYour transaction of amount ${amount} to account ${toAccount} has been completed. Your current balance is ${balance}`;
    const html = `<p>Hi ${userName},</p><p>Your transaction of amount ${amount} to account ${toAccount} has been completed. Your current balance is ${balance}</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail,userName,amount,toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hi ${userName},\n\nYour transaction of amount ${amount} to account ${toAccount} has failed due to insufficient balance. Your current balance is ${balance}`;
    const html = `<p>Hi ${userName},</p><p>Your transaction of amount ${amount} to account ${toAccount} has failed due to insufficient balance. Your current balance is ${balance}</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail ,sendTransactionFailureEmail};