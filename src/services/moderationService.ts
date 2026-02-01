/**
 * Content Moderation & Fraud Detection Service
 * Handles content filtering, user verification, and fraud prevention
 */

export interface ModerationFlag {
  id: string;
  contentId: string;
  contentType: 'listing' | 'review' | 'message' | 'profile';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  action?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
}

export interface FraudAlert {
  id: string;
  userId: string;
  type: 'suspicious_activity' | 'multiple_accounts' | 'fake_reviews' | 'price_manipulation' | 'payment_fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  riskScore: number; // 0-100
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ContentFilter {
  bannedWords: string[];
  suspiciousPatterns: RegExp[];
  spamPatterns: RegExp[];
}

export interface UserVerification {
  userId: string;
  verificationType: 'email' | 'phone' | 'id_document' | 'business_license' | 'address';
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  documents?: string[];
  notes?: string;
}

class ModerationService {
  private contentFilter: ContentFilter;

  constructor() {
    this.contentFilter = {
      bannedWords: [
        'scam', 'fraud', 'fake', 'counterfeit', 'stolen',
        // Add more banned words
      ],
      suspiciousPatterns: [
        /\b(100%|guaranteed|risk-free|limited time|act now)\b/gi,
        /\b(wire transfer|western union|moneygram)\b/gi,
        /\b(send money|pay upfront|advance payment)\b/gi,
      ],
      spamPatterns: [
        /(.)\1{10,}/g, // Repeated characters
        /[A-Z]{10,}/g, // All caps
        /https?:\/\/[^\s]+/gi, // Multiple URLs
      ],
    };
  }

