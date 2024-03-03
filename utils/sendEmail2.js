const { Resend } = require("resend");

// Create a Resend instance with your API key
const resend = new Resend("re_hWcHa7s3_JZpoRjdwYvbj5pyFLzNxws4E");

exports.sendEmails = async function (message) {
  const { data, error } = await resend.emails.send({
    from: `Name <onboarding@resend.dev>`,
    to: `Name <mohamed3laily@gmail.com>`,
    subject: "Password recovery",
    html: `<strong>${message}</strong>`,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
};
