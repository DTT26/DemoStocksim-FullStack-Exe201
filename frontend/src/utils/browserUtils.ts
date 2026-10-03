/**
 * Tiện ích phát hiện môi trường trình duyệt và thiết bị
 */

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
};

/**
 * Kiểm tra xem người dùng có đang mở web bên trong in-app browser của các app như Zalo, Facebook, v.v. không
 */
export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined' || !navigator.userAgent) return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /FBAN|FBAV|Instagram|Line|musical_ly|Bytedance|TikTok|Zalo|MicroMessenger|Snapchat/i.test(ua);
};
