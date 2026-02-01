/**
 * Secure Payment Service
 * Handles payment logic with smart rules for when secure payment is mandatory vs optional
 */

export interface PaymentConfig {
  requireSecurePayment: boolean;
  reason: string;
  allowDirectPayment: boolean;
  directPaymentWarning?: string;
}

export interface OrderDetails {
  category: 'crops' | 'livestock' | 'equipment' | 'services';
  totalAmount: number;
  quantity: number;
  sellerId: string;
  buyerId: string;
  deliveryDistance?: number; // in km
  sellerTransactionCount?: number;
  buyerTransactionCount?: number;
  sellerJoinDate?: Date;
  buyerJoinDate?: Date;
}

// Thresholds for payment rules
const PAYMENT_THRESHOLDS = {
  HIGH_VALUE_AMOUNT: 500, // Orders above $500 require secure payment
  LOW_VALUE_CROP_AMOUNT: 100, // Crops below $100 can use direct payment
  LONG_DISTANCE_KM: 100, // Deliveries over 100km require secure payment
  NEW_USER_TRANSACTION_COUNT: 5, // Users with less than 5 transactions are "new"
  NEW_USER_DAYS: 30, // Users joined within 30 days are "new"
};

class SecurePaymentService {
  /**
   * Determine payment requirements based on order details
   */
  getPaymentRequirements(order: OrderDetails): PaymentConfig {
    const reasons: string[] = [];
    let requireSecurePayment = false;
    let allowDirectPayment = true;

    // Rule 1: Livestock ALWAYS requires secure payment
    if (order.category === 'livestock') {
      requireSecurePayment = true;
      allowDirectPayment = false;
      reasons.push('Livestock transactions require secure payment for buyer and seller protection');
    }

    // Rule 2: High value orders require secure payment
    if (order.totalAmount >= PAYMENT_THRESHOLDS.HIGH_VALUE_AMOUNT) {
      requireSecurePayment = true;
      allowDirectPayment = false;
      reasons.push(`Orders above $${PAYMENT_THRESHOLDS.HIGH_VALUE_AMOUNT} require secure payment`);
    }

    // Rule 3: Long distance deliveries require secure payment
    if (order.deliveryDistance && order.deliveryDistance >= PAYMENT_THRESHOLDS.LONG_DISTANCE_KM) {
      requireSecurePayment = true;
      allowDirectPayment = false;
      reasons.push(`Deliveries over ${PAYMENT_THRESHOLDS.LONG_DISTANCE_KM}km require secure payment`);
    }

    // Rule 4: New sellers require secure payment
    if (this.isNewUser(order.sellerTransactionCount, order.sellerJoinDate)) {
      requireSecurePayment = true;
      allowDirectPayment = false;
      reasons.push('New sellers require secure payment until they build trust');
    }

    // Rule 5: New buyers require secure payment
    if (this.isNewUser(order.buyerTransactionCount, order.buyerJoinDate)) {
      requireSecurePayment = true;
      allowDirectPayment = false;
      reasons.push('New buyers require secure payment for seller protection');
    }

    // Rule 6: Low value crops CAN use direct payment (if no other rules apply)
    if (
      order.category === 'crops' &&
      order.totalAmount < PAYMENT_THRESHOLDS.LOW_VALUE_CROP_AMOUNT &&
      !requireSecurePayment
    ) {
      allowDirectPayment = true;
      reasons.push('Low value crop orders can use direct payment (optional)');
    }

    // If secure payment is required, don't allow direct payment
    if (requireSecurePayment) {
      allowDirectPayment = false;
    }

    return {
      requireSecurePayment,
      reason: reasons.join('. '),
      allowDirectPayment,
      directPaymentWarning: allowDirectPayment
        ? 'Direct payment is not protected. We recommend using Secure Payment for your safety.'
        : undefined,
    };
  }

