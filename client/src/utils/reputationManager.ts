interface ServiceCompletion {
  serviceId: string;
  serviceName: string;
  rating: number;
  review?: string;
  amount: number;
  date: string;
}

interface ReputationUpdate {
  oldScore: number;
  newScore: number;
  event: string;
  change: number;
}

interface BehavioralReward {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'streak' | 'frequency' | 'rating' | 'milestone';
  trigger: string;
}

export class ReputationManager {
  static updateCustomerReputation(completion: ServiceCompletion): ReputationUpdate {
    const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
    const currentScore = mcoData.kycCredibilityScore || 85;

    let scoreChange = 0;
    let event = '';

    // Rating-based reputation changes
    if (completion.rating >= 5) {
      scoreChange = 2;
      event = `5-star review for ${completion.serviceName}`;
    } else if (completion.rating >= 4) {
      scoreChange = 1;
      event = `4-star review for ${completion.serviceName}`;
    } else if (completion.rating >= 3) {
      scoreChange = 0;
      event = `3-star review for ${completion.serviceName}`;
    } else {
      scoreChange = -1;
      event = `Low rating for ${completion.serviceName}`;
    }

    // Bonus for detailed reviews
    if (completion.review && completion.review.length > 50) {
      scoreChange += 1;
      event += ' with detailed review';
    }

    // High-value service bonus
    if (completion.amount > 200) {
      scoreChange += 1;
      event += ' (premium service)';
    }

    const newScore = Math.min(100, Math.max(0, currentScore + scoreChange));

    // Update MCO data
    mcoData.kycCredibilityScore = newScore;
    mcoData.kycLastUpdated = new Date().toISOString();

    // Add to reputation history
    if (!mcoData.reputationHistory) mcoData.reputationHistory = [];
    mcoData.reputationHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      score: newScore,
      event,
      change: scoreChange > 0 ? `+${scoreChange}` : scoreChange.toString()
    });

    // Keep only last 10 entries
    mcoData.reputationHistory = mcoData.reputationHistory.slice(0, 10);

    localStorage.setItem('mcoData', JSON.stringify(mcoData));

    return {
      oldScore: currentScore,
      newScore,
      event,
      change: scoreChange
    };
  }

  static updateProviderReputation(providerId: string, rating: number): void {
    // This would typically update on-chain data
    // For demo, we'll simulate provider reputation updates
    const providers = JSON.parse(localStorage.getItem('providerReputations') || '{}');

    if (!providers[providerId]) {
      providers[providerId] = {
        totalRatings: 0,
        averageRating: 4.5,
        reputationTrend: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const provider = providers[providerId];
    const newAverage = ((provider.averageRating * provider.totalRatings) + rating) / (provider.totalRatings + 1);

    provider.totalRatings += 1;
    provider.averageRating = Math.round(newAverage * 10) / 10;
    provider.lastUpdated = new Date().toISOString();

    // Add to trend
    provider.reputationTrend.unshift({
      date: new Date().toISOString().split('T')[0],
      rating: newAverage,
      review_count: provider.totalRatings
    });

    providers[providerId] = provider;
    localStorage.setItem('providerReputations', JSON.stringify(providers));
  }

  static checkBehavioralRewards(): BehavioralReward[] {
    const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
    const newRewards: BehavioralReward[] = [];

    if (!mcoData.pastTransactions) return newRewards;

    const transactions = mcoData.pastTransactions;
    const completedServices = transactions.filter((t: any) => t.status === 'completed');

    // Streak rewards
    const streakCount = this.calculateStreak(transactions);
    if (streakCount >= 3 && !this.hasActiveReward(mcoData, 'streak_3')) {
      newRewards.push({
        id: 'streak_3',
        name: 'Service Streak: 3 Services',
        description: 'Completed 3 services in 30 days',
        points: 50,
        type: 'streak',
        trigger: `${streakCount} consecutive services`
      });
    }

    if (streakCount >= 5 && !this.hasActiveReward(mcoData, 'streak_5')) {
      newRewards.push({
        id: 'streak_5',
        name: 'Service Streak: 5 Services',
        description: 'Completed 5 services in 60 days',
        points: 100,
        type: 'streak',
        trigger: `${streakCount} consecutive services`
      });
    }

    // High-rating rewards
    const averageRating = completedServices.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / completedServices.length;
    if (averageRating >= 4.5 && completedServices.length >= 3 && !this.hasActiveReward(mcoData, 'quality_reviewer')) {
      newRewards.push({
        id: 'quality_reviewer',
        name: 'Quality Reviewer',
        description: 'Maintained 4.5+ star average across multiple services',
        points: 75,
        type: 'rating',
        trigger: `${averageRating.toFixed(1)} avg rating`
      });
    }

    // Milestone rewards
    const totalSpent = completedServices.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    if (totalSpent >= 500 && !this.hasActiveReward(mcoData, 'big_spender')) {
      newRewards.push({
        id: 'big_spender',
        name: 'Premium Customer',
        description: 'Spent over $500 on marketplace services',
        points: 100,
        type: 'milestone',
        trigger: `$${totalSpent} total spent`
      });
    }

    return newRewards;
  }

  private static calculateStreak(transactions: any[]): number {
    const completed = transactions
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (completed.length === 0) return 0;

    let streak = 1;
    const now = new Date();

    for (let i = 0; i < completed.length - 1; i++) {
      const current = new Date(completed[i].date);
      const next = new Date(completed[i + 1].date);
      const daysDiff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 30) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private static hasActiveReward(mcoData: any, rewardId: string): boolean {
    return mcoData.rewards?.some((r: any) => r.id === rewardId && r.active) || false;
  }

  static getReputationTrend(days: number = 30): any[] {
    const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
    return mcoData.reputationHistory?.slice(0, days) || [];
  }

  static isVerifiedCustomer(): boolean {
    const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
    return mcoData.verifiedCustomer || mcoData.totalServicesCompleted >= 2;
  }
}