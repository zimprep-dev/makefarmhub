/**
 * Reputation & Trust System
 * Manages user ratings, badges, and trust scores
 */

export interface UserReputation {
  userId: string;
  trustScore: number; // 0-100
  totalRatings: number;
  averageRating: number; // 0-5
  badges: Badge[];
  verificationStatus: 'unverified' | 'email' | 'phone' | 'id' | 'full';
  completedTransactions: number;
  responseRate: number; // percentage
  responseTime: number; // average in hours
  onTimeDelivery: number; // percentage
  disputeRate: number; // percentage
  level: number; // 1-10
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  category: 'trust' | 'sales' | 'quality' | 'speed' | 'special';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number; // 0-100
  completed: boolean;
  reward?: string;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  orderId: string;
  rating: number; // 1-5
  review?: string;
  categories: {
    communication: number;
    quality: number;
    delivery: number;
    value: number;
  };
  createdAt: Date;
  helpful: number; // how many found this helpful
}

class ReputationService {
  /**
   * Calculate trust score based on multiple factors
   */
  calculateTrustScore(data: {
    averageRating: number;
    totalRatings: number;
    completedTransactions: number;
    disputeRate: number;
    responseRate: number;
    onTimeDelivery: number;
    verificationLevel: number; // 0-4
  }): number {
    const {
      averageRating,
      totalRatings,
      completedTransactions,
      disputeRate,
      responseRate,
      onTimeDelivery,
      verificationLevel,
    } = data;

    // Weighted scoring system
    const ratingScore = (averageRating / 5) * 30; // 30% weight
    const volumeScore = Math.min((totalRatings / 50) * 15, 15); // 15% weight, cap at 50 ratings
    const transactionScore = Math.min((completedTransactions / 100) * 15, 15); // 15% weight
    const disputeScore = (1 - disputeRate) * 15; // 15% weight (lower is better)
    const responseScore = responseRate * 10; // 10% weight
    const deliveryScore = onTimeDelivery * 10; // 10% weight
    const verificationScore = (verificationLevel / 4) * 5; // 5% weight

    const totalScore =
      ratingScore +
      volumeScore +
      transactionScore +
      disputeScore +
      responseScore +
      deliveryScore +
      verificationScore;

    return Math.round(Math.min(totalScore, 100));
  }

  /**
   * Calculate user level based on experience
   */
  calculateLevel(completedTransactions: number, trustScore: number): number {
    const transactionLevel = Math.floor(completedTransactions / 10);
    const trustLevel = Math.floor(trustScore / 20);
    return Math.min(Math.max(transactionLevel + trustLevel, 1), 10);
  }

  /**
   * Check and award badges
   */
  checkBadges(reputation: Partial<UserReputation>): Badge[] {
    const badges: Badge[] = [];
    const now = new Date();

    // Trust badges
    if (reputation.verificationStatus === 'full') {
      badges.push({
        id: 'verified',
        name: 'Verified User',
        description: 'Completed full identity verification',
        icon: 'BadgeCheck',
        color: '#3b82f6',
        earnedAt: now,
        category: 'trust',
      });
    }

    if (reputation.trustScore && reputation.trustScore >= 90) {
      badges.push({
        id: 'trusted-seller',
        name: 'Trusted Seller',
        description: 'Maintained 90+ trust score',
        icon: 'Shield',
        color: '#10b981',
        earnedAt: now,
        category: 'trust',
      });
    }

    // Sales badges
    if (reputation.completedTransactions && reputation.completedTransactions >= 100) {
      badges.push({
        id: 'top-seller',
        name: 'Top Seller',
        description: 'Completed 100+ transactions',
        icon: 'Award',
        color: '#f59e0b',
        earnedAt: now,
        category: 'sales',
      });
    }

    if (reputation.completedTransactions && reputation.completedTransactions >= 500) {
      badges.push({
        id: 'elite-seller',
        name: 'Elite Seller',
        description: 'Completed 500+ transactions',
        icon: 'Crown',
        color: '#8b5cf6',
        earnedAt: now,
        category: 'sales',
      });
    }

    // Quality badges
    if (reputation.averageRating && reputation.averageRating >= 4.8 && reputation.totalRatings && reputation.totalRatings >= 50) {
      badges.push({
        id: 'quality-guarantee',
        name: 'Quality Guarantee',
        description: '4.8+ rating with 50+ reviews',
        icon: 'Star',
        color: '#eab308',
        earnedAt: now,
        category: 'quality',
      });
    }

    // Speed badges
    if (reputation.responseRate && reputation.responseRate >= 0.95) {
      badges.push({
        id: 'quick-responder',
        name: 'Quick Responder',
        description: '95%+ response rate',
        icon: 'Zap',
        color: '#06b6d4',
        earnedAt: now,
        category: 'speed',
      });
    }

    if (reputation.onTimeDelivery && reputation.onTimeDelivery >= 0.98) {
      badges.push({
        id: 'reliable-delivery',
        name: 'Reliable Delivery',
        description: '98%+ on-time delivery',
        icon: 'Truck',
        color: '#14b8a6',
        earnedAt: now,
        category: 'speed',
      });
    }

    return badges;
  }

