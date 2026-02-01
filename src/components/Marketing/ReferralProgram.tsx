import { useState } from 'react';
import { Gift, Copy, Check, Users, DollarSign, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../UI/Toast';
import './ReferralProgram.css';

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed';
  reward: number;
}

export default function ReferralProgram() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id ? `MFH-${user.id.slice(0, 6).toUpperCase()}` : 'MFH-GUEST';
  const referralLink = `https://makefarmhub.com/join?ref=${referralCode}`;

  const stats = {
    totalReferrals: 12,
    pendingRewards: 25.00,
    earnedRewards: 75.00,
  };

  const referrals: Referral[] = [
    { id: '1', name: 'John M.', date: '2026-01-28', status: 'completed', reward: 5.00 },
    { id: '2', name: 'Sarah K.', date: '2026-01-25', status: 'completed', reward: 5.00 },
    { id: '3', name: 'Peter N.', date: '2026-01-30', status: 'pending', reward: 5.00 },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('success', 'Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('error', 'Failed to copy');
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MakeFarmHub',
          text: 'Join MakeFarmHub and get $5 off your first purchase!',
          url: referralLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  return (
    <div className="referral-program">
      <div className="referral-header">
        <Gift size={32} className="header-icon" />
        <h2>Referral Program</h2>
        <p>Invite friends and earn $5 for each successful referral!</p>
      </div>

      <div className="referral-stats">
        <div className="stat-card">
          <Users size={24} />
          <div>
            <span className="stat-value">{stats.totalReferrals}</span>
            <span className="stat-label">Total Referrals</span>
          </div>
        </div>
        <div className="stat-card pending">
          <DollarSign size={24} />
          <div>
            <span className="stat-value">${stats.pendingRewards.toFixed(2)}</span>
            <span className="stat-label">Pending Rewards</span>
          </div>
        </div>
        <div className="stat-card earned">
          <DollarSign size={24} />
          <div>
            <span className="stat-value">${stats.earnedRewards.toFixed(2)}</span>
            <span className="stat-label">Earned Rewards</span>
          </div>
        </div>
      </div>

      <div className="referral-code-section">
        <h3>Your Referral Code</h3>
        <div className="code-box">
          <span className="code">{referralCode}</span>
          <button onClick={() => copyToClipboard(referralCode)}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <div className="referral-link-section">
        <h3>Share Your Link</h3>
        <div className="link-box">
          <input type="text" value={referralLink} readOnly />
          <button className="btn-copy" onClick={() => copyToClipboard(referralLink)}>
            <Copy size={16} /> Copy
          </button>
          <button className="btn-share" onClick={shareReferral}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <div className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Share your referral link with friends</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>They sign up and make their first purchase</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>You both get $5 credit!</p>
          </div>
        </div>
      </div>

      <div className="referral-history">
        <h3>Recent Referrals</h3>
        {referrals.length > 0 ? (
          <div className="referrals-list">
            {referrals.map((referral) => (
              <div key={referral.id} className="referral-item">
                <div className="referral-info">
                  <span className="referral-name">{referral.name}</span>
                  <span className="referral-date">{referral.date}</span>
                </div>
                <div className="referral-status">
                  <span className={`status-badge ${referral.status}`}>
                    {referral.status}
                  </span>
                  <span className="reward">+${referral.reward.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-referrals">No referrals yet. Start sharing!</p>
        )}
      </div>
    </div>
  );
}
