import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: 'E:/campus_fix/server/.env' });

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_PASS;

console.log('Testing Nodemailer with user:', user);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

async function main() {
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');

    const info = await transporter.sendMail({
      from: `"CampusFix Alert System" <${user}>`,
      to: 'mattasaiswaroop5641@gmail.com, campusfix5641@gmail.com',
      subject: '🚀 [CAMPUSFIX] Automated Maintenance Dispatch System Live!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #2563eb; color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0;">CAMPUSFIX Dispatch Active</h2>
          </div>
          <p>Hello Administrator,</p>
          <p>This is a live test confirming that your <strong>CampusFix Smart Facility Alert System</strong> is fully operational with Gmail SMTP.</p>
          <p>When a campus issue is submitted by a student or faculty, detailed diagnostic alerts and photo proof will be delivered directly to your inbox.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Dispatched to mattasaiswaroop5641@gmail.com and campusfix5641@gmail.com</p>
        </div>
      `
    });

    console.log('✅ Real test email successfully sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending test email:', err.message);
  }
}

main();