  /**
   * Get achievements for user
   */
  getAchievements(reputation: Partial<UserReputation>): Achievement[] {
    const achievements: Achievement[] = [];

    // First sale achievement
    achievements.push({
      id: 'first-sale',
      name: 'First Sale',
      description: 'Complete your first transaction',
      progress: reputation.completedTransactions ? Math.min((reputation.completedTransactions / 1) * 100, 100) : 0,
      completed: (reputation.completedTransactions || 0) >= 1,
      reward: '+10 Trust Score',
    });

    // Century achievement
    achievements.push({
      id: 'century',
      name: 'Century Club',
      description: 'Complete 100 transactions',
      progress: reputation.completedTransactions ? Math.min((reputation.completedTransactions / 100) * 100, 100) : 0,
      completed: (reputation.completedTransactions || 0) >= 100,
      reward: 'Top Seller Badge',
    });

    // Perfect rating achievement
    achievements.push({
      id: 'perfect-rating',
      name: 'Perfect Rating',
      description: 'Maintain 5.0 rating with 20+ reviews',
      progress: reputation.averageRating && reputation.totalRatings
        ? Math.min(((reputation.averageRating / 5) * (reputation.totalRatings / 20)) * 100, 100)
        : 0,
      completed: (reputation.averageRating || 0) === 5 && (reputation.totalRatings || 0) >= 20,
      reward: 'Quality Guarantee Badge',
    });

    // Response master achievement
    achievements.push({
      id: 'response-master',
      name: 'Response Master',
      description: 'Maintain 100% response rate for 50 messages',
      progress: reputation.responseRate ? reputation.responseRate * 100 : 0,
      completed: (reputation.responseRate || 0) >= 1.0,
      reward: 'Quick Responder Badge',
    });

    // Trust builder achievement
    achievements.push({
      id: 'trust-builder',
      name: 'Trust Builder',
      description: 'Reach 90+ trust score',
      progress: reputation.trustScore || 0,
      completed: (reputation.trustScore || 0) >= 90,
      reward: 'Trusted Seller Badge',
    });

    return achievements;
  }

  /**
   * Get trust level description
   */
  getTrustLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 90) {
      return {
        level: 'Excellent',
        color: '#10b981',
        description: 'Highly trusted member with outstanding reputation',
      };
    } else if (score >= 75) {
      return {
        level: 'Very Good',
        color: '#3b82f6',
        description: 'Trusted member with strong reputation',
      };
    } else if (score >= 60) {
      return {
        level: 'Good',
        color: '#8b5cf6',
        description: 'Reliable member with good reputation',
      };
    } else if (score >= 40) {
      return {
        level: 'Fair',
        color: '#f59e0b',
        description: 'New member building reputation',
      };
    } else {
      return {
        level: 'Building',
        color: '#6b7280',
        description: 'New member, complete transactions to build trust',
      };
    }
  }

  /**
   * Format rating distribution
   */
  getRatingDistribution(ratings: Rating[]): { [key: number]: number } {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });

    return distribution;
  }

  /**
   * Calculate average category ratings
   */
  getCategoryAverages(ratings: Rating[]): {
    communication: number;
    quality: number;
    delivery: number;
    value: number;
  } {
    if (ratings.length === 0) {
      return { communication: 0, quality: 0, delivery: 0, value: 0 };
    }

    const totals = ratings.reduce(
      (acc, rating) => ({
        communication: acc.communication + rating.categories.communication,
        quality: acc.quality + rating.categories.quality,
        delivery: acc.delivery + rating.categories.delivery,
        value: acc.value + rating.categories.value,
      }),
      { communication: 0, quality: 0, delivery: 0, value: 0 }
    );

    return {
      communication: totals.communication / ratings.length,
      quality: totals.quality / ratings.length,
      delivery: totals.delivery / ratings.length,
      value: totals.value / ratings.length,
    };
  }
}

export const reputationService = new ReputationService();
export default reputationService;