  /**
   * Check if user is considered "new"
   */
  private isNewUser(transactionCount?: number, joinDate?: Date): boolean {
    // Check transaction count
    if (transactionCount !== undefined && transactionCount < PAYMENT_THRESHOLDS.NEW_USER_TRANSACTION_COUNT) {
      return true;
    }

    // Check join date
    if (joinDate) {
      const daysSinceJoin = Math.floor(
        (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceJoin < PAYMENT_THRESHOLDS.NEW_USER_DAYS) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get payment method options based on requirements
   */
  getPaymentOptions(config: PaymentConfig): {
    id: string;
    name: string;
    description: string;
    recommended: boolean;
    available: boolean;
    icon: string;
  }[] {
    const options = [
      {
        id: 'secure_payment',
        name: 'Secure Payment',
        description: 'Your money is held safely until you confirm delivery. Full buyer and seller protection.',
        recommended: true,
        available: true,
        icon: 'shield',
      },
    ];

    if (config.allowDirectPayment) {
      options.push({
        id: 'direct_payment',
        name: 'Direct Payment',
        description: 'Pay the seller directly. No protection - only for trusted sellers.',
        recommended: false,
        available: true,
        icon: 'credit-card',
      });
    }

    return options;
  }

  /**
   * Get secure payment benefits for display
   */
  getSecurePaymentBenefits(): { icon: string; title: string; description: string }[] {
    return [
      {
        icon: 'shield',
        title: 'Money Protection',
        description: 'Your payment is held securely until you confirm delivery',
      },
      {
        icon: 'check-circle',
        title: 'Quality Guarantee',
        description: 'Inspect goods before releasing payment to seller',
      },
      {
        icon: 'alert-triangle',
        title: 'Dispute Resolution',
        description: 'Get help if something goes wrong with your order',
      },
      {
        icon: 'refresh-cw',
        title: 'Easy Refunds',
        description: 'Get your money back if the order is not as described',
      },
    ];
  }

  /**
   * Calculate fees for secure payment
   */
  calculateFees(amount: number): {
    subtotal: number;
    platformFee: number;
    total: number;
    sellerReceives: number;
  } {
    const platformFeePercent = 0.05; // 5%
    const platformFee = amount * platformFeePercent;
    const total = amount + platformFee;
    const sellerReceives = amount;

    return {
      subtotal: amount,
      platformFee,
      total,
      sellerReceives,
    };
  }

  /**
   * Get payment status display info
   */
  getPaymentStatusInfo(status: string): {
    label: string;
    color: string;
    description: string;
  } {
    const statusMap: Record<string, { label: string; color: string; description: string }> = {
      pending: {
        label: 'Awaiting Payment',
        color: 'orange',
        description: 'Waiting for buyer to complete payment',
      },
      paid: {
        label: 'Payment Received',
        color: 'blue',
        description: 'Payment held in secure payment - awaiting delivery',
      },
      held: {
        label: 'Held Securely',
        color: 'blue',
        description: 'Funds are protected until delivery is confirmed',
      },
      released: {
        label: 'Payment Released',
        color: 'green',
        description: 'Payment has been released to the seller',
      },
      refunded: {
        label: 'Refunded',
        color: 'gray',
        description: 'Payment has been refunded to the buyer',
      },
      disputed: {
        label: 'Under Dispute',
        color: 'red',
        description: 'Payment is on hold pending dispute resolution',
      },
    };

    return statusMap[status] || statusMap.pending;
  }

  /**
   * Get timeline for secure payment process
   */
  getSecurePaymentTimeline(): { step: number; title: string; description: string }[] {
    return [
      {
        step: 1,
        title: 'Place Order & Pay',
        description: 'Your payment is held securely by MAKEFARMHUB',
      },
      {
        step: 2,
        title: 'Seller Ships Order',
        description: 'Seller prepares and ships your order',
      },
      {
        step: 3,
        title: 'Receive & Inspect',
        description: 'Check your order when it arrives',
      },
      {
        step: 4,
        title: 'Confirm Delivery',
        description: 'Confirm receipt and payment is released to seller',
      },
    ];
  }
}

export const securePaymentService = new SecurePaymentService();
export default securePaymentService;
