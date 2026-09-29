import { useState, useEffect } from 'react';
import { getAssetStyle, getExchangeConfig } from '../utils/assetLogos';
import type { Stock } from '../data';
import {
  GoldIcon,
  SilverIcon,
  OilIcon,
  GasIcon,
  CopperIcon,
  PlatinumIcon,
  ForexPairIcon,
  IndexIcon,
  CryptoVectorFallback,
} from './AssetIconSvg';

interface AssetAvatarProps {
  stock: Stock;
  size?: 'sm' | 'md' | 'lg';
  showExchangeBadge?: boolean;
}

/** Avatar hiển thị logo coin (crypto), cờ ngoại hối, biểu tượng hàng hóa hoặc thương hiệu chứng khoán */
export const AssetAvatar = ({ stock, size = 'md', showExchangeBadge = true }: AssetAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const [imgFallbackStep, setImgFallbackStep] = useState(0);
  const [badgeImgError, setBadgeImgError] = useState(false);

  const assetStyle = getAssetStyle(stock.symbol, stock.market);
  const exchangeCfg = getExchangeConfig(stock.exchange);

  // Reset trạng thái khi đổi mã giao dịch
  useEffect(() => {
    setImgError(false);
    setImgFallbackStep(0);
    setBadgeImgError(false);
  }, [stock.symbol, stock.exchange]);

  const sizeMap = {
    sm: { outer: 28, inner: 28, badge: 13, font: 9 },
    md: { outer: 36, inner: 36, badge: 15, font: 10 },
    lg: { outer: 44, inner: 44, badge: 17, font: 11 },
  };
  const dim = sizeMap[size];

  // ==========================================
  // XỬ LÝ HÀNG HÓA BẰNG VECTOR SVG CHUYÊN NGHIỆP
  // ==========================================
  if (stock.market === 'Hàng hóa') {
    const sym = stock.symbol.toUpperCase();
    let commoditySvg: React.ReactNode = null;
    if (sym === 'XAUUSD') commoditySvg = <GoldIcon size={dim.inner} />;
    else if (sym === 'XAGUSD') commoditySvg = <SilverIcon size={dim.inner} />;
    else if (sym === 'USOIL' || sym === 'BRENT') commoditySvg = <OilIcon size={dim.inner} />;
    else if (sym === 'NGAS') commoditySvg = <GasIcon size={dim.inner} />;
    else if (sym === 'COPPER') commoditySvg = <CopperIcon size={dim.inner} />;
    else if (sym === 'PLATINUM') commoditySvg = <PlatinumIcon size={dim.inner} />;

    if (commoditySvg) {
      return (
        <div className="relative shrink-0" style={{ width: dim.outer, height: dim.outer }}>
          <div className="rounded-full flex items-center justify-center overflow-hidden shadow-sm" style={{ width: dim.inner, height: dim.inner }}>
            {commoditySvg}
          </div>
          {showExchangeBadge && renderExchangeBadge(exchangeCfg, dim.badge, badgeImgError, () => setBadgeImgError(true))}
        </div>
      );
    }
  }

  // ==========================================
  // XỬ LÝ NGOẠI HỐI (FOREX) BẰNG CỜ KÉP DUAL-FLAG
  // ==========================================
  if (stock.market === 'Ngoại hối (Forex)') {
    const base = stock.symbol.slice(0, 3).toUpperCase();
    const quote = stock.symbol.slice(3, 6).toUpperCase();
    return (
      <div className="relative shrink-0" style={{ width: dim.outer, height: dim.outer }}>
        <div className="rounded-full flex items-center justify-center overflow-hidden shadow-sm" style={{ width: dim.inner, height: dim.inner }}>
          <ForexPairIcon base={base} quote={quote} size={dim.inner} />
        </div>
        {showExchangeBadge && renderExchangeBadge(exchangeCfg, dim.badge, badgeImgError, () => setBadgeImgError(true))}
      </div>
    );
  }

  // ==========================================
  // XỬ LÝ CHỈ SỐ TOÀN CẦU BẰNG ICON HUY HIỆU
  // ==========================================
  if (stock.market === 'Chỉ số') {
    return (
      <div className="relative shrink-0" style={{ width: dim.outer, height: dim.outer }}>
        <div className="rounded-full flex items-center justify-center overflow-hidden shadow-sm" style={{ width: dim.inner, height: dim.inner }}>
          <IndexIcon symbol={stock.symbol} size={dim.inner} />
        </div>
        {showExchangeBadge && renderExchangeBadge(exchangeCfg, dim.badge, badgeImgError, () => setBadgeImgError(true))}
      </div>
    );
  }

  // ==========================================
  // XỬ LÝ CRYPTO & CỔ PHIẾU MỸ VỚI MULTI-CDN VÀ VECTOR FALLBACK
  // ==========================================
  const cleanSym = stock.symbol
    .replace(/\.P$/i, '')
    .replace(/\.SWAP$/i, '')
    .replace(/USDT$/i, '')
    .replace(/^1000/i, '')
    .toLowerCase();

  const candidateUrls: string[] = [];
  if (stock.market === 'Tiền điện tử (Crypto)') {
    candidateUrls.push(
      `https://assets.coincap.io/assets/icons/${cleanSym}@2x.png`,
      `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSym}.png`,
      `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${cleanSym}.png`
    );
  } else if (stock.market === 'Cổ phiếu') {
    const symUpper = cleanSym.toUpperCase();
    candidateUrls.push(
      `https://financialmodelingprep.com/image-stock/${symUpper}.png`,
      `https://assets.parqet.com/logos/symbol/${symUpper}?format=png`
    );
  } else if (assetStyle.coinLogoUrl || assetStyle.logoUrl) {
    candidateUrls.push(assetStyle.coinLogoUrl || assetStyle.logoUrl || '');
  }

  const currentImgUrl = candidateUrls[imgFallbackStep];

  const handleImageError = () => {
    if (imgFallbackStep < candidateUrls.length - 1) {
      setImgFallbackStep(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  return (
    <div className="relative shrink-0" style={{ width: dim.outer, height: dim.outer }}>
      {/* Main coin/asset avatar */}
      <div
        className="rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-sm"
        style={{
          width: dim.inner,
          height: dim.inner,
          background: (!imgError && currentImgUrl) ? '#ffffff' : assetStyle.bg,
          color: assetStyle.color,
        }}
      >
        {currentImgUrl && !imgError ? (
          <img
            src={currentImgUrl}
            alt={stock.symbol}
            style={{ width: dim.inner - 4, height: dim.inner - 4, objectFit: 'contain' }}
            onError={handleImageError}
          />
        ) : (
          <CryptoVectorFallback symbol={stock.symbol} size={dim.inner} />
        )}
      </div>

      {/* Exchange badge (bottom-right corner) */}
      {showExchangeBadge && renderExchangeBadge(exchangeCfg, dim.badge, badgeImgError, () => setBadgeImgError(true))}
    </div>
  );
};

/** Helper render huy hiệu góc sàn giao dịch */
const renderExchangeBadge = (
  exchangeCfg: any,
  badgeSize: number,
  badgeImgError: boolean,
  onError: () => void
) => (
  <div
    className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center border border-[#131722] font-black leading-none overflow-hidden shadow-xs"
    style={{
      width: badgeSize,
      height: badgeSize,
      background: exchangeCfg.logoUrl && !badgeImgError ? '#ffffff' : exchangeCfg.bg,
      color: exchangeCfg.color,
      fontSize: badgeSize * 0.45,
    }}
    title={exchangeCfg.label}
  >
    {exchangeCfg.logoUrl && !badgeImgError ? (
      <img
        src={exchangeCfg.logoUrl}
        alt={exchangeCfg.shortLabel}
        className="w-full h-full object-contain p-0.5"
        onError={onError}
      />
    ) : (
      exchangeCfg.shortLabel.slice(0, 2)
    )}
  </div>
);

/** Badge nhỏ hiển thị logo & tên viết tắt của sàn giao dịch */
export const ExchangeBadge = ({ exchange, size = 'sm' }: { exchange: string; size?: 'sm' | 'md' }) => {
  const [badgeErr, setBadgeErr] = useState(false);
  const cfg = getExchangeConfig(exchange);
  const dim = size === 'sm' ? { h: 18, px: 6, font: 9, iconSize: 11 } : { h: 22, px: 8, font: 10, iconSize: 14 };

  return (
    <span
      className="inline-flex items-center gap-1 rounded font-bold uppercase tracking-wide shadow-xs shrink-0"
      style={{
        height: dim.h,
        paddingLeft: dim.px,
        paddingRight: dim.px,
        background: cfg.bg,
        color: cfg.color,
        fontSize: dim.font,
      }}
      title={cfg.label}
    >
      {cfg.logoUrl && !badgeErr && (
        <img
          src={cfg.logoUrl}
          alt={cfg.shortLabel}
          className="rounded-full bg-white/20 p-0.5 object-contain"
          style={{ width: dim.iconSize, height: dim.iconSize }}
          onError={() => setBadgeErr(true)}
        />
      )}
      <span>{cfg.shortLabel}</span>
    </span>
  );
};
