import React, { useId } from 'react';

interface SvgIconProps {
  size?: number;
}

// ==========================================
// 1. COMMODITIES SVGS
// ==========================================

export const GoldIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`goldBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <linearGradient id={`goldBar_${id}`} x1="0" y1="0" x2="24" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#goldBg_${id})`} stroke="#FFA000" strokeWidth="1" />
      <path d="M10 15L15 11H27L22 15H10Z" fill="#FFF9C4" />
      <path d="M22 15L27 11V21L22 25V15Z" fill="#FF8F00" />
      <path d="M10 15H22V25H10V15Z" fill={`url(#goldBar_${id})`} />
      <text x="16" y="21.5" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="#E65100" textAnchor="middle">GOLD</text>
    </svg>
  );
};

export const SilverIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`silverBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={`silverBar_${id}`} x1="0" y1="0" x2="24" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#silverBg_${id})`} stroke="#94A3B8" strokeWidth="1" />
      <path d="M10 15L15 11H27L22 15H10Z" fill="#FFFFFF" />
      <path d="M22 15L27 11V21L22 25V15Z" fill="#475569" />
      <path d="M10 15H22V25H10V15Z" fill={`url(#silverBar_${id})`} />
      <text x="16" y="21.5" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="#1E293B" textAnchor="middle">SILV</text>
    </svg>
  );
};

export const OilIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`oilBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id={`oilDrop_${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#oilBg_${id})`} stroke="#64748B" strokeWidth="1" />
      {/* Barrel ridges */}
      <rect x="11" y="9" width="14" height="18" rx="2" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
      <line x1="11" y1="14" x2="25" y2="14" stroke="#94A3B8" strokeWidth="1" />
      <line x1="11" y1="22" x2="25" y2="22" stroke="#94A3B8" strokeWidth="1" />
      {/* Oil drop */}
      <path d="M18 13C18 13 14.5 17 14.5 18.5C14.5 20.4 16.07 22 18 22C19.93 22 21.5 20.4 21.5 18.5C21.5 17 18 13 18 13Z" fill={`url(#oilDrop_${id})`} />
    </svg>
  );
};

export const GasIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gasBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id={`flame_${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#gasBg_${id})`} stroke="#38BDF8" strokeWidth="1" />
      <path d="M18 8C18 8 23 14 23 19C23 22.3 20.76 25 18 25C15.24 25 13 22.3 13 19C13 14 18 8 18 8Z" fill={`url(#flame_${id})`} />
      <path d="M18 15C18 15 20.5 18 20.5 20.5C20.5 22 19.38 23 18 23C16.62 23 15.5 22 15.5 20.5C15.5 18 18 15 18 15Z" fill="#FFFFFF" />
    </svg>
  );
};

export const CopperIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`cuBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#cuBg_${id})`} stroke="#F59E0B" strokeWidth="1" />
      <rect x="10" y="13" width="16" height="10" rx="1.5" fill="#FED7AA" />
      <text x="18" y="20.5" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#78350F" textAnchor="middle">Cu</text>
    </svg>
  );
};

export const PlatinumIcon: React.FC<SvgIconProps> = ({ size = 28 }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ptBg_${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#ptBg_${id})`} stroke="#E2E8F0" strokeWidth="1" />
      <polygon points="18,8 21,14 27,18 21,22 18,28 15,22 9,18 15,14" fill="#FFFFFF" />
      <text x="18" y="20.5" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="900" fill="#1E293B" textAnchor="middle">Pt</text>
    </svg>
  );
};

// ==========================================
// 2. FOREX DUAL-FLAG SVGS (HUY HIỆU CỜ TRÒN LỒNG NHAU CHUẨN BINGX)
// ==========================================

