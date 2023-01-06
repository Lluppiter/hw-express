const sgMail = require("@sendgrid/mail");

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const email = {
    ...data,
    from: "petya1411@gmail.com",
  };
  await sgMail
    .send(email)
    .then(() => console.log("email is sent"))
    .catch((error) => console.log(error.message));
  return true;
};

// module.exports = sendEmail;
