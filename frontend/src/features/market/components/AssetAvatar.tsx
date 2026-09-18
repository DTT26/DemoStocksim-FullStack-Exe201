import { useState } from 'react';
import { getAssetStyle, getExchangeConfig } from '../utils/assetLogos';
import type { Stock } from '../data';

interface AssetAvatarProps {
  stock: Stock;
  size?: 'sm' | 'md' | 'lg';
  showExchangeBadge?: boolean;
}

/** Avatar hiển thị logo coin (crypto) hoặc letter badge (stocks/forex) + badge sàn nhỏ */
export const AssetAvatar = ({ stock, size = 'md', showExchangeBadge = true }: AssetAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const assetStyle = getAssetStyle(stock.symbol, stock.market);
  const exchangeCfg = getExchangeConfig(stock.exchange);

  const sizeMap = {
    sm: { outer: 28, inner: 28, badge: 12, font: 9 },
    md: { outer: 36, inner: 36, badge: 14, font: 10 },
    lg: { outer: 44, inner: 44, badge: 16, font: 11 },
  };
  const dim = sizeMap[size];

  return (
    <div className="relative shrink-0" style={{ width: dim.outer, height: dim.outer }}>
      {/* Main coin/asset avatar */}
      <div
        className="rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-sm"
        style={{
          width: dim.inner,
          height: dim.inner,
          background: (assetStyle.logoUrl && !imgError) ? '#ffffff' : assetStyle.bg,
          color: assetStyle.color,
        }}
      >
        {(assetStyle.coinLogoUrl || assetStyle.logoUrl) && !imgError ? (
          <img
            src={assetStyle.coinLogoUrl || assetStyle.logoUrl}
            alt={stock.symbol}
            style={{ width: dim.inner - 6, height: dim.inner - 6, objectFit: 'contain' }}
            onError={() => setImgError(true)}
          />
        ) : assetStyle.emoji ? (
          <span style={{ fontSize: dim.font + 2 }}>{assetStyle.emoji}</span>
        ) : (
          <span
            className="font-black tracking-tight leading-none"
            style={{ fontSize: dim.font }}
          >
            {assetStyle.text}
          </span>
        )}
      </div>

      {/* Exchange badge (bottom-right corner) */}
      {showExchangeBadge && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center border border-[#131722] font-black leading-none"
          style={{
            width: dim.badge,
            height: dim.badge,
            background: exchangeCfg.bg,
            color: exchangeCfg.color,
            fontSize: dim.badge * 0.45,
          }}
          title={stock.exchange}
        >
          {exchangeCfg.shortLabel.slice(0, 2)}
        </div>
      )}
    </div>
  );
};

/** Badge nhỏ chỉ hiển thị logo sàn giao dịch */
export const ExchangeBadge = ({ exchange, size = 'sm' }: { exchange: string; size?: 'sm' | 'md' }) => {
  const cfg = getExchangeConfig(exchange);
  const dim = size === 'sm' ? { h: 16, px: 6, font: 9 } : { h: 20, px: 8, font: 10 };

  return (
    <span
      className="inline-flex items-center rounded font-bold uppercase tracking-wide"
      style={{
        height: dim.h,
        paddingLeft: dim.px,
        paddingRight: dim.px,
        background: cfg.bg,
        color: cfg.color,
        fontSize: dim.font,
      }}
    >
      {cfg.shortLabel}
    </span>
  );
};