export const renderSingleFlag = (code: string) => {
  switch (code) {
    case 'EUR':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#003399" />
          <circle cx="18" cy="7" r="1.3" fill="#FFCC00" />
          <circle cx="18" cy="29" r="1.3" fill="#FFCC00" />
          <circle cx="7" cy="18" r="1.3" fill="#FFCC00" />
          <circle cx="29" cy="18" r="1.3" fill="#FFCC00" />
          <circle cx="10" cy="10" r="1.3" fill="#FFCC00" />
          <circle cx="26" cy="10" r="1.3" fill="#FFCC00" />
          <circle cx="10" cy="26" r="1.3" fill="#FFCC00" />
          <circle cx="26" cy="26" r="1.3" fill="#FFCC00" />
        </g>
      );
    case 'USD':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#B22234" />
          <path d="M0 6H36V9H0V6ZM0 12H36V15H0V12ZM0 18H36V21H0V18ZM0 24H36V27H0V24ZM0 30H36V33H0V30Z" fill="#FFFFFF" />
          <rect x="0" y="0" width="18" height="18" fill="#3C3B6E" />
          <circle cx="6" cy="6" r="1.2" fill="#FFFFFF" />
          <circle cx="12" cy="6" r="1.2" fill="#FFFFFF" />
          <circle cx="9" cy="9" r="1.2" fill="#FFFFFF" />
          <circle cx="6" cy="12" r="1.2" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="1.2" fill="#FFFFFF" />
        </g>
      );
    case 'GBP':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#012169" />
          <path d="M0 0L36 36M36 0L0 36" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M0 0L36 36M36 0L0 36" stroke="#C8102E" strokeWidth="2.5" />
          <path d="M18 0V36M0 18H36" stroke="#FFFFFF" strokeWidth="8" />
          <path d="M18 0V36M0 18H36" stroke="#C8102E" strokeWidth="4.5" />
        </g>
      );
    case 'JPY':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="18" cy="18" r="8" fill="#BC002D" />
        </g>
      );
    case 'AUD':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#00008B" />
          <rect x="0" y="0" width="18" height="18" fill="#012169" />
          <path d="M0 0L18 18M18 0L0 18" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M9 0V18M0 9H18" stroke="#C8102E" strokeWidth="2" />
          <circle cx="26" cy="12" r="1.4" fill="#FFFFFF" />
          <circle cx="28" cy="20" r="1.4" fill="#FFFFFF" />
          <circle cx="22" cy="24" r="1.4" fill="#FFFFFF" />
        </g>
      );
    case 'CAD':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#FFFFFF" />
          <path d="M0 0H9V36H0V0ZM27 0H36V36H27V0Z" fill="#FF0000" />
          <path d="M18 9L20 14L23 13L21 17L25 18L21 21L22 25L18 23L14 25L15 21L11 18L15 17L13 13L16 14L18 9Z" fill="#FF0000" />
        </g>
      );
    case 'CHF':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#D52B1E" />
          <rect x="15" y="9" width="6" height="18" fill="#FFFFFF" />
          <rect x="9" y="15" width="18" height="6" fill="#FFFFFF" />
        </g>
      );
    case 'NZD':
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#00247D" />
          <circle cx="26" cy="12" r="1.5" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.5" />
          <circle cx="28" cy="20" r="1.5" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.5" />
          <circle cx="22" cy="24" r="1.5" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.5" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="18" cy="18" r="18" fill="#1E293B" />
          <text x="18" y="22" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">{code.slice(0, 2)}</text>
        </g>
      );
  }
};

export const ForexPairIcon: React.FC<{ base: string; quote: string; size?: number }> = ({ base, quote, size = 28 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Quote Flag (right, slightly behind) */}
      <g transform="translate(13, 5) scale(0.55)">
        <circle cx="18" cy="18" r="19" fill="#0F172A" />
        {renderSingleFlag(quote)}
      </g>
      {/* Base Flag (left, in front) */}
      <g transform="translate(1, 7) scale(0.65)">
        <circle cx="18" cy="18" r="19" fill="#0F172A" />
        {renderSingleFlag(base)}
      </g>
    </svg>
  );
};

// ==========================================
// 3. INDICES SVGS
// ==========================================

