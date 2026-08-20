import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { savePaymentEmail, getSavedPaymentEmail } from '../utils/trial';

const RAZORPAY_LINK = 'https://razorpay.me/@appfxtrade';

interface TrialPageProps {
  onContinue: () => void;
  mandatory?: boolean;
}

const TrialPage: React.FC<TrialPageProps> = ({ onContinue, mandatory = false }) => {
  const [email, setEmail] = useState(getSavedPaymentEmail());
  const [error, setError] = useState('');

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handlePayNow = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email so we can activate your account after payment.');
      return;
    }
    setError('');
    savePaymentEmail(email);
    const url = `${RAZORPAY_LINK}?email=${encodeURIComponent(email)}`;
    try {
      await Browser.open({ url });
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.badge}>{mandatory ? '⏰ Trial Ended' : '🎉 Limited Offer'}</div>
        <h1 style={styles.title}>
          {mandatory ? (
            <>Your <span style={{ color: '#f59e0b' }}>3-Day Free Trial</span> Has Ended</>
          ) : (
            <>Start Your <span style={{ color: '#f59e0b' }}>3-Day Free Trial</span></>
          )}
        </h1>
        <p style={styles.subtitle}>
          {mandatory
            ? "Subscribe to keep full access to FxMaster's Trade Checklist, Trading Journal, and Progress & Analytics."
            : "Unlock full access to FxMaster's Trade Checklist, Trading Journal, and Progress & Analytics. No commitment — cancel anytime."}
        </p>

        <ul style={styles.featureList}>
          <li>✅ Daily Trade Checklist Matrix</li>
          <li>✅ Full Trading Journal &amp; Calendar</li>
          <li>✅ Progress &amp; Analytics Dashboard</li>
        </ul>

        <label style={styles.label}>Email (used to activate your account)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.payButton} onClick={handlePayNow}>
          Pay Now
        </button>

        {!mandatory && (
          <button style={styles.skipButton} onClick={onContinue}>
            Continue with Free Trial
          </button>
        )}

        <p style={styles.disclaimer}>
          {mandatory
            ? 'Your account activates automatically within a few minutes of payment.'
            : 'After 3 days, a subscription is required to continue using FxMaster.'}
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
    overflowY: 'auto',
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
    margin: '0 0 24px 0',
    textAlign: 'left',
    color: '#cbd5e1',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    display: 'block',
    textAlign: 'left',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: '#0a0e1a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#f1f5f9',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  error: {
    color: '#f87171',
    fontSize: '13px',
    textAlign: 'left',
    marginBottom: '12px',
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
    marginTop: '8px',
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
