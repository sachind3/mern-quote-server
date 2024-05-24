const nodemailer = require("nodemailer");

const sendEmail = async (to, url, subject) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.APP_EMAIL_ADDRESS,
      to: to,
      subject: subject,
      html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the QuoteHub.</h2>
        <p>Congratulations! You're almost set to start using FULLAUTH.
            Just click the button below to validate your email address.
        </p>
        <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${subject}</a>
        <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        <div>${url}</div>
        </div>
      `,
    };

    // let mailOptions = await transporter.sendMail({
    //   from: process.env.APP_EMAIL_ADDRESS,
    //   to: to,
    //   subject: subject,
    //   html: `
    //   <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
    //   <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the QuoteHub.</h2>
    //   <p>Congratulations! You're almost set to start using FULLAUTH.
    //       Just click the button below to validate your email address.
    //   </p>
    //   <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${subject}</a>
    //   <p>If the button doesn't work for any reason, you can also click on the link below:</p>
    //   <div>${url}</div>
    //   </div>
    // `,
    // });
    // transporter.sendMail(mailOptions, (err, infor) => {
    //   if (err) return err;
    //   return infor;
    // });
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.log(`Error from sending email: ${error.message}`);
    return error;
  }
};

module.exports = sendEmail;