  /**
   * Moderate content (listings, reviews, messages)
   */
  moderateContent(content: string, contentType: string): {
    approved: boolean;
    flags: string[];
    riskScore: number;
  } {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for banned words
    const lowerContent = content.toLowerCase();
    this.contentFilter.bannedWords.forEach(word => {
      if (lowerContent.includes(word)) {
        flags.push(`Contains banned word: ${word}`);
        riskScore += 20;
      }
    });

    // Check for suspicious patterns
    this.contentFilter.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        flags.push(`Suspicious pattern detected (${index + 1})`);
        riskScore += 15;
      }
    });

    // Check for spam patterns
    this.contentFilter.spamPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        flags.push(`Spam pattern detected (${index + 1})`);
        riskScore += 10;
      }
    });

    // Check content length
    if (content.length < 10) {
      flags.push('Content too short');
      riskScore += 5;
    }

    const approved = riskScore < 30; // Threshold for auto-approval

    return { approved, flags, riskScore };
  }

  /**
   * Flag content for review
   */
  flagContent(
    contentId: string,
    contentType: 'listing' | 'review' | 'message' | 'profile',
    reason: string,
    reportedBy: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ModerationFlag {
    const flag: ModerationFlag = {
      id: this.generateId(),
      contentId,
      contentType,
      reason,
      severity,
      reportedBy,
      status: 'pending',
      createdAt: new Date(),
    };

    // Save to storage
    this.saveModerationFlag(flag);

    return flag;
  }

  /**
   * Detect fraud patterns
   */
  detectFraud(userId: string, activityData: {
    recentTransactions: number;
    accountAge: number; // days
    failedPayments: number;
    suspiciousLogins: number;
    reportCount: number;
    priceChanges: number;
    reviewsGiven: number;
    reviewsReceived: number;
  }): FraudAlert | null {
    const indicators: string[] = [];
    let riskScore = 0;

    // New account with high activity
    if (activityData.accountAge < 7 && activityData.recentTransactions > 10) {
      indicators.push('New account with unusually high activity');
      riskScore += 25;
    }

    // Multiple failed payments
    if (activityData.failedPayments > 3) {
      indicators.push('Multiple failed payment attempts');
      riskScore += 20;
    }

    // Suspicious login patterns
    if (activityData.suspiciousLogins > 2) {
      indicators.push('Suspicious login activity detected');
      riskScore += 15;
    }

    // High report count
    if (activityData.reportCount > 5) {
      indicators.push('Multiple user reports');
      riskScore += 30;
    }

    // Frequent price changes (possible manipulation)
    if (activityData.priceChanges > 10) {
      indicators.push('Frequent price changes detected');
      riskScore += 15;
    }

    // Suspicious review patterns
    const reviewRatio = activityData.reviewsGiven / Math.max(activityData.reviewsReceived, 1);
    if (reviewRatio > 5) {
      indicators.push('Unusual review activity pattern');
      riskScore += 20;
    }

    // Create fraud alert if risk score is high
    if (riskScore >= 40) {
      const alert: FraudAlert = {
        id: this.generateId(),
        userId,
        type: this.determineFraudType(indicators),
        severity: this.determineSeverity(riskScore),
        description: indicators.join('; '),
        indicators,
        riskScore,
        status: 'active',
        createdAt: new Date(),
      };

      this.saveFraudAlert(alert);
      return alert;
    }

    return null;
  }

  /**
   * Verify user identity
   */
  async verifyUser(
    userId: string,
    verificationType: UserVerification['verificationType'],
    documents?: string[]
  ): Promise<UserVerification> {
    const verification: UserVerification = {
      userId,
      verificationType,
      status: 'pending',
      submittedAt: new Date(),
      documents,
    };

    // In production, this would trigger a verification workflow
    // For now, auto-verify after delay
    setTimeout(() => {
      verification.status = 'verified';
      verification.verifiedAt = new Date();
      this.saveVerification(verification);
    }, 5000);

    return verification;
  }

  /**
   * Check for duplicate accounts
   */
  detectDuplicateAccounts(
    userId: string,
    email: string,
    phone: string,
    ipAddress: string
  ): { isDuplicate: boolean; matchedUsers: string[] } {
    // In production, check against database
    // For now, simulate with localStorage
    const users = this.getAllUsers();
    const matchedUsers: string[] = [];

    users.forEach(user => {
      if (user.id === userId) return;

      let matches = 0;
      if (user.email === email) matches++;
      if (user.phone === phone) matches++;
      if (user.lastIpAddress === ipAddress) matches++;

      if (matches >= 2) {
        matchedUsers.push(user.id);
      }
    });

    return {
      isDuplicate: matchedUsers.length > 0,
      matchedUsers,
    };
  }

  /**
   * Analyze review authenticity
   */
  analyzeReview(review: {
    rating: number;
    text: string;
    userId: string;
    productId: string;
    createdAt: Date;
  }): { authentic: boolean; suspicionScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check review length
    if (review.text.length < 20) {
      reasons.push('Review too short');
      suspicionScore += 15;
    }

    // Check for generic text
    const genericPhrases = ['good product', 'nice', 'great', 'excellent', 'bad', 'terrible'];
    if (genericPhrases.some(phrase => review.text.toLowerCase().includes(phrase)) && review.text.length < 50) {
      reasons.push('Generic review text');
      suspicionScore += 20;
    }

    // Check rating distribution (all 5-star or all 1-star is suspicious)
    if (review.rating === 5 || review.rating === 1) {
      suspicionScore += 5;
    }

    // Check posting time (reviews posted in bulk are suspicious)
    // This would check against other reviews from same user
    // For now, simplified

    const authentic = suspicionScore < 30;

    return { authentic, suspicionScore, reasons };
  }

  /**
   * Monitor price manipulation
   */
  detectPriceManipulation(
    listingId: string,
    priceHistory: { price: number; timestamp: Date }[]
  ): { manipulation: boolean; pattern: string } {
    if (priceHistory.length < 3) {
      return { manipulation: false, pattern: 'insufficient_data' };
    }

    // Check for rapid price changes
    let rapidChanges = 0;
    for (let i = 1; i < priceHistory.length; i++) {
      const timeDiff = priceHistory[i].timestamp.getTime() - priceHistory[i - 1].timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        rapidChanges++;
      }
    }

    if (rapidChanges > 5) {
      return { manipulation: true, pattern: 'rapid_price_changes' };
    }

    // Check for artificial inflation (price up then down)
    const prices = priceHistory.map(h => h.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);

    if (maxPrice > avgPrice * 2) {
      return { manipulation: true, pattern: 'artificial_inflation' };
    }

    return { manipulation: false, pattern: 'normal' };
  }

  /**
   * Get moderation queue
   */
  getModerationQueue(status: ModerationFlag['status'] = 'pending'): ModerationFlag[] {
    const stored = localStorage.getItem('moderation_flags');
    const flags: ModerationFlag[] = stored ? JSON.parse(stored) : [];
    return flags.filter(f => f.status === status);
  }

  /**
   * Resolve moderation flag
   */
  resolveModerationFlag(
    flagId: string,
    action: ModerationFlag['action'],
    resolvedBy: string
  ): void {
    const flags = this.getModerationQueue('pending');
    const flag = flags.find(f => f.id === flagId);

    if (flag) {
      flag.status = 'resolved';
      flag.action = action;
      flag.resolvedAt = new Date();
      flag.resolvedBy = resolvedBy;

      this.saveModerationFlag(flag);
    }
  }

  /**
   * Get fraud alerts
   */
  getFraudAlerts(status: FraudAlert['status'] = 'active'): FraudAlert[] {
    const stored = localStorage.getItem('fraud_alerts');
    const alerts: FraudAlert[] = stored ? JSON.parse(stored) : [];
    return alerts.filter(a => a.status === status);
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineFraudType(indicators: string[]): FraudAlert['type'] {
    if (indicators.some(i => i.includes('payment'))) return 'payment_fraud';
    if (indicators.some(i => i.includes('review'))) return 'fake_reviews';
    if (indicators.some(i => i.includes('price'))) return 'price_manipulation';
    if (indicators.some(i => i.includes('account'))) return 'multiple_accounts';
    return 'suspicious_activity';
  }

  private determineSeverity(riskScore: number): FraudAlert['severity'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private saveModerationFlag(flag: ModerationFlag): void {
    const stored = localStorage.getItem('moderation_flags');
    const flags: ModerationFlag[] = stored ? JSON.parse(stored) : [];
    const index = flags.findIndex(f => f.id === flag.id);

    if (index >= 0) {
      flags[index] = flag;
    } else {
      flags.push(flag);
    }

    localStorage.setItem('moderation_flags', JSON.stringify(flags));
  }

  private saveFraudAlert(alert: FraudAlert): void {
    const stored = localStorage.getItem('fraud_alerts');
    const alerts: FraudAlert[] = stored ? JSON.parse(stored) : [];
    alerts.push(alert);
    localStorage.setItem('fraud_alerts', JSON.stringify(alerts));
  }

  private saveVerification(verification: UserVerification): void {
    const stored = localStorage.getItem('user_verifications');
    const verifications: UserVerification[] = stored ? JSON.parse(stored) : [];
    const index = verifications.findIndex(v => v.userId === verification.userId && v.verificationType === verification.verificationType);

    if (index >= 0) {
      verifications[index] = verification;
    } else {
      verifications.push(verification);
    }

    localStorage.setItem('user_verifications', JSON.stringify(verifications));
  }

  private getAllUsers(): any[] {
    // Placeholder - would fetch from backend
    return [];
  }
}

export const moderationService = new ModerationService();
export default moderationService;