export const IndexIcon: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 28 }) => {
  const clean = symbol.toUpperCase();
  switch (clean) {
    case 'DXY':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
          <text x="18" y="16" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#6EE7B7" textAnchor="middle">DXY</text>
          <text x="18" y="26" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">$</text>
        </svg>
      );
    case 'SPX':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="900" fill="#93C5FD" textAnchor="middle">S&P</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle">500</text>
        </svg>
      );
    case 'NDX':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#4338CA" stroke="#818CF8" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#C7D2FE" textAnchor="middle">NDX</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle">100</text>
        </svg>
      );
    case 'DJI':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#18181B" stroke="#71717A" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="900" fill="#E4E4E7" textAnchor="middle">DOW</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FACC15" textAnchor="middle">30</text>
        </svg>
      );
    case 'JP225':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#FFFFFF" stroke="#EF4444" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="12" fill="#EF4444" fillOpacity="0.1" />
          <circle cx="18" cy="18" r="7" fill="#DC2626" />
          <text x="18" y="21" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#FFFFFF" textAnchor="middle">225</text>
        </svg>
      );
    case 'UK100':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="#93C5FD" textAnchor="middle">FTSE</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle">100</text>
        </svg>
      );
    case 'EU50':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#003399" stroke="#FFCC00" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="900" fill="#FFCC00" textAnchor="middle">EU</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle">50</text>
        </svg>
      );
    case 'US2000':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="18" y="15" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="#93C5FD" textAnchor="middle">RUSS</text>
          <text x="18" y="25" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">2000</text>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
          <text x="18" y="22" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle">{clean.slice(0, 3)}</text>
        </svg>
      );
  }
};

// ==========================================
// 4. CRYPTO STYLIZED VECTOR FALLBACKS
// ==========================================

export const CryptoVectorFallback: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 28 }) => {
  const clean = symbol.replace(/USDT.*/i, '').replace(/1000/i, '').toUpperCase();

  const brandStyles: Record<string, { bg: string; stroke: string; color: string; label: string }> = {
    ARB: { bg: '#28A0F0', stroke: '#1D78B4', color: '#FFFFFF', label: 'ARB' },
    OP: { bg: '#FF0420', stroke: '#CC0319', color: '#FFFFFF', label: 'OP' },
    TIA: { bg: '#7B2BF9', stroke: '#5B1EB8', color: '#FFFFFF', label: 'TIA' },
    TON: { bg: '#0088CC', stroke: '#006699', color: '#FFFFFF', label: 'TON' },
    INJ: { bg: '#00F2FE', stroke: '#4FACFE', color: '#002B49', label: 'INJ' },
    SUI: { bg: '#2A82E4', stroke: '#1B5BB0', color: '#FFFFFF', label: 'SUI' },
    NEAR: { bg: '#000000', stroke: '#444444', color: '#00FFB2', label: 'NEAR' },
    AVAX: { bg: '#E84142', stroke: '#B32627', color: '#FFFFFF', label: 'AVAX' },
    APT: { bg: '#2ED8A7', stroke: '#1B9A76', color: '#0A251E', label: 'APT' },
    WIF: { bg: '#9A6B46', stroke: '#6B4527', color: '#FFFFFF', label: 'WIF' },
    SEI: { bg: '#9B1D20', stroke: '#690F11', color: '#FFFFFF', label: 'SEI' },
    RENDER: { bg: '#E53E3E', stroke: '#9B2C2C', color: '#FFFFFF', label: 'RNDR' },
    BTC: { bg: '#F7931A', stroke: '#C2700E', color: '#FFFFFF', label: '₿' },
    ETH: { bg: '#627EEA', stroke: '#435DB5', color: '#FFFFFF', label: 'Ξ' },
    SOL: { bg: '#14F195', stroke: '#9945FF', color: '#0B1D28', label: 'SOL' },
    BNB: { bg: '#F3BA2F', stroke: '#C99419', color: '#1E2329', label: 'BNB' },
    XRP: { bg: '#23292F', stroke: '#45505C', color: '#FFFFFF', label: 'XRP' },
    DOGE: { bg: '#C2A633', stroke: '#998322', color: '#FFFFFF', label: 'Ð' },
    PEPE: { bg: '#479F3F', stroke: '#2E6E27', color: '#FFFFFF', label: 'PEPE' },
  };

  const style = brandStyles[clean] ?? {
    bg: '#2563EB',
    stroke: '#1D4ED8',
    color: '#FFFFFF',
    label: clean.slice(0, 3),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="17" fill={style.bg} stroke={style.stroke} strokeWidth="1.5" />
      <text
        x="18"
        y={style.label.length === 1 ? '24' : '22.5'}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={style.label.length === 1 ? '16' : style.label.length > 3 ? '7.5' : '9.5'}
        fontWeight="900"
        fill={style.color}
        textAnchor="middle"
        letterSpacing="-0.5px"
      >
        {style.label}
      </text>
    </svg>
  );
};
