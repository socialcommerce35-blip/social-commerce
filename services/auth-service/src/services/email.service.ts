// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_SERVICE_USER,
//     pass: process.env.EMAIL_SERVICE_PASS
//   }
// });

// export const sendWelcomeEmail = async (to: string, name?: string) => {
//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_SERVICE_USER,
//     to,
//     subject: 'Welcome!',
//     text: `Hello ${name || ''}, welcome to our app!`
//   });
//   return info;
// };
