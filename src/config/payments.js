// src/config/payments.js
export const PAYMENT_CONFIG = {
  ownerUpiId:          import.meta.env.VITE_OWNER_UPI_ID       || '',
  ownerUpiName:        import.meta.env.VITE_OWNER_UPI_NAME     || 'EliteArena',
  upiQrUrl:            import.meta.env.VITE_UPI_QR_URL         || '',
  ecPerRupee:          Number(import.meta.env.VITE_EC_PER_RUPEE)              || 1,
  minDeposit:          Number(import.meta.env.VITE_MIN_DEPOSIT)                || 50,
  maxDeposit:          Number(import.meta.env.VITE_MAX_DEPOSIT)                || 10000,
  minWithdrawal:       Number(import.meta.env.VITE_MIN_WITHDRAWAL)             || 500,
  maxWithdrawal:       Number(import.meta.env.VITE_MAX_WITHDRAWAL)             || 50000,
  withdrawalFeePercent:Number(import.meta.env.VITE_WITHDRAWAL_FEE_PERCENT)    || 5,
  withdrawalDelayMs:  (Number(import.meta.env.VITE_WITHDRAWAL_DELAY_MINUTES)  || 10) * 60 * 1000,
};

// ElitePass subscription config
export const ELITE_PASS = {
  priceINR:        99,
  priceEC:         99,
  monthlyBonusEC:  50,
  adLimitBonus:    5,          // extra ads per day (10 → 15)
  label:           'ElitePass',
  badge:           '👑',
  features: [
    'Priority tournament registration',
    '50 bonus EC every month',
    '15 ads/day (instead of 10)',
    'Exclusive ElitePass tournaments',
    'Ad-free experience',
    '👑 Profile badge',
  ],
};

// Achievement config
export const ACHIEVEMENTS = [
  { id:'first_join',    label:'First Blood',     desc:'Pehla tournament join kiya',        ec:10,  emoji:'🎮', trigger:'matches_played',   threshold:1   },
  { id:'five_matches',  label:'Veteran',          desc:'5 tournaments complete kiye',       ec:25,  emoji:'⚔️',  trigger:'matches_played',   threshold:5   },
  { id:'first_win',     label:'Champion',         desc:'Pehli tournament jeet!',            ec:50,  emoji:'🏆', trigger:'total_winnings',    threshold:1   },
  { id:'refer_first',   label:'Recruiter',        desc:'Pehla referral kiya',               ec:25,  emoji:'🤝', trigger:'referral_count',    threshold:1   },
  { id:'deposit_first', label:'Investor',         desc:'Pehla deposit kiya',                ec:15,  emoji:'💰', trigger:'deposit_count',     threshold:1   },
  { id:'streak_7',      label:'Loyal Soldier',    desc:'7 din lagatar login',               ec:70,  emoji:'🔥', trigger:'login_streak',      threshold:7   },
  { id:'streak_30',     label:'Elite Legend',     desc:'30 din lagatar login',              ec:300, emoji:'👑', trigger:'login_streak',      threshold:30  },
  { id:'earn_1000',     label:'Money Maker',      desc:'1000 EC total earn kiya',           ec:50,  emoji:'💎', trigger:'total_winnings',    threshold:1000},
  { id:'ten_matches',   label:'War Machine',      desc:'10 tournaments complete kiye',      ec:100, emoji:'🚀', trigger:'matches_played',    threshold:10  },
];

export const inrToEC   = (inr) => Math.floor(inr * PAYMENT_CONFIG.ecPerRupee);
export const ecToINR   = (ec)  => Math.floor(ec  / PAYMENT_CONFIG.ecPerRupee);
export const formatINR = (n)   =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
