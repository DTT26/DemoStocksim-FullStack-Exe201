export interface FundamentalData {
  symbol: string;
  name: string;
  introduction: string;
  issueDate?: string;
  issuePrice?: string;
  maxSupply?: string;
  circulatingSupply?: string;
  totalSupply?: string;
  marketCap?: string;
  rank?: string;
  fullyDilutedValuation?: string;
  marketDominance?: string;
  allTimeHigh?: string;
  allTimeLow?: string;
  website?: string;
  whitepaper?: string;
  explorer?: string;
}

export const FUNDAMENTAL_DATA: Record<string, FundamentalData> = {
  // --- CRYPTO ---
  'BTCUSDT': {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    introduction: 'Bitcoin là tiền điện tử đầu tiên và được công nhận rộng rãi nhất thế giới. Được ra mắt vào năm 2009 bởi một cá nhân hoặc nhóm sử dụng bí danh Satoshi Nakamoto, nó giới thiệu khái niệm mạng lưới thanh toán phi tập trung ngang hàng (peer-to-peer) hoàn toàn không phụ thuộc vào hệ thống ngân hàng truyền thống.',
    issueDate: '2009-01-03',
    issuePrice: '$0.00',
    maxSupply: '21,000,000 BTC',
    circulatingSupply: '19,750,000 BTC',
    totalSupply: '21,000,000 BTC',
    marketCap: '$1,325,430,000,000',
    website: 'https://bitcoin.org/',
    whitepaper: 'https://bitcoin.org/bitcoin.pdf',
    explorer: 'https://blockchain.info/'
  },
  'ETHUSDT': {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    introduction: 'Ethereum là một hệ thống blockchain mã nguồn mở phi tập trung có tiền điện tử riêng, Ether. ETH hoạt động như một nền tảng cho nhiều loại tiền điện tử khác, cũng như để thực hiện các hợp đồng thông minh phi tập trung. Ethereum lần đầu tiên được Vitalik Buterin mô tả trong một báo cáo năm 2013. Buterin, cùng với những người đồng sáng lập khác, đã bảo đảm được nguồn tài trợ cho dự án trong một đợt bán công khai trực tuyến vào mùa hè năm 2014. Nhóm dự án đã huy động được 18,3 triệu đô la Bitcoin và giá của Ethereum trong Đợt chào bán tiền xu ban đầu (ICO) là 0,311 đô la, với hơn 60 triệu Ether đã được bán. Lấy giá của Ethereum hiện tại, điều này đưa tỷ lệ hoàn vốn đầu tư (ROI) lên mức hàng năm là hơn 270%, về cơ bản là gần gấp bốn lần khoản đầu tư của bạn mỗi năm kể từ mùa hè năm 2014. Ethereum Foundation chính thức ra mắt blockchain vào ngày 30 tháng 7 năm 2015, dưới nguyên mẫu có tên mã là "Frontier". Kể từ đó, đã có một số bản cập nhật mạng lưới — "Constantinople" vào ngày 28 tháng 2 năm 2019, "Istanbul" vào ngày 8 tháng 12 năm 2019, "Muir Glacier" vào ngày 2 tháng 1 năm 2020, "Berlin" vào ngày 14 tháng 4 năm 2021 và gần đây nhất là vào ngày 5 tháng 8 năm 2021, hard fork "London". Mục tiêu được cho là của riêng Ethereum là trở thành một nền tảng toàn cầu cho các ứng dụng phi tập trung, cho phép người dùng từ khắp nơi trên thế giới viết và chạy phần mềm có khả năng chống kiểm duyệt, thời gian ngừng hoạt động và gian lận.',
    issueDate: '2015-07-29 23:00:00',
    issuePrice: '0.311 USDT',
    maxSupply: '-- ETH',
    circulatingSupply: '122,044,301.968694 ETH',
    totalSupply: '122,044,301.968694 ETH',
    marketCap: '303,124,415,336 USDT',
    rank: '#2',
    fullyDilutedValuation: '303,124,415,336 USDT',
    marketDominance: '11.41%',
    allTimeHigh: '4,946.05 USDT',
    allTimeLow: '0.432979 USDT',
    website: 'https://ethereum.org/',
    whitepaper: 'https://ethereum.org/en/whitepaper/',
    explorer: 'https://etherscan.io/'
  },
  'BNBUSDT': {
    symbol: 'BNBUSDT',
    name: 'BNB',
    introduction: 'BNB là đồng tiền điện tử gốc của hệ sinh thái Binance. Được ra mắt thông qua một đợt phát hành tiền ảo lần đầu (ICO) vào năm 2017, ban đầu nó là token ERC-20 trên blockchain Ethereum trước khi chuyển sang Binance Chain (nay là BNB Chain). Nó được dùng để trả phí giao dịch trên sàn Binance, tham gia token sale và hơn thế nữa.',
    issueDate: '2017-07-25',
    issuePrice: '$0.15',
    maxSupply: '200,000,000 BNB',
    circulatingSupply: '147,580,000 BNB',
    totalSupply: '147,580,000 BNB',
    marketCap: '$85,420,000,000',
    website: 'https://www.bnbchain.org/',
    explorer: 'https://bscscan.com/'
  },
  'SOLUSDT': {
    symbol: 'SOLUSDT',
    name: 'Solana',
    introduction: 'Solana là một dự án mã nguồn mở có chức năng cao, dựa vào tính chất không cần cấp phép của công nghệ blockchain để cung cấp các giải pháp tài chính phi tập trung (DeFi). Mạng lưới Solana hướng tới mục tiêu tăng khả năng mở rộng nhờ kết hợp thuật toán đồng thuận Proof of History (PoH) cùng nền tảng Proof of Stake (PoS).',
    issueDate: '2020-03-20',
    issuePrice: '$0.22',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '468,120,000 SOL',
    totalSupply: '582,310,000 SOL',
    marketCap: '$67,310,000,000',
    website: 'https://solana.com/',
    whitepaper: 'https://solana.com/solana-whitepaper.pdf',
    explorer: 'https://solscan.io/'
  },
  'XRPUSDT': {
    symbol: 'XRPUSDT',
    name: 'Ripple',
    introduction: 'XRP là tiền điện tử gốc của XRP Ledger, một mã nguồn mở công khai, phi tập trung mà bất cứ ai cũng có thể đóng góp xây dựng. Mạng lưới này có tốc độ thanh toán nhanh, chi phí giao dịch thấp và có khả năng mở rộng quy mô lớn, hướng đến việc thay thế hệ thống SWIFT trong thanh toán xuyên biên giới.',
    issueDate: '2013-01-01',
    issuePrice: '$0.005',
    maxSupply: '100,000,000,000 XRP',
    circulatingSupply: '56,120,000,000 XRP',
    totalSupply: '99,980,000,000 XRP',
    marketCap: '$32,540,000,000',
    website: 'https://xrpl.org/',
    explorer: 'https://livenet.xrpl.org/'
  },
  'ADAUSDT': {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    introduction: 'Cardano là nền tảng blockchain Proof-of-Stake (PoS) thế hệ thứ 3, được thành lập năm 2015 bởi Charles Hoskinson. Nó được thiết kế thông qua quá trình nghiên cứu khoa học hàn lâm có đánh giá đồng cấp. ADA là token quản trị và dùng để thanh toán phí giao dịch trên mạng.',
    issueDate: '2017-09-29',
    issuePrice: '$0.024',
    maxSupply: '45,000,000,000 ADA',
    circulatingSupply: '35,420,000,000 ADA',
    totalSupply: '36,950,000,000 ADA',
    marketCap: '$16,210,000,000',
    website: 'https://cardano.org/',
    explorer: 'https://cardanoscan.io/'
  },

  // --- FUTURES ---
  'BTCUSDT.P': {
    symbol: 'BTCUSDT.P',
    name: 'Bitcoin Perpetual',
    introduction: 'Hợp đồng Tương lai Không kỳ hạn (Perpetual Futures) BTCUSDT là một sản phẩm phái sinh theo sát giá trị của Bitcoin. Trái với các hợp đồng tương lai truyền thống, nó không có ngày đáo hạn, cho phép người dùng giữ vị thế vô thời hạn dựa trên Funding Rate.',
    issueDate: 'N/A',
    issuePrice: 'N/A',
    maxSupply: 'N/A',
    circulatingSupply: 'N/A',
    totalSupply: 'N/A',
    marketCap: 'N/A',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://www.binance.com/vi/futures/funding-history/0'
  },
  'ETHUSDT.P': {
    symbol: 'ETHUSDT.P',
    name: 'Ethereum Perpetual',
    introduction: 'Hợp đồng Tương lai Không kỳ hạn (Perpetual Futures) ETHUSDT theo sát giá trị của Ethereum. Nó không có ngày đáo hạn, sử dụng cơ chế Funding Rate để giữ giá hợp đồng sát với mức giá thị trường giao ngay.',
    issueDate: 'N/A',
    issuePrice: 'N/A',
    maxSupply: 'N/A',
    circulatingSupply: 'N/A',
    totalSupply: 'N/A',
    marketCap: 'N/A',
    website: 'https://www.binance.com/vi/futures',
  },
  'SOLUSDT.P': {
    symbol: 'SOLUSDT.P',
    name: 'Solana Perpetual',
    introduction: 'Hợp đồng Tương lai Không kỳ hạn SOLUSDT cho phép giao dịch hợp đồng phái sinh dựa trên giá Solana với đòn bẩy cao, không có ngày hết hạn và có tỷ lệ tài trợ (Funding Rate) liên tục.',
    issueDate: 'N/A',
    issuePrice: 'N/A',
    maxSupply: 'N/A',
    circulatingSupply: 'N/A',
    totalSupply: 'N/A',
    marketCap: 'N/A',
    website: 'https://www.binance.com/vi/futures',
  },

  // --- FOREX / GOLD ---
  'XAUUSD': {
    symbol: 'XAUUSD',
    name: 'Gold / US Dollar',
    introduction: 'Cặp tỷ giá XAU/USD thể hiện giá trị của 1 ounce Vàng (Troy ounce) được định giá bằng Đô la Mỹ. Vàng là tài sản trú ẩn an toàn truyền thống và thường biến động dựa trên các yếu tố kinh tế vĩ mô như lạm phát, quyết định lãi suất của FED, và căng thẳng địa chính trị.',
    issueDate: 'N/A',
    issuePrice: 'N/A',
    maxSupply: 'N/A',
    circulatingSupply: 'N/A',
    totalSupply: 'N/A',
    marketCap: 'N/A',
    website: 'https://www.gold.org/',
    explorer: 'https://www.tradingview.com/symbols/XAUUSD/'
  },
  'EURUSD': {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    introduction: 'Cặp tiền tệ EUR/USD là cặp được giao dịch nhiều nhất trên thế giới. Nó đại diện cho số lượng Đô la Mỹ cần thiết để mua một đồng Euro. Biến động của cặp tiền này bị ảnh hưởng chủ yếu bởi các chính sách tiền tệ của Ngân hàng Trung ương Châu Âu (ECB) và Cục Dự trữ Liên bang Mỹ (FED).',
    issueDate: '1999-01-01',
    issuePrice: '1.1795',
    maxSupply: 'N/A',
    circulatingSupply: 'N/A',
    totalSupply: 'N/A',
    marketCap: 'N/A',
    website: 'https://www.ecb.europa.eu/',
    explorer: 'https://www.tradingview.com/symbols/EURUSD/'
  },
};
