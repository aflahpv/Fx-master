import React from 'react';
import { Browser } from '@capacitor/browser';

const RAZORPAY_LINK = 'https://razorpay.me/@appfxtrade';

interface TrialPageProps {
  onContinue: () => void;
}

const TrialPage: React.FC<TrialPageProps> = ({ onContinue }) => {
  const handlePayNow = async () => {
    try {
      await Browser.open({ url: RAZORPAY_LINK });
    } catch {
      window.open(RAZORPAY_LINK, '_blank');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.badge}>🎉 Limited Offer</div>
        <h1 style={styles.title}>
          Start Your <span style={{ color: '#f59e0b' }}>3-Day Free Trial</span>
        </h1>
        <p style={styles.subtitle}>
          Unlock full access to FxMaster's Trade Checklist, Trading Journal, and
          Progress &amp; Analytics. No commitment — cancel anytime.
        </p>

        <ul style={styles.featureList}>
          <li>✅ Daily Trade Checklist Matrix</li>
          <li>✅ Full Trading Journal &amp; Calendar</li>
          <li>✅ Progress &amp; Analytics Dashboard</li>
        </ul>

        <button style={styles.payButton} onClick={handlePayNow}>
          Pay Now
        </button>

        <button style={styles.skipButton} onClick={onContinue}>
          Continue with Free Trial
        </button>

        <p style={styles.disclaimer}>
          After 3 days, a subscription is required to continue using FxMaster.
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0a0e1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px',
  },
  card: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '24px',
    padding: '32px 24px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  title: {
    color: '#f1f5f9',
    fontSize: '26px',
    fontWeight: 800,
    lineHeight: 1.3,
    marginBottom: '12px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '15px',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    textAlign: 'left',
    color: '#cbd5e1',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  payButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  skipButton: {
    width: '100%',
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '16px',
  },
  disclaimer: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.5,
  },
};

export default TrialPage;
