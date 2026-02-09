/**
 * Email Notification Service
 * Frontend service for triggering email notifications via the API
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export type EmailTemplate = 'order_confirmation' | 'payment_receipt' | 'delivery_update' | 'message_notification';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

class EmailService {
  private async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Email send failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async sendOrderConfirmation(
    email: string,
    customerName: string,
    orderId: string,
    items: Array<{ name: string; quantity: number; total: number }>,
    total: number,
    deliveryDate: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order Confirmed - #${orderId}`,
      template: 'order_confirmation',
      data: {
        customerName,
        orderId,
        items,
        total,
        deliveryDate,
        trackingUrl: `https://makefarmhub.vercel.app/orders/${orderId}`,
      },
    });
  }

  async sendPaymentReceipt(
    email: string,
    customerName: string,
    transactionId: string,
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Payment Receipt - ${transactionId}`,
      template: 'payment_receipt',
      data: {
        customerName,
        transactionId,
        amount,
        paymentMethod,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        receiptUrl: `https://makefarmhub.vercel.app/wallet`,
      },
    });
  }

  async sendDeliveryUpdate(
    email: string,
    customerName: string,
    orderId: string,
    status: string,
    message: string,
    trackingNumber?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Delivery Update - Order #${orderId}`,
      template: 'delivery_update',
      data: {
        customerName,
        orderId,
        status,
        message,
        trackingNumber,
        trackingUrl: `https://makefarmhub.vercel.app/orders/${orderId}`,
      },
    });
  }

  async sendMessageNotification(
    email: string,
    recipientName: string,
    senderName: string,
    messagePreview: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `New message from ${senderName}`,
      template: 'message_notification',
      data: {
        recipientName,
        senderName,
        messagePreview: messagePreview.substring(0, 200),
        messageUrl: `https://makefarmhub.vercel.app/messages`,
      },
    });
  }
}

export const emailService = new EmailService();
export default emailService;
