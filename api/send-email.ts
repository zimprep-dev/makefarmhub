import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Email Notification Service
 * Sends transactional emails for orders, payments, and updates
 * 
 * Production options:
 * - SendGrid: https://sendgrid.com/
 * - Mailgun: https://www.mailgun.com/
 * - AWS SES: https://aws.amazon.com/ses/
 * - Resend: https://resend.com/
 */

interface EmailRequest {
  to: string;
  subject: string;
  template: 'order_confirmation' | 'payment_receipt' | 'delivery_update' | 'message_notification';
  data: Record<string, any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, template, data }: EmailRequest = req.body;

    if (!to || !subject || !template) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Generate email content based on template
    const emailContent = generateEmailContent(template, data);

    // In production, use email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to,
    //   from: 'noreply@makefarmhub.com',
    //   subject,
    //   html: emailContent,
    // });

    // Log email for development
    console.log('Email Sent:', {
      to,
      subject,
      template,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      emailId: `email_${Date.now()}`,
    });

  } catch (error: any) {
    console.error('Email Send Error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message 
    });
  }
}

function generateEmailContent(template: string, data: Record<string, any>): string {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; }
      .header { background: #0a6b2b; padding: 30px; text-align: center; }
      .header h1 { color: white; margin: 0; }
      .content { padding: 40px 30px; }
      .footer { background: #f9f9f9; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
      .button { display: inline-block; padding: 12px 30px; background: #0a6b2b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    </style>
  `;

  switch (template) {
    case 'order_confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAKEFARMHUB</h1>
            </div>
            <div class="content">
              <h2>Order Confirmed! 🎉</h2>
              <p>Hi ${data.customerName},</p>
              <p>Thank you for your order. Your order #${data.orderId} has been confirmed.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                ${data.items?.map((item: any) => `
                  <div class="detail-row">
                    <span>${item.name} (x${item.quantity})</span>
                    <strong>$${item.total.toFixed(2)}</strong>
                  </div>
                `).join('') || ''}
                <div class="detail-row" style="border: none; font-size: 18px; margin-top: 15px;">
                  <span>Total</span>
                  <strong>$${data.total.toFixed(2)}</strong>
                </div>
              </div>
              
              <p>Expected delivery: <strong>${data.deliveryDate}</strong></p>
              
              <a href="${data.trackingUrl}" class="button">Track Your Order</a>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Questions? Contact us at <a href="mailto:support@makefarmhub.com">support@makefarmhub.com</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 MAKEFARMHUB. All rights reserved.</p>
              <p>Zimbabwe's Leading Digital Agriculture Marketplace</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'payment_receipt':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAKEFARMHUB</h1>
            </div>
            <div class="content">
              <h2>Payment Received ✅</h2>
              <p>Hi ${data.customerName},</p>
              <p>Your payment of <strong>$${data.amount.toFixed(2)}</strong> has been successfully processed.</p>
              
              <div class="order-details">
                <h3>Payment Details</h3>
                <div class="detail-row">
                  <span>Transaction ID</span>
                  <strong>${data.transactionId}</strong>
                </div>
                <div class="detail-row">
                  <span>Payment Method</span>
                  <strong>${data.paymentMethod}</strong>
                </div>
                <div class="detail-row">
                  <span>Date</span>
                  <strong>${data.date}</strong>
                </div>
                <div class="detail-row" style="border: none; font-size: 18px; margin-top: 15px;">
                  <span>Amount Paid</span>
                  <strong>$${data.amount.toFixed(2)}</strong>
                </div>
              </div>
              
              <a href="${data.receiptUrl}" class="button">Download Receipt</a>
            </div>
            <div class="footer">
              <p>© 2026 MAKEFARMHUB. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'delivery_update':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAKEFARMHUB</h1>
            </div>
            <div class="content">
              <h2>Delivery Update 🚚</h2>
              <p>Hi ${data.customerName},</p>
              <p>Your order #${data.orderId} is <strong>${data.status}</strong>.</p>
              
              <p>${data.message}</p>
              
              ${data.trackingNumber ? `
                <p>Tracking Number: <strong>${data.trackingNumber}</strong></p>
              ` : ''}
              
              <a href="${data.trackingUrl}" class="button">Track Order</a>
            </div>
            <div class="footer">
              <p>© 2026 MAKEFARMHUB. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'message_notification':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAKEFARMHUB</h1>
            </div>
            <div class="content">
              <h2>New Message 💬</h2>
              <p>Hi ${data.recipientName},</p>
              <p>You have a new message from <strong>${data.senderName}</strong>:</p>
              
              <div class="order-details">
                <p style="margin: 0;">${data.messagePreview}</p>
              </div>
              
              <a href="${data.messageUrl}" class="button">View Message</a>
            </div>
            <div class="footer">
              <p>© 2026 MAKEFARMHUB. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return '<p>Email content</p>';
  }
}
