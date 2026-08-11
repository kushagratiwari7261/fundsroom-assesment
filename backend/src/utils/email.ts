import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (to: string, name: string) => {
  try {
    await resend.emails.send({
      from: 'Fundsroom ERP <onboarding@resend.dev>', // resend.dev allows sending to verified emails or for testing
      to: [to],
      subject: 'Welcome to Fundsroom!',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-top: 4px solid #3c8dbc; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid #eeeeee;">
              <h2 style="margin: 0; color: #343a40; font-size: 1.4rem; text-transform: uppercase; letter-spacing: 1px;">Fundsroom ERP System</h2>
            </div>
            <div style="padding: 30px 20px;">
              <h3 style="margin-top: 0; color: #3c8dbc;">Welcome aboard, ${name}!</h3>
              <p style="line-height: 1.6;">Thank you for connecting with us. Your customer profile has been successfully registered in our central ERP database.</p>
              <p style="line-height: 1.6;">Our Sales Team will be in touch shortly to assist you with any initial inquiries or product configurations.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 0.85rem; color: #6c757d;">
              <p style="margin: 0;">This is an automated system message. Please do not reply.</p>
              <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Fundsroom Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendChallanEmail = async (to: string, name: string, challanNumber: string, itemsCount: number) => {
  try {
    await resend.emails.send({
      from: 'Fundsroom ERP <updates@resend.dev>',
      to: [to],
      subject: `[SYSTEM] New Sales Challan Generated - ${challanNumber}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-top: 4px solid #f39c12; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid #eeeeee; display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin: 0; color: #343a40; font-size: 1.4rem; text-transform: uppercase; letter-spacing: 1px;">Fundsroom ERP</h2>
              <span style="background-color: #f39c12; color: white; padding: 4px 8px; border-radius: 3px; font-size: 0.8rem; font-weight: bold;">SALES MEMO</span>
            </div>
            <div style="padding: 30px 20px;">
              <h3 style="margin-top: 0; color: #343a40;">Hello ${name},</h3>
              <p style="line-height: 1.6;">A new Sales Challan has been generated for your account. Please find the summary details below:</p>
              
              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d; font-weight: bold; width: 40%;">Challan Reference:</td>
                    <td style="padding: 8px 0; color: #343a40; font-weight: bold;">${challanNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Total Line Items:</td>
                    <td style="padding: 8px 0; color: #343a40;">${itemsCount} Item(s)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Date Generated:</td>
                    <td style="padding: 8px 0; color: #343a40;">${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="line-height: 1.6;">Our logistics and warehouse team will process this order shortly. A detailed PDF invoice will follow upon final confirmation.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 0.85rem; color: #6c757d;">
              <p style="margin: 0;">This is an automated system message. Please do not reply.</p>
              <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Fundsroom Technologies. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`Challan email sent to ${to}`);
  } catch (error) {
    console.error('Error sending challan email:', error);
  }
};
