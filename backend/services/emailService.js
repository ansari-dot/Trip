import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendQuoteEmails = async (quoteData) => {
  const { name, email, whatsappNumber, destination, travelDates, travelers, serviceType, serviceDetails, message } = quoteData;

  // 1. Email to Admin
  const adminMailOptions = {
    from: `"North Paradise Notifications" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Quote Request: ${name} - ${serviceType || "General Trip"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Inquiry Received</h2>
        <p>A new quote request has been submitted through the website.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Client Name:</td><td style="padding: 10px;">${name}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;">${email}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">WhatsApp:</td><td style="padding: 10px;">${whatsappNumber}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Service:</td><td style="padding: 10px;">${serviceType || "General Trip"}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Destination:</td><td style="padding: 10px;">${destination}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Travel Dates:</td><td style="padding: 10px;">${travelDates}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Travelers:</td><td style="padding: 10px;">${travelers}</td></tr>
        </table>

        ${serviceDetails ? `
          <div style="margin-top: 20px; padding: 15px; background: #fff9e6; border: 1px solid #ffe4b3;">
            <h4 style="margin-top: 0;">Service-Specific Details:</h4>
            <ul style="list-style: none; padding: 0;">
              ${Object.entries(serviceDetails).map(([key, value]) => `<li><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 20px;">
          <h4 style="margin-bottom: 5px;">Message:</h4>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-style: italic;">${message || "No message provided."}</p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated notification from your website admin system.</p>
      </div>
    `,
  };

  // 2. Confirmation Email to Client
  const clientMailOptions = {
    from: `"North Paradise Treks & Tours" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `We've Received Your Quote Request - North Paradise`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
        <div style="background-color: #0c1a2c; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; color: #D4AF37; letter-spacing: 2px;">NORTH PARADISE</h1>
          <p style="margin-top: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">Treks & Tours</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: #fff;">
          <h2 style="color: #0c1a2c;">Hello ${name},</h2>
          <p>Thank you for choosing <strong>North Paradise Treks & Tours</strong>. We have successfully received your inquiry for <strong>${serviceType || destination}</strong>.</p>
          
          <p>Our dedicated team of travel experts is already reviewing your requirements. We understand that every journey is unique, and we are committed to crafting the perfect experience for you.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #fcfaf2; border-left: 4px solid #D4AF37;">
            <p style="margin: 0; font-weight: bold;">What happens next?</p>
            <p style="margin: 5px 0 0 0;">One of our consultants will contact you shortly via WhatsApp or Email with a personalized proposal and quote.</p>
          </div>

          <p>In the meantime, feel free to explore more of our <a href="${process.env.CLIENT_URL}/tour-packages" style="color: #D4AF37; text-decoration: none; font-weight: bold;">luxury tour packages</a> or follow our journey on social media.</p>
          
          <p>We look forward to hosting you in the majestic North!</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0; font-weight: bold;">Warm regards,</p>
            <p style="margin: 5px 0 0 0;">The North Paradise Team</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">Airport Road, Gilgit, Pakistan</p>
          </div>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 11px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} North Paradise Treks & Tours. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(clientMailOptions);
    console.log("Quote emails sent successfully");
  } catch (error) {
    console.error("Error sending quote emails:", error);
  }
};
