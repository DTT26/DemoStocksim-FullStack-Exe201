export type AssetCategory = 'crypto' | 'stock' | 'commodity' | 'forex' | 'index';

export interface FundamentalData {
  symbol: string;
  name: string;
  category?: AssetCategory;
  introduction: string;
  introductionEn?: string;

  // Raw fields for dynamic real-time calculations
  circulatingSupplyRaw?: number;
  maxSupplyRaw?: number;
  totalSupplyRaw?: number;
  sharesOutstandingRaw?: number;
  epsRaw?: number;
  annualDividendPerShareRaw?: number;
  athRaw?: number;
  atlRaw?: number;
  fiftyTwoWeekHighRaw?: number;
  fiftyTwoWeekLowRaw?: number;

  // Crypto metrics
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

  // Stock & Company metrics
  sector?: string;            // Ngành / Lĩnh vực (e.g., Công nghệ thông tin)
  sectorEn?: string;
  industry?: string;          // Ngành chi tiết (e.g., Thiết bị viễn thông & Phần cứng)
  industryEn?: string;
  ceo?: string;               // Tổng Giám Đốc (e.g., Tim Cook)
  headquarters?: string;     // Trụ sở chính (e.g., Cupertino, California, USA)
  founded?: string;           // Năm thành lập
  employees?: string;         // Quy mô nhân viên
  peRatio?: string;           // P/E (TTM)
  pbRatio?: string;           // P/B
  eps?: string;               // EPS (TTM)
  dividendYield?: string;     // Tỷ suất cổ tức
  revenue?: string;           // Doanh thu (TTM)
  netIncome?: string;         // Lợi nhuận ròng (TTM)
  sharesOutstanding?: string; // Số lượng cổ phiếu lưu hành
  fiftyTwoWeekHigh?: string;  // Đỉnh 52 tuần
  fiftyTwoWeekLow?: string;   // Đáy 52 tuần
  exchange?: string;          // Sàn giao dịch chính (NASDAQ, NYSE...)
  investorRelations?: string; // Quan hệ cổ đông (IR)

  // Commodity / Forex / Index metrics
  tradingUnit?: string;       // Đơn vị giao dịch (e.g., 1 Troy Ounce, 100 Barrels)
  baseCurrency?: string;      // Đồng cơ sở (EUR, XAU, USD...)
  quoteCurrency?: string;     // Đồng định giá (USD, JPY...)
  pricingBenchmark?: string;  // Chuẩn định giá / Sàn tham chiếu
  componentsCount?: string;   // Số cổ phiếu thành phần (e.g., 500 công ty)
}

export const FUNDAMENTAL_DATA: Record<string, FundamentalData> = {
  // ==========================================
  // 1. CRYPTO SPOT
  // ==========================================
  'BTCUSDT': {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    category: 'crypto',
    introduction: 'Bitcoin là đồng tiền mã hóa đầu tiên và có giá trị vốn hóa lớn nhất thế giới, được tạo ra vào năm 2009 bởi nhân vật ẩn danh Satoshi Nakamoto. Hoạt động trên giao thức phi tập trung ngang hàng (P2P), Bitcoin giới thiệu thuật toán đồng thuận Proof of Work (PoW) và nguồn cung tối đa cố định 21 triệu đồng, trở thành tài sản lưu trữ giá trị số hàng đầu (thường được ví như "Vàng kỹ thuật số").',
    issueDate: '2009-01-03',
    issuePrice: '$0.0008',
    maxSupply: '21,000,000 BTC',
    circulatingSupply: '19,780,000 BTC',
    totalSupply: '19,780,000 BTC',
    marketCap: '$1,640,000,000,000',
    rank: '#1',
    fullyDilutedValuation: '$1,745,000,000,000',
    marketDominance: '57.8%',
    allTimeHigh: '$108,900.00',
    allTimeLow: '$0.04865',
    website: 'https://bitcoin.org/',
    whitepaper: 'https://bitcoin.org/bitcoin.pdf',
    explorer: 'https://blockchain.info/'
  },
  'ETHUSDT': {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    category: 'crypto',
    introduction: 'Ethereum là mạng lưới blockchain phi tập trung mã nguồn mở tiên phong về Hợp đồng thông minh (Smart Contracts) do Vitalik Buterin đồng sáng lập năm 2014. Ethereum đóng vai trò là nền tảng điện toán toàn cầu cho hàng chục nghìn ứng dụng phi tập trung (DApps), tài chính phi tập trung (DeFi), NFT và các mạng mở rộng Layer 2.',
    issueDate: '2015-07-30',
    issuePrice: '$0.311',
    maxSupply: 'Không giới hạn (Cơ chế đốt EIP-1559)',
    circulatingSupply: '120,450,000 ETH',
    totalSupply: '120,450,000 ETH',
    marketCap: '$321,500,000,000',
    rank: '#2',
    fullyDilutedValuation: '$321,500,000,000',
    marketDominance: '13.8%',
    allTimeHigh: '$4,891.70',
    allTimeLow: '$0.4208',
    website: 'https://ethereum.org/',
    whitepaper: 'https://ethereum.org/en/whitepaper/',
    explorer: 'https://etherscan.io/'
  },
  'BNBUSDT': {
    symbol: 'BNBUSDT',
    name: 'BNB',
    category: 'crypto',
    introduction: 'BNB là đồng tiền điện tử gốc cung cấp năng lượng cho hệ sinh thái BNB Chain và sàn giao dịch tiền mã hóa Binance. Ban đầu ra mắt dưới dạng token ERC-20 vào năm 2017, BNB được sử dụng để giảm phí giao dịch, thanh toán phí gas trên BNB Smart Chain, tham gia Launchpool và cơ chế đốt token định kỳ Auto-Burn.',
    issueDate: '2017-07-25',
    issuePrice: '$0.15',
    maxSupply: '200,000,000 BNB',
    circulatingSupply: '144,350,000 BNB',
    totalSupply: '144,350,000 BNB',
    marketCap: '$109,600,000,000',
    rank: '#4',
    fullyDilutedValuation: '$109,600,000,000',
    marketDominance: '3.85%',
    allTimeHigh: '$720.67',
    allTimeLow: '$0.0961',
    website: 'https://www.bnbchain.org/',
    whitepaper: 'https://www.binance.com/resources/ico/Binance_WhitePaper_en.pdf',
    explorer: 'https://bscscan.com/'
  },
  'SOLUSDT': {
    symbol: 'SOLUSDT',
    name: 'Solana',
    category: 'crypto',
    introduction: 'Solana là blockchain Layer 1 hiệu năng cực cao, thiết kế nhằm cung cấp khả năng mở rộng hàng chục nghìn giao dịch mỗi giây với chi phí siêu rẻ. Nhờ kết hợp thuật toán Proof of History (PoH) cùng Proof of Stake (PoS), Solana trở thành hệ sinh thái bùng nổ cho DeFi, Memecoin, NFT và DePIN.',
    issueDate: '2020-03-20',
    issuePrice: '$0.22',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '471,200,000 SOL',
    totalSupply: '588,500,000 SOL',
    marketCap: '$55,670,000,000',
    rank: '#5',
    fullyDilutedValuation: '$69,500,000,000',
    marketDominance: '2.8%',
    allTimeHigh: '$260.06',
    allTimeLow: '$0.505',
    website: 'https://solana.com/',
    whitepaper: 'https://solana.com/solana-whitepaper.pdf',
    explorer: 'https://solscan.io/'
  },
  'XRPUSDT': {
    symbol: 'XRPUSDT',
    name: 'Ripple',
    category: 'crypto',
    introduction: 'XRP là tài sản kỹ thuật số độc lập vận hành trên mạng sổ cái XRP Ledger mã nguồn mở, được xây dựng để tạo điều kiện chuyển tiền và thanh toán xuyên biên giới với tốc độ từ 3-5 giây và chi phí gần như bằng không. XRP được phát triển cùng với giải pháp thanh toán liên ngân hàng RippleNet.',
    issueDate: '2012-08-01',
    issuePrice: '$0.005',
    maxSupply: '100,000,000,000 XRP',
    circulatingSupply: '57,180,000,000 XRP',
    totalSupply: '99,987,000,000 XRP',
    marketCap: '$85,000,000,000',
    rank: '#3',
    fullyDilutedValuation: '$148,600,000,000',
    marketDominance: '3.1%',
    allTimeHigh: '$3.84',
    allTimeLow: '$0.0028',
    website: 'https://xrpl.org/',
    whitepaper: 'https://ripple.com/files/ripple_consensus_whitepaper.pdf',
    explorer: 'https://livenet.xrpl.org/'
  },
  'ADAUSDT': {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    category: 'crypto',
    introduction: 'Cardano là nền tảng blockchain Proof-of-Stake thế hệ thứ ba được thành lập vào năm 2015 bởi Charles Hoskinson (đồng sáng lập Ethereum). Kiến trúc của Cardano được phát triển dựa trên phương pháp nghiên cứu học thuật có bình duyệt (peer-reviewed research) và ngôn ngữ Haskell hướng tới độ bảo mật tối đa.',
    issueDate: '2017-09-29',
    issuePrice: '$0.024',
    maxSupply: '45,000,000,000 ADA',
    circulatingSupply: '35,760,000,000 ADA',
    totalSupply: '37,280,000,000 ADA',
    marketCap: '$8,620,000,000',
    rank: '#11',
    fullyDilutedValuation: '$10,850,000,000',
    marketDominance: '0.45%',
    allTimeHigh: '$3.10',
    allTimeLow: '$0.0173',
    website: 'https://cardano.org/',
    whitepaper: 'https://cardano.org/research/',
    explorer: 'https://cardanoscan.io/'
  },
  'DOGEUSDT': {
    symbol: 'DOGEUSDT',
    name: 'Dogecoin',
    category: 'crypto',
    introduction: 'Dogecoin là đồng memecoin đầu tiên và nổi tiếng nhất trong lịch sử tiền mã hóa, được tạo ra vào tháng 12 năm 2013 bởi Billy Markus và Jackson Palmer dựa trên meme chú chó Shiba Inu. Nhờ cộng đồng nhiệt thành và sự ủng hộ mạnh mẽ từ tỷ phú Elon Musk, DOGE đã trở thành phương tiện thanh toán P2P phổ biến với phí giao dịch thấp.',
    issueDate: '2013-12-06',
    issuePrice: '$0.0005',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '147,200,000,000 DOGE',
    totalSupply: '147,200,000,000 DOGE',
    marketCap: '$13,620,000,000',
    rank: '#8',
    fullyDilutedValuation: '$13,620,000,000',
    marketDominance: '0.72%',
    allTimeHigh: '$0.7376',
    allTimeLow: '$0.000085',
    website: 'https://dogecoin.com/',
    whitepaper: 'https://github.com/dogecoin/dogecoin',
    explorer: 'https://dogechain.info/'
  },
  'DOTUSDT': {
    symbol: 'DOTUSDT',
    name: 'Polkadot',
    category: 'crypto',
    introduction: 'Polkadot là mạng lưới blockchain đa chuỗi (multi-chain) kết nối các blockchain chuyên biệt khác nhau (Parachains) vào một mạng lưới thống nhất, bảo mật chung thông qua Relay Chain. Dự án được sáng lập bởi Tiến sĩ Gavin Wood, cựu CTO kiêm đồng sáng lập Ethereum.',
    issueDate: '2020-05-26',
    issuePrice: '$2.90',
    maxSupply: 'Không giới hạn (Lạm phát cố định)',
    circulatingSupply: '1,440,000,000 DOT',
    totalSupply: '1,510,000,000 DOT',
    marketCap: '$1,670,000,000',
    rank: '#25',
    fullyDilutedValuation: '$1,750,000,000',
    marketDominance: '0.12%',
    allTimeHigh: '$55.00',
    allTimeLow: '$1.05',
    website: 'https://polkadot.network/',
    whitepaper: 'https://polkadot.network/PolkaDotPaper.pdf',
    explorer: 'https://polkascan.io/'
  },
  'LINKUSDT': {
    symbol: 'LINKUSDT',
    name: 'Chainlink',
    category: 'crypto',
    introduction: 'Chainlink là mạng lưới Oracle phi tập trung tiêu chuẩn công nghiệp kết nối các hợp đồng thông minh blockchain với các nguồn cấp dữ liệu trong thế giới thực, API web và thanh toán ngân hàng truyền thống. Đồng thời giải pháp CCIP (Cross-Chain Interoperability Protocol) giúp kết nối các tổ chức tài chính với Web3.',
    issueDate: '2017-09-19',
    issuePrice: '$0.11',
    maxSupply: '1,000,000,000 LINK',
    circulatingSupply: '626,800,000 LINK',
    totalSupply: '1,000,000,000 LINK',
    marketCap: '$8,890,000,000',
    rank: '#14',
    fullyDilutedValuation: '$14,190,000,000',
    marketDominance: '0.48%',
    allTimeHigh: '$52.88',
    allTimeLow: '$0.126',
    website: 'https://chain.link/',
    whitepaper: 'https://chain.link/whitepaper',
    explorer: 'https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca'
  },
  'SUIUSDT': {
    symbol: 'SUIUSDT',
    name: 'Sui Network',
    category: 'crypto',
    introduction: 'Sui là nền tảng blockchain Layer 1 hiệu năng cao, được thiết kế từ đầu bởi Mysten Labs gồm các cựu kỹ sư trưởng dự án Diem/Libra của Meta. Sui sử dụng mô hình dữ liệu hướng đối tượng (Object-centric) và ngôn ngữ lập trình Sui Move, cho phép thực thi giao dịch song song với độ trễ dưới 1 giây.',
    issueDate: '2023-05-03',
    issuePrice: '$0.10',
    maxSupply: '10,000,000,000 SUI',
    circulatingSupply: '2,850,000,000 SUI',
    totalSupply: '10,000,000,000 SUI',
    marketCap: '$6,120,000,000',
    rank: '#18',
    fullyDilutedValuation: '$21,500,000,000',
    marketDominance: '0.33%',
    allTimeHigh: '$3.93',
    allTimeLow: '$0.364',
    website: 'https://sui.io/',
    whitepaper: 'https://docs.sui.io/paper/sui.pdf',
    explorer: 'https://suiscan.xyz/'
  },
  'NEARUSDT': {
    symbol: 'NEARUSDT',
    name: 'NEAR Protocol',
    category: 'crypto',
    introduction: 'NEAR Protocol là blockchain Layer 1 sharded thân thiện với người dùng và nhà phát triển, ứng dụng công nghệ phân mảnh Nightshade và cơ chế đồng thuận Doomslug. Gần đây NEAR tích cực đẩy mạnh hệ sinh thái User-Owned AI, cho phép xây dựng các AI Agent phi tập trung.',
    issueDate: '2020-04-22',
    issuePrice: '$0.038',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '1,218,000,000 NEAR',
    totalSupply: '1,250,000,000 NEAR',
    marketCap: '$2,900,000,000',
    rank: '#29',
    fullyDilutedValuation: '$2,980,000,000',
    marketDominance: '0.15%',
    allTimeHigh: '$20.42',
    allTimeLow: '$0.526',
    website: 'https://near.org/',
    whitepaper: 'https://near.org/papers/the-official-near-white-paper',
    explorer: 'https://nearblocks.io/'
  },
  'AVAXUSDT': {
    symbol: 'AVAXUSDT',
    name: 'Avalanche',
    category: 'crypto',
    introduction: 'Avalanche là nền tảng hợp đồng thông minh Layer 1 được phát triển bởi Ava Labs do Giáo sư Emin Gün Sirer sáng lập. Sử dụng cơ chế đồng thuận Avalanche độc quyền và kiến trúc mạng lưới con (Subnets), Avalanche có tốc độ xác thực tức thì (dưới 1 giây) và khả năng mở rộng vô hạn cho ứng dụng tổ chức.',
    issueDate: '2020-09-21',
    issuePrice: '$0.50',
    maxSupply: '720,000,000 AVAX',
    circulatingSupply: '410,500,000 AVAX',
    totalSupply: '450,000,000 AVAX',
    marketCap: '$4,200,000,000',
    rank: '#23',
    fullyDilutedValuation: '$7,380,000,000',
    marketDominance: '0.22%',
    allTimeHigh: '$146.22',
    allTimeLow: '$2.79',
    website: 'https://www.avax.network/',
    whitepaper: 'https://www.avalabs.org/whitepapers',
    explorer: 'https://snowtrace.io/'
  },
  'APTUSDT': {
    symbol: 'APTUSDT',
    name: 'Aptos',
    category: 'crypto',
    introduction: 'Aptos là blockchain Layer 1 được sáng lập bởi Aptos Labs (gồm các cựu kỹ sư nòng cốt của dự án Diem từ Meta). Nền tảng tận dụng ngôn ngữ Move và công cụ thực thi Block-STM song song, mang đến khả năng mở rộng vượt trội, độ tin cậy và an toàn cao cho tài sản số.',
    issueDate: '2022-10-18',
    issuePrice: '$1.00',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '518,000,000 APT',
    totalSupply: '1,120,000,000 APT',
    marketCap: '$2,510,000,000',
    rank: '#33',
    fullyDilutedValuation: '$5,430,000,000',
    marketDominance: '0.13%',
    allTimeHigh: '$19.90',
    allTimeLow: '$3.09',
    website: 'https://aptoslabs.com/',
    whitepaper: 'https://aptos.dev/assets/files/Aptos-Whitepaper-47099b4b567e4582f05b49f6e371f760.pdf',
    explorer: 'https://aptoscan.com/'
  },
  'ARBUSDT': {
    symbol: 'ARBUSDT',
    name: 'Arbitrum',
    category: 'crypto',
    introduction: 'Arbitrum là giải pháp mở rộng Layer 2 hàng đầu dành cho mạng lưới Ethereum, sử dụng công nghệ Optimistic Rollup để tăng tốc độ giao dịch gấp hàng chục lần và giảm phí gas tới 95% trong khi vẫn thừa hưởng trọn vẹn tính bảo mật gốc của Ethereum.',
    issueDate: '2023-03-23',
    issuePrice: '$0.10',
    maxSupply: '10,000,000,000 ARB',
    circulatingSupply: '4,150,000,000 ARB',
    totalSupply: '10,000,000,000 ARB',
    marketCap: '$1,590,000,000',
    rank: '#48',
    fullyDilutedValuation: '$3,850,000,000',
    marketDominance: '0.08%',
    allTimeHigh: '$2.40',
    allTimeLow: '$0.342',
    website: 'https://arbitrum.io/',
    whitepaper: 'https://docs.arbitrum.io/',
    explorer: 'https://arbiscan.io/'
  },
  'OPUSDT': {
    symbol: 'OPUSDT',
    name: 'Optimism',
    category: 'crypto',
    introduction: 'Optimism (OP Mainnet) là giải pháp Layer 2 tốc độ cao và chi phí thấp cho Ethereum. Dự án tiên phong kiến trúc OP Stack - khuôn khổ phần mềm mã nguồn mở cho phép các chuỗi Layer 2 liên kết với nhau tạo thành mạng lưới "Superchain" (như Base, Zora, World Chain).',
    issueDate: '2022-05-31',
    issuePrice: '$0.50',
    maxSupply: '4,294,967,296 OP',
    circulatingSupply: '1,255,000,000 OP',
    totalSupply: '4,294,967,296 OP',
    marketCap: '$960,000,000',
    rank: '#58',
    fullyDilutedValuation: '$3,280,000,000',
    marketDominance: '0.05%',
    allTimeHigh: '$4.85',
    allTimeLow: '$0.40',
    website: 'https://www.optimism.io/',
    whitepaper: 'https://community.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/'
  },
  'TIAUSDT': {
    symbol: 'TIAUSDT',
    name: 'Celestia',
    category: 'crypto',
    introduction: 'Celestia là mạng lưới blockchain mô-đun (modular blockchain) đầu tiên trên thế giới, tập trung tối ưu hóa lớp dữ liệu sẵn có (Data Availability - DA). Kiến trúc tách biệt lớp thực thi và lớp đồng thuận giúp bất kỳ ai cũng có thể dễ dàng khởi chạy một blockchain riêng chỉ trong vài phút.',
    issueDate: '2023-10-31',
    issuePrice: '$2.00',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '425,000,000 TIA',
    totalSupply: '1,080,000,000 TIA',
    marketCap: '$1,460,000,000',
    rank: '#52',
    fullyDilutedValuation: '$3,720,000,000',
    marketDominance: '0.07%',
    allTimeHigh: '$20.91',
    allTimeLow: '$2.03',
    website: 'https://celestia.org/',
    whitepaper: 'https://celestia.org/resources/',
    explorer: 'https://celestiascan.com/'
  },
  'TONUSDT': {
    symbol: 'TONUSDT',
    name: 'Toncoin',
    category: 'crypto',
    introduction: 'The Open Network (TON) là blockchain Layer 1 thế hệ mới ban đầu do hai anh em Nikolai và Pavel Durov (những người sáng lập Telegram) thiết kế. TON sở hữu khả năng xử lý hàng triệu giao dịch mỗi giây nhờ phân mảnh động (Dynamic Sharding) và tích hợp sâu trực tiếp vào ứng dụng Telegram với hơn 900 triệu người dùng.',
    issueDate: '2021-08-26',
    issuePrice: '$0.50',
    maxSupply: 'Không giới hạn',
    circulatingSupply: '2,540,000,000 TON',
    totalSupply: '5,115,000,000 TON',
    marketCap: '$9,520,000,000',
    rank: '#12',
    fullyDilutedValuation: '$19,180,000,000',
    marketDominance: '0.52%',
    allTimeHigh: '$8.24',
    allTimeLow: '$0.39',
    website: 'https://ton.org/',
    whitepaper: 'https://ton.org/whitepaper.pdf',
    explorer: 'https://tonscan.org/'
  },
  'INJUSDT': {
    symbol: 'INJUSDT',
    name: 'Injective',
    category: 'crypto',
    introduction: 'Injective là blockchain Layer 1 được xây dựng chuyên biệt và tối ưu hóa tối đa cho các ứng dụng tài chính và sàn giao dịch phái sinh thế hệ mới. Nền tảng tích hợp sẵn mô-đun sổ lệnh trên chuỗi (On-chain Orderbook) kháng MEV và hỗ trợ khả năng tương tác đa chuỗi rộng lớn với Cosmos, Ethereum và Solana.',
    issueDate: '2020-10-21',
    issuePrice: '$0.40',
    maxSupply: '100,000,000 INJ',
    circulatingSupply: '99,850,000 INJ',
    totalSupply: '100,000,000 INJ',
    marketCap: '$1,280,000,000',
    rank: '#55',
    fullyDilutedValuation: '$1,285,000,000',
    marketDominance: '0.06%',
    allTimeHigh: '$52.75',
    allTimeLow: '$0.65',
    website: 'https://injective.com/',
    whitepaper: 'https://injective.com/injective_hub_paper.pdf',
    explorer: 'https://explorer.injective.network/'
  },
  'RENDERUSDT': {
    symbol: 'RENDERUSDT',
    name: 'Render Token',
    category: 'crypto',
    introduction: 'Render Network là mạng lưới tính toán và kết xuất đồ họa GPU phi tập trung hàng đầu, kết nối những nhà sáng tạo nội dung 3D/AI với những người sở hữu GPU nhàn rỗi trên toàn thế giới. Render là dự án hạ tầng phần cứng DePIN trọng yếu phục vụ công nghệ AI tạo sinh, Metaverse và hiệu ứng điện ảnh.',
    issueDate: '2020-06-11',
    issuePrice: '$0.25',
    maxSupply: '532,000,000 RENDER',
    circulatingSupply: '518,200,000 RENDER',
    totalSupply: '532,000,000 RENDER',
    marketCap: '$1,890,000,000',
    rank: '#42',
    fullyDilutedValuation: '$1,940,000,000',
    marketDominance: '0.09%',
    allTimeHigh: '$13.60',
    allTimeLow: '$0.036',
    website: 'https://rendernetwork.com/',
    whitepaper: 'https://rendernetwork.com/knowledge-base',
    explorer: 'https://solscan.io/token/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof'
  },
  'WIFUSDT': {
    symbol: 'WIFUSDT',
    name: 'dogwifhat',
    category: 'crypto',
    introduction: 'dogwifhat (WIF) là đồng memecoin mang tính biểu tượng trên hệ sinh thái Solana, lấy cảm hứng từ hình ảnh chú chó Shiba Inu đội chiếc mũ len màu hồng. Dự án đại diện cho văn hóa internet thuần túy không có thuế giao dịch, 100% hướng về cộng đồng.',
    issueDate: '2023-11-20',
    issuePrice: '$0.001',
    maxSupply: '998,900,000 WIF',
    circulatingSupply: '998,900,000 WIF',
    totalSupply: '998,900,000 WIF',
    marketCap: '$584,000,000',
    rank: '#72',
    fullyDilutedValuation: '$584,000,000',
    marketDominance: '0.03%',
    allTimeHigh: '$4.85',
    allTimeLow: '$0.0015',
    website: 'https://dogwifcoin.org/',
    explorer: 'https://solscan.io/token/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'
  },
  'SEIUSDT': {
    symbol: 'SEIUSDT',
    name: 'Sei',
    category: 'crypto',
    introduction: 'Sei Network là blockchain Layer 1 mã nguồn mở được tối ưu hóa chuyên biệt cho tốc độ giao dịch với cơ chế đồng thuận Twin-Turbo đạt thời gian hoàn tất khối chỉ khoảng 390ms. Sei V2 bổ sung khả năng tương thích máy ảo Ethereum (Parallelized EVM) song song đầu tiên.',
    issueDate: '2023-08-15',
    issuePrice: '$0.06',
    maxSupply: '10,000,000,000 SEI',
    circulatingSupply: '4,450,000,000 SEI',
    totalSupply: '10,000,000,000 SEI',
    marketCap: '$956,000,000',
    rank: '#59',
    fullyDilutedValuation: '$2,150,000,000',
    marketDominance: '0.05%',
    allTimeHigh: '$1.14',
    allTimeLow: '$0.095',
    website: 'https://www.sei.io/',
    whitepaper: 'https://docs.sei.io/',
    explorer: 'https://seitrace.com/'
  },
  'MATICUSDT': {
    symbol: 'MATICUSDT',
    name: 'Polygon',
    category: 'crypto',
    introduction: 'Polygon là nền tảng công nghệ blockchain mở rộng hàng đầu cho Ethereum, cung cấp mạng Polygon PoS và công nghệ ZK-Rollup (Polygon zkEVM). Mạng lưới đang chuyển đổi token quản trị sang POL để làm động lực cho kiến trúc AggLayer kết nối thanh khoản đa chuỗi.',
    issueDate: '2019-04-26',
    issuePrice: '$0.00263',
    maxSupply: '10,000,000,000 POL',
    circulatingSupply: '9,950,000,000 POL',
    totalSupply: '10,000,000,000 POL',
    marketCap: '$3,770,000,000',
    rank: '#28',
    fullyDilutedValuation: '$3,790,000,000',
    marketDominance: '0.19%',
    allTimeHigh: '$2.92',
    allTimeLow: '$0.003',
    website: 'https://polygon.technology/',
    whitepaper: 'https://polygon.technology/papers',
    explorer: 'https://polygonscan.com/'
  },
  'LDOUSDT': {
    symbol: 'LDOUSDT',
    name: 'Lido DAO',
    category: 'crypto',
    introduction: 'Lido là giao thức Liquid Staking phi tập trung lớn nhất trên thế giới. Người dùng có thể khóa đồng Ethereum của mình để nhận token thanh khoản stETH, vừa kiếm được lợi suất staking từ chuỗi khối vừa có thể tham gia vào các ứng dụng DeFi mà không bị giam vốn.',
    issueDate: '2020-12-19',
    issuePrice: '$1.50',
    maxSupply: '1,000,000,000 LDO',
    circulatingSupply: '895,000,000 LDO',
    totalSupply: '1,000,000,000 LDO',
    marketCap: '$398,000,000',
    rank: '#92',
    fullyDilutedValuation: '$445,000,000',
    marketDominance: '0.02%',
    allTimeHigh: '$7.30',
    allTimeLow: '$0.40',
    website: 'https://lido.fi/',
    whitepaper: 'https://lido.fi/static/Lido:Ethereum-Liquid-Staking.pdf',
    explorer: 'https://etherscan.io/token/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'
  },
  'SHIBUSDT': {
    symbol: 'SHIBUSDT',
    name: 'Shiba Inu',
    category: 'crypto',
    introduction: 'Shiba Inu là đồng tiền mã hóa phi tập trung ra mắt vào tháng 8 năm 2020 bởi tác giả ẩn danh Ryoshi. Ban đầu là một memecoin đối trọng với Dogecoin, hiện SHIB đã phát triển thành một hệ sinh thái rộng lớn gồm sàn phi tập trung ShibaSwap, mạng lưới Layer 2 Shibarium và bộ sưu tập Shiboshis.',
    issueDate: '2020-08-01',
    issuePrice: '$0.0000000001',
    maxSupply: 'Không giới hạn (đã đốt 41% sang ví Vitalik)',
    circulatingSupply: '589,200,000,000,000 SHIB',
    totalSupply: '589,500,000,000,000 SHIB',
    marketCap: '$3,300,000,000',
    rank: '#26',
    fullyDilutedValuation: '$3,300,000,000',
    marketDominance: '0.18%',
    allTimeHigh: '$0.000088',
    allTimeLow: '$0.00000000005',
    website: 'https://shib.io/',
    whitepaper: 'https://shibatoken.com/shiba-woof-paper',
    explorer: 'https://etherscan.io/token/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce'
  },
  'TRXUSDT': {
    symbol: 'TRXUSDT',
    name: 'TRON',
    category: 'crypto',
    introduction: 'TRON là hệ sinh thái blockchain dựa trên cơ chế đồng thuận Delegated Proof-of-Stake (DPoS) do Justin Sun sáng lập vào năm 2017. TRON là mạng lưới vận chuyển và lưu thông đồng stablecoin USDT lớn nhất toàn cầu với hơn 60 tỷ USD tài sản lưu ký và hàng chục triệu giao dịch mỗi ngày.',
    issueDate: '2017-09-13',
    issuePrice: '$0.0019',
    maxSupply: 'Không giới hạn (Cơ chế giảm phát theo phí)',
    circulatingSupply: '86,300,000,000 TRX',
    totalSupply: '86,300,000,000 TRX',
    marketCap: '$28,820,000,000',
    rank: '#9',
    fullyDilutedValuation: '$28,820,000,000',
    marketDominance: '1.42%',
    allTimeHigh: '$0.44',
    allTimeLow: '$0.00109',
    website: 'https://tron.network/',
    whitepaper: 'https://tron.network/static/doc/white_paper_v_2_0.pdf',
    explorer: 'https://tronscan.org/'
  },

  // ==========================================
  // 2. CRYPTO FUTURES PERPETUAL
  // ==========================================
  'BTCUSDT.P': {
    symbol: 'BTCUSDT.P',
    name: 'Bitcoin Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Không kỳ hạn (Perpetual Futures) BTCUSDT theo sát biến động giá của Bitcoin giao ngay. Sản phẩm này cho phép nhà đầu tư giao dịch 2 chiều Long/Short với đòn bẩy lên tới 125x, không bao giờ đáo hạn và sử dụng cơ chế Funding Rate định kỳ 8 giờ một lần.',
    issueDate: '2019-09-08',
    issuePrice: '$10,200',
    maxSupply: '21,000,000 BTC',
    circulatingSupply: '19,780,000 BTC',
    totalSupply: '19,780,000 BTC',
    marketCap: '$1,640,000,000,000',
    rank: '#1 (Phái sinh)',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://www.binance.com/vi/futures/funding-history/0'
  },
  'ETHUSDT.P': {
    symbol: 'ETHUSDT.P',
    name: 'Ethereum Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Không kỳ hạn ETHUSDT cho phép giao dịch chỉ số giá Ethereum với đòn bẩy tối đa 100x. Hợp đồng thanh toán bằng đồng USDT, thanh khoản siêu sâu và neo sát theo giá giao ngay nhờ cơ chế Funding Rate.',
    issueDate: '2019-11-28',
    issuePrice: '$150.00',
    circulatingSupply: '120,450,000 ETH',
    marketCap: '$321,500,000,000',
    rank: '#2 (Phái sinh)',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://etherscan.io/'
  },
  'SOLUSDT.P': {
    symbol: 'SOLUSDT.P',
    name: 'Solana Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Vĩnh viễn SOLUSDT cho phép nhà giao dịch tiếp cận tỷ suất sinh lời vượt trội với tài sản Solana, hỗ trợ đòn bẩy lên tới 75x, phục vụ cả mục tiêu đầu cơ lướt sóng và phòng ngừa rủi ro danh mục (Hedging).',
    issueDate: '2020-09-15',
    issuePrice: '$2.50',
    circulatingSupply: '471,200,000 SOL',
    marketCap: '$55,670,000,000',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://solscan.io/'
  },
  'SUIUSDT.P': {
    symbol: 'SUIUSDT.P',
    name: 'Sui Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Phái sinh Vĩnh viễn SUIUSDT mô phỏng giá thị trường của token Sui, cung cấp đòn bẩy tối đa 50x và thanh khoản tập trung từ mạng lưới các sàn giao dịch hàng đầu thế giới.',
    issueDate: '2023-05-03',
    circulatingSupply: '2,850,000,000 SUI',
    marketCap: '$6,120,000,000',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://suiscan.xyz/'
  },
  'NEARUSDT.P': {
    symbol: 'NEARUSDT.P',
    name: 'Near Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Vĩnh viễn NEARUSDT cho phép giao dịch hợp đồng ký quỹ bằng USDT theo giá của NEAR Protocol, hỗ trợ đòn bẩy lên tới 50x không có ngày đáo hạn.',
    issueDate: '2020-10-15',
    circulatingSupply: '1,218,000,000 NEAR',
    marketCap: '$2,900,000,000',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://nearblocks.io/'
  },
  '1000PEPEUSDT.P': {
    symbol: '1000PEPEUSDT.P',
    name: '1000Pepe Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Vĩnh viễn 1000PEPEUSDT đại diện cho lô 1.000 token Pepe (đồng memecoin chú ếch xanh nổi tiếng trên Ethereum). Hợp đồng gộp này giúp việc định giá và tính toán số bước giá trở nên thuận tiện hơn cho nhà giao dịch.',
    issueDate: '2023-05-05',
    issuePrice: '$0.001',
    maxSupply: '420,690,000,000 PEPE',
    circulatingSupply: '420,690,000,000 PEPE',
    marketCap: '$4,150,000,000',
    rank: '#24',
    website: 'https://pepe.vip/',
    explorer: 'https://etherscan.io/token/0x6982508145454ce325ddbe47a25d4ec3d2311933'
  },
  'AVAXUSDT.SWAP': {
    symbol: 'AVAXUSDT.SWAP',
    name: 'Avalanche Swap Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Hoán đổi Vĩnh viễn (Perpetual Swap) AVAXUSDT theo chuẩn OKX/Binance, hỗ trợ đòn bẩy lên tới 75x với thanh khoản phái sinh sâu rộng cho mạng lưới Avalanche.',
    issueDate: '2020-09-25',
    circulatingSupply: '410,500,000 AVAX',
    marketCap: '$4,200,000,000',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://snowtrace.io/'
  },
  'XRPUSDT.P': {
    symbol: 'XRPUSDT.P',
    name: 'Ripple Perpetual Futures',
    category: 'crypto',
    introduction: 'Hợp đồng Tương lai Vĩnh viễn XRPUSDT neo theo giá thị trường của Ripple (XRP), cho phép mở vị thế đòn bẩy lên đến 50x cả hai chiều Mua (Long) và Bán (Short).',
    issueDate: '2020-01-06',
    circulatingSupply: '57,180,000,000 XRP',
    marketCap: '$85,000,000,000',
    website: 'https://www.binance.com/vi/futures',
    explorer: 'https://xrpl.org/'
  },

  // ==========================================
  // 3. CỔ PHIẾU MỸ (US BIG TECH & BLUECHIPS)
  // ==========================================
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stock',
    sector: 'Công nghệ thông tin',
    industry: 'Thiết bị điện tử tiêu dùng & Phần cứng',
    ceo: 'Tim Cook',
    headquarters: 'Cupertino, California, USA',
    founded: '1976',
    employees: '~164,000',
    exchange: 'NASDAQ',
    marketCap: '$5,240,000,000,000',
    peRatio: '34.2x',
    pbRatio: '48.5x',
    eps: '$6.61',
    dividendYield: '0.52%',
    revenue: '$391.0B (TTM)',
    netIncome: '$93.7B (TTM)',
    sharesOutstanding: '15.3B',
    fiftyTwoWeekHigh: '$348.00',
    fiftyTwoWeekLow: '$164.08',
    website: 'https://www.apple.com/',
    investorRelations: 'https://investor.apple.com/',
    introduction: 'Apple Inc. là tập đoàn công nghệ đa quốc gia hàng đầu thế giới, chuyên thiết kế, phát triển và bán thiết bị điện tử tiêu dùng (iPhone, Mac, iPad, Apple Watch, AirPods), phần mềm (iOS, macOS) và chuỗi dịch vụ số (App Store, iCloud, Apple Pay, Apple Music). Apple là công ty đại chúng có giá trị vốn hóa lớn nhất lịch sử tài chính toàn cầu.'
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'stock',
    sector: 'Công nghệ thông tin',
    industry: 'Phần mềm cơ sở hạ tầng & Đám mây',
    ceo: 'Satya Nadella',
    headquarters: 'Redmond, Washington, USA',
    founded: '1975',
    employees: '~228,000',
    exchange: 'NASDAQ',
    marketCap: '$3,850,000,000,000',
    peRatio: '36.8x',
    pbRatio: '12.1x',
    eps: '$11.80',
    dividendYield: '0.72%',
    revenue: '$245.1B (TTM)',
    netIncome: '$88.1B (TTM)',
    sharesOutstanding: '7.44B',
    fiftyTwoWeekHigh: '$525.00',
    fiftyTwoWeekLow: '$385.00',
    website: 'https://www.microsoft.com/',
    investorRelations: 'https://www.microsoft.com/en-us/investor',
    introduction: 'Microsoft Corporation là gã khổng lồ phần mềm và điện toán đám mây toàn cầu. Hãng sở hữu hệ điều hành Windows, gói giải pháp văn phòng Microsoft 365/Office, nền tảng điện toán đám mây Microsoft Azure số 2 thế giới, mạng lưới chuyên gia LinkedIn, thương hiệu máy chơi game Xbox và vị thế dẫn đầu trong làn sóng Trí tuệ Nhân tạo thông qua liên minh chiến lược với OpenAI.'
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'stock',
    sector: 'Hàng tiêu dùng không thiết yếu',
    industry: 'Sản xuất ô tô điện & Năng lượng tái tạo',
    ceo: 'Elon Musk',
    headquarters: 'Austin, Texas, USA',
    founded: '2003',
    employees: '~127,000',
    exchange: 'NASDAQ',
    marketCap: '$1,180,000,000,000',
    peRatio: '82.5x',
    pbRatio: '14.8x',
    eps: '$2.45',
    dividendYield: '0.00%',
    revenue: '$97.1B (TTM)',
    netIncome: '$15.0B (TTM)',
    sharesOutstanding: '3.19B',
    fiftyTwoWeekHigh: '$488.54',
    fiftyTwoWeekLow: '$138.80',
    website: 'https://www.tesla.com/',
    investorRelations: 'https://ir.tesla.com/',
    introduction: 'Tesla, Inc. là công ty sản xuất xe điện (Model S, 3, X, Y, Cybertruck) và công nghệ năng lượng sạch hàng đầu thế giới do tỷ phú Elon Musk điều hành. Tesla cũng phát triển công nghệ tự lái hoàn toàn (FSD), robot hình người Optimus và các hệ thống lưu trữ năng lượng pin mặt trời quy mô lưới điện (Megapack).'
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    category: 'stock',
    sector: 'Chất bán dẫn',
    industry: 'Vi xử lý GPU & Nền tảng Điện toán AI',
    ceo: 'Jensen Huang',
    headquarters: 'Santa Clara, California, USA',
    founded: '1993',
    employees: '~30,000',
    exchange: 'NASDAQ',
    marketCap: '$3,500,000,000,000',
    peRatio: '48.6x',
    pbRatio: '42.0x',
    eps: '$2.95',
    dividendYield: '0.05%',
    revenue: '$96.3B (TTM)',
    netIncome: '$53.0B (TTM)',
    sharesOutstanding: '24.5B',
    fiftyTwoWeekHigh: '$235.00',
    fiftyTwoWeekLow: '$75.60',
    website: 'https://www.nvidia.com/',
    investorRelations: 'https://investor.nvidia.com/',
    introduction: 'NVIDIA Corporation là công ty bán dẫn và công nghệ đồ họa dẫn đầu cuộc cách mạng Trí tuệ Nhân tạo toàn cầu. Các dòng chip tăng tốc đồ họa GPU của hãng (như H100, H200, B200 kiến trúc Blackwell) cùng nền tảng phần mềm độc quyền CUDA là hạ tầng cốt lõi cho mọi mô hình ngôn ngữ lớn (LLM) và siêu máy tính trên thế giới.'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc. (Google)',
    category: 'stock',
    sector: 'Dịch vụ truyền thông',
    industry: 'Internet, Tìm kiếm trực tuyến & Trí tuệ nhân tạo',
    ceo: 'Sundar Pichai',
    headquarters: 'Mountain View, California, USA',
    founded: '1998',
    employees: '~180,000',
    exchange: 'NASDAQ',
    marketCap: '$2,150,000,000,000',
    peRatio: '24.5x',
    pbRatio: '6.8x',
    eps: '$7.15',
    dividendYield: '0.45%',
    revenue: '$328.2B (TTM)',
    netIncome: '$87.9B (TTM)',
    sharesOutstanding: '12.3B',
    fiftyTwoWeekHigh: '$355.00',
    fiftyTwoWeekLow: '$131.00',
    website: 'https://abc.xyz/',
    investorRelations: 'https://abc.xyz/investor/',
    introduction: 'Alphabet Inc. là công ty mẹ của Google, tập đoàn công nghệ sở hữu công cụ tìm kiếm số một thế giới Google Search, nền tảng chia sẻ video lớn nhất hành tinh YouTube, hệ điều hành di động Android, dịch vụ đám mây Google Cloud và viện nghiên cứu AI hàng đầu Google DeepMind.'
  },
  'AMZN': {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'stock',
    sector: 'Hàng tiêu dùng không thiết yếu',
    industry: 'Thương mại điện tử & Điện toán đám mây',
    ceo: 'Andy Jassy',
    headquarters: 'Seattle, Washington, USA',
    founded: '1994',
    employees: '~1,525,000',
    exchange: 'NASDAQ',
    marketCap: '$2,550,000,000,000',
    peRatio: '42.1x',
    pbRatio: '8.2x',
    eps: '$4.67',
    dividendYield: '0.00%',
    revenue: '$620.1B (TTM)',
    netIncome: '$44.6B (TTM)',
    sharesOutstanding: '10.5B',
    fiftyTwoWeekHigh: '$252.00',
    fiftyTwoWeekLow: '$165.00',
    website: 'https://www.amazon.com/',
    investorRelations: 'https://ir.aboutamazon.com/',
    introduction: 'Amazon.com, Inc. là tập đoàn công nghệ và bán lẻ trực tuyến lớn nhất phương Tây do Jeff Bezos thành lập. Amazon thống trị hai mảng kinh doanh then chốt: sàn thương mại điện tử phục vụ hàng trăm triệu khách hàng và Amazon Web Services (AWS) - nhà cung cấp dịch vụ hạ tầng điện toán đám mây có thị phần số 1 toàn cầu.'
  },
  'META': {
    symbol: 'META',
    name: 'Meta Platforms (Facebook)',
    category: 'stock',
    sector: 'Dịch vụ truyền thông',
    industry: 'Mạng xã hội & Công nghệ tương tác số',
    ceo: 'Mark Zuckerberg',
    headquarters: 'Menlo Park, California, USA',
    founded: '2004',
    employees: '~70,000',
    exchange: 'NASDAQ',
    marketCap: '$1,820,000,000,000',
    peRatio: '27.8x',
    pbRatio: '8.5x',
    eps: '$21.50',
    dividendYield: '0.35%',
    revenue: '$164.2B (TTM)',
    netIncome: '$52.8B (TTM)',
    sharesOutstanding: '2.53B',
    fiftyTwoWeekHigh: '$735.00',
    fiftyTwoWeekLow: '$440.00',
    website: 'https://about.meta.com/',
    investorRelations: 'https://investor.atmeta.com/',
    introduction: 'Meta Platforms, Inc. sở hữu các ứng dụng kết nối xã hội có hơn 3,2 tỷ người dùng hoạt động mỗi ngày gồm Facebook, Instagram, WhatsApp, Messenger và Threads. Meta cũng là đơn vị tiên phong đầu tư mạnh mẽ vào phần cứng thực tế ảo Quest, vũ trụ ảo Metaverse và mô hình ngôn ngữ lớn mã nguồn mở LLaMA.'
  },
  'AMD': {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    category: 'stock',
    sector: 'Chất bán dẫn',
    industry: 'Thiết kế vi xử lý CPU & GPU máy tính',
    ceo: 'Lisa Su',
    headquarters: 'Santa Clara, California, USA',
    founded: '1969',
    employees: '~26,000',
    exchange: 'NASDAQ',
    marketCap: '$268,000,000,000',
    peRatio: '110.2x',
    pbRatio: '4.8x',
    eps: '$1.15',
    dividendYield: '0.00%',
    revenue: '$25.7B (TTM)',
    netIncome: '$1.9B (TTM)',
    sharesOutstanding: '1.62B',
    fiftyTwoWeekHigh: '$227.30',
    fiftyTwoWeekLow: '$130.00',
    website: 'https://www.amd.com/',
    investorRelations: 'https://ir.amd.com/',
    introduction: 'Advanced Micro Devices (AMD) là công ty bán dẫn đa quốc gia hàng đầu, nổi tiếng với các dòng vi xử lý CPU máy tính cá nhân và máy chủ (Ryzen, EPYC), card đồ họa Radeon và bộ tăng tốc AI chuyên dụng Instinct MI300X cạnh tranh trực tiếp với Nvidia.'
  },
  'INTC': {
    symbol: 'INTC',
    name: 'Intel Corp.',
    category: 'stock',
    sector: 'Chất bán dẫn',
    industry: 'Sản xuất vi xử lý x86 & Xưởng đúc chip Foundry',
    ceo: 'Pat Gelsinger',
    headquarters: 'Santa Clara, California, USA',
    founded: '1968',
    employees: '~124,000',
    exchange: 'NASDAQ',
    marketCap: '$106,000,000,000',
    peRatio: '38.5x',
    pbRatio: '0.95x',
    eps: '$0.62',
    dividendYield: '1.85%',
    revenue: '$54.2B (TTM)',
    netIncome: '$1.6B (TTM)',
    sharesOutstanding: '4.28B',
    fiftyTwoWeekHigh: '$45.00',
    fiftyTwoWeekLow: '$18.51',
    website: 'https://www.intel.com/',
    investorRelations: 'https://www.intc.com/',
    introduction: 'Intel Corporation là một trong những biểu tượng công nghệ khai sinh ra Thung lũng Silicon và dòng vi xử lý kiến trúc x86 thống trị kỷ nguyên máy tính cá nhân. Intel hiện đang triển khai chiến lược IDM 2.0 để trở thành xưởng đúc bán dẫn gia công hàng đầu thế giới (Intel Foundry).'
  },
  'BABA': {
    symbol: 'BABA',
    name: 'Alibaba Group',
    category: 'stock',
    sector: 'Hàng tiêu dùng không thiết yếu',
    industry: 'Thương mại điện tử & Fintech châu Á',
    ceo: 'Eddie Wu',
    headquarters: 'Hàng Châu, Chiết Giang, Trung Quốc',
    founded: '1999',
    employees: '~200,000',
    exchange: 'NYSE',
    marketCap: '$220,000,000,000',
    peRatio: '16.4x',
    pbRatio: '1.4x',
    eps: '$5.60',
    dividendYield: '2.15%',
    revenue: '$135.2B (TTM)',
    netIncome: '$11.8B (TTM)',
    sharesOutstanding: '2.4B',
    fiftyTwoWeekHigh: '$118.00',
    fiftyTwoWeekLow: '$68.00',
    website: 'https://www.alibabagroup.com/',
    investorRelations: 'https://www.alibabagroup.com/en-US/ir',
    introduction: 'Alibaba Group Holding Limited là tập đoàn thương mại điện tử và công nghệ lớn nhất Trung Quốc do Jack Ma đồng sáng lập. Doanh nghiệp quản lý các nền tảng bán lẻ khổng lồ Taobao, Tmall, AliExpress, hệ thống điện toán đám mây Alibaba Cloud và hệ sinh thái tài chính Ant Group.'
  },
  'DIS': {
    symbol: 'DIS',
    name: 'Walt Disney Co.',
    category: 'stock',
    sector: 'Dịch vụ truyền thông & Giải trí',
    industry: 'Sản xuất điện ảnh, Truyền hình & Công viên giải trí',
    ceo: 'Bob Iger',
    headquarters: 'Burbank, California, USA',
    founded: '1923',
    employees: '~225,000',
    exchange: 'NYSE',
    marketCap: '$210,000,000,000',
    peRatio: '38.2x',
    pbRatio: '2.0x',
    eps: '$2.85',
    dividendYield: '0.85%',
    revenue: '$91.4B (TTM)',
    netIncome: '$4.9B (TTM)',
    sharesOutstanding: '1.83B',
    fiftyTwoWeekHigh: '$123.74',
    fiftyTwoWeekLow: '$83.91',
    website: 'https://thewaltdisneycompany.com/',
    investorRelations: 'https://thewaltdisneycompany.com/investor-relations/',
    introduction: 'The Walt Disney Company là đế chế truyền thông giải trí gia đình số một thế giới với lịch sử hơn 100 năm. Disney sở hữu các thương hiệu điện ảnh kinh điển Pixar, Marvel Studios, Star Wars (Lucasfilm), kênh thể thao ESPN, chuỗi công viên chủ đề Disneyland toàn cầu và nền tảng Disney+.'
  },
  'COIN': {
    symbol: 'COIN',
    name: 'Coinbase Global',
    category: 'stock',
    sector: 'Tài chính công nghệ (Fintech)',
    industry: 'Sàn giao dịch tài sản số & Lưu ký tiền mã hóa',
    ceo: 'Brian Armstrong',
    headquarters: 'San Francisco, California, USA',
    founded: '2012',
    employees: '~3,500',
    exchange: 'NASDAQ',
    marketCap: '$78,000,000,000',
    peRatio: '45.3x',
    pbRatio: '7.9x',
    eps: '$5.20',
    dividendYield: '0.00%',
    revenue: '$5.1B (TTM)',
    netIncome: '$1.4B (TTM)',
    sharesOutstanding: '249M',
    fiftyTwoWeekHigh: '$342.98',
    fiftyTwoWeekLow: '$142.00',
    website: 'https://www.coinbase.com/',
    investorRelations: 'https://investor.coinbase.com/',
    introduction: 'Coinbase Global, Inc. là sàn giao dịch tiền mã hóa niêm yết công khai lớn nhất Hoa Kỳ. Công ty cung cấp nền tảng giao dịch tài sản số an toàn cho hơn 100 triệu người dùng, đồng thời đóng vai trò đối tác lưu ký chính (Custodian) cho hầu hết các quỹ Bitcoin và Ethereum Spot ETF của phố Wall (BlackRock, Fidelity).'
  },
  'UBER': {
    symbol: 'UBER',
    name: 'Uber Technologies',
    category: 'stock',
    sector: 'Công nghệ & Vận tải',
    industry: 'Nền tảng gọi xe trực tuyến & Giao nhận đồ ăn',
    ceo: 'Dara Khosrowshahi',
    headquarters: 'San Francisco, California, USA',
    founded: '2009',
    employees: '~30,000',
    exchange: 'NYSE',
    marketCap: '$162,000,000,000',
    peRatio: '34.5x',
    pbRatio: '11.2x',
    eps: '$2.10',
    dividendYield: '0.00%',
    revenue: '$42.1B (TTM)',
    netIncome: '$4.3B (TTM)',
    sharesOutstanding: '2.07B',
    fiftyTwoWeekHigh: '$87.00',
    fiftyTwoWeekLow: '$57.00',
    website: 'https://www.uber.com/',
    investorRelations: 'https://investor.uber.com/',
    introduction: 'Uber Technologies, Inc. là tập đoàn công nghệ tiên phong toàn cầu về dịch vụ kinh tế chia sẻ (Gig economy). Nền tảng của công ty kết nối hành khách với tài xế xe công nghệ (Uber Mobility), dịch vụ giao đồ ăn (Uber Eats) và vận tải hàng hóa thương mại (Uber Freight) tại hơn 70 quốc gia.'
  },
  'ORCL': {
    symbol: 'ORCL',
    name: 'Oracle Corp.',
    category: 'stock',
    sector: 'Công nghệ thông tin',
    industry: 'Cơ sở dữ liệu doanh nghiệp & Hạ tầng OCI Cloud',
    ceo: 'Safra Catz',
    headquarters: 'Austin, Texas, USA',
    founded: '1977',
    employees: '~159,000',
    exchange: 'NYSE',
    marketCap: '$510,000,000,000',
    peRatio: '41.5x',
    pbRatio: '28.5x',
    eps: '$4.15',
    dividendYield: '0.90%',
    revenue: '$55.3B (TTM)',
    netIncome: '$11.2B (TTM)',
    sharesOutstanding: '2.77B',
    fiftyTwoWeekHigh: '$195.00',
    fiftyTwoWeekLow: '$111.00',
    website: 'https://www.oracle.com/',
    investorRelations: 'https://investor.oracle.com/',
    introduction: 'Oracle Corporation là tập đoàn công nghệ phần mềm doanh nghiệp hàng đầu thế giới, sáng lập bởi Larry Ellison. Oracle dẫn đầu thị trường về phần mềm quản trị cơ sở dữ liệu quan hệ, hệ thống quản trị nguồn lực doanh nghiệp (ERP Cloud) và hạ tầng đám mây tốc độ cao Oracle Cloud Infrastructure (OCI).'
  },
  'KO': {
    symbol: 'KO',
    name: 'Coca-Cola Co.',
    category: 'stock',
    sector: 'Hàng tiêu dùng thiết yếu',
    industry: 'Sản xuất đồ uống & Nước giải khát không cồn',
    ceo: 'James Quincey',
    headquarters: 'Atlanta, Georgia, USA',
    founded: '1892',
    employees: '~79,000',
    exchange: 'NYSE',
    marketCap: '$380,000,000,000',
    peRatio: '27.5x',
    pbRatio: '12.8x',
    eps: '$2.65',
    dividendYield: '2.85%',
    revenue: '$46.2B (TTM)',
    netIncome: '$10.7B (TTM)',
    sharesOutstanding: '4.31B',
    fiftyTwoWeekHigh: '$90.50',
    fiftyTwoWeekLow: '$58.00',
    website: 'https://www.coca-colacompany.com/',
    investorRelations: 'https://investors.coca-colacompany.com/',
    introduction: 'The Coca-Cola Company là công ty sản xuất đồ uống không cồn lớn nhất hành tinh với lịch sử hơn 130 năm. Sở hữu danh mục hàng trăm nhãn hiệu được yêu thích toàn cầu như Coca-Cola, Sprite, Fanta, Dasani, Costa Coffee, công ty nổi tiếng với dòng tiền ổn định và lịch sử tăng cổ tức liên tục qua nhiều thập kỷ (Dividend King).'
  },
  'JNJ': {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    category: 'stock',
    sector: 'Chăm sóc sức khỏe',
    industry: 'Dược phẩm sinh học & Thiết bị y tế công nghệ cao',
    ceo: 'Joaquin Duato',
    headquarters: 'New Brunswick, New Jersey, USA',
    founded: '1886',
    employees: '~130,000',
    exchange: 'NYSE',
    marketCap: '$650,000,000,000',
    peRatio: '24.1x',
    pbRatio: '5.6x',
    eps: '$7.10',
    dividendYield: '3.10%',
    revenue: '$88.5B (TTM)',
    netIncome: '$16.2B (TTM)',
    sharesOutstanding: '2.4B',
    fiftyTwoWeekHigh: '$280.00',
    fiftyTwoWeekLow: '$143.00',
    website: 'https://www.jnj.com/',
    investorRelations: 'https://www.investor.jnj.com/',
    introduction: 'Johnson & Johnson là tập đoàn y tế và dược phẩm sinh học đa quốc gia lâu đời của Mỹ. Sau khi tách mảng chăm sóc sức khỏe tiêu dùng (Kenvue), J&J tập trung toàn lực vào nghiên cứu các loại thuốc điều trị ung thư, miễn dịch và công nghệ thiết bị phẫu thuật can thiệp chính xác cao (MedTech).'
  },

  // ==========================================
  // 4. HÀNG HÓA & NĂNG LƯỢNG (COMMODITIES)
  // ==========================================
  'XAUUSD': {
    symbol: 'XAUUSD',
    name: 'Vàng (Gold / US Dollar)',
    category: 'commodity',
    tradingUnit: '1 Troy Ounce (~31.1035 gram)',
    baseCurrency: 'XAU (Vàng nguyên chất)',
    quoteCurrency: 'USD (Đô la Mỹ)',
    pricingBenchmark: 'LBMA Gold Price / COMEX Futures',
    fiftyTwoWeekHigh: '$4,285.00',
    fiftyTwoWeekLow: '$2,310.00',
    introduction: 'Cặp tỷ giá XAU/USD phản ánh giá trị của 1 ounce Vàng nguyên chất được định giá bằng Đô la Mỹ. Vàng là kim loại quý có lịch sử hàng nghìn năm đóng vai trò là tài sản trú ẩn an toàn tối thượng (Safe Haven Asset) chống lại lạm phát, bất ổn địa chính trị và sự suy yếu của tiền tệ định danh.',
    website: 'https://www.gold.org/',
    explorer: 'https://www.tradingview.com/symbols/XAUUSD/'
  },
  'XAGUSD': {
    symbol: 'XAGUSD',
    name: 'Bạc (Silver / US Dollar)',
    category: 'commodity',
    tradingUnit: '1 Troy Ounce Bạc nguyên chất',
    baseCurrency: 'XAG (Bạc)',
    quoteCurrency: 'USD (Đô la Mỹ)',
    pricingBenchmark: 'LBMA Silver / COMEX Futures',
    fiftyTwoWeekHigh: '$65.40',
    fiftyTwoWeekLow: '$26.50',
    introduction: 'Bạc (XAG/USD) là kim loại quý có tính chất kép độc đáo: vừa là tài sản bảo toàn giá trị tài chính, vừa là vật liệu công nghiệp không thể thay thế trong sản xuất tấm pin quang điện năng lượng mặt trời, vi mạch điện tử bán dẫn và công nghệ xe điện hiện đại.',
    website: 'https://www.silverinstitute.org/',
    explorer: 'https://www.tradingview.com/symbols/XAGUSD/'
  },
  'USOIL': {
    symbol: 'USOIL',
    name: 'Dầu thô WTI (Crude Oil)',
    category: 'commodity',
    tradingUnit: '100 Thùng Dầu (1 Barrel = 159 lít)',
    baseCurrency: 'WTI Crude Oil',
    quoteCurrency: 'USD',
    pricingBenchmark: 'NYMEX / CME Group',
    fiftyTwoWeekHigh: '$102.50',
    fiftyTwoWeekLow: '$66.80',
    introduction: 'Dầu thô ngọt nhẹ WTI (West Texas Intermediate) là tiêu chuẩn định giá năng lượng quan trọng nhất của thị trường Bắc Mỹ. Biến động giá dầu thô WTI chịu tác động trực tiếp bởi chính sách sản lượng của khối OPEC+, tồn kho dầu mỏ EIA của Mỹ và tốc độ tăng trưởng kinh tế toàn cầu.',
    website: 'https://www.eia.gov/',
    explorer: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html'
  },
  'BRENT': {
    symbol: 'BRENT',
    name: 'Dầu thô Brent (Brent Oil)',
    category: 'commodity',
    tradingUnit: '100 Thùng Dầu Biển Bắc',
    baseCurrency: 'Brent Crude',
    quoteCurrency: 'USD',
    pricingBenchmark: 'ICE Futures Europe',
    fiftyTwoWeekHigh: '$105.80',
    fiftyTwoWeekLow: '$70.10',
    introduction: 'Dầu Brent được khai thác từ vùng biển Bắc giữa Anh và Na Uy, là thước đo giá chuẩn quốc tế định giá cho khoảng hai phần ba tổng lượng dầu thô được giao dịch mua bán trên thị trường hàng hải thế giới.',
    website: 'https://www.theice.com/products/219/Brent-Crude-Futures',
    explorer: 'https://www.tradingview.com/symbols/BRENT/'
  },
  'NGAS': {
    symbol: 'NGAS',
    name: 'Khí tự nhiên (Natural Gas)',
    category: 'commodity',
    tradingUnit: '10,000 MMBtu (Triệu đơn vị nhiệt Anh)',
    baseCurrency: 'Natural Gas Henry Hub',
    quoteCurrency: 'USD',
    pricingBenchmark: 'NYMEX / Henry Hub',
    fiftyTwoWeekHigh: '$4.20',
    fiftyTwoWeekLow: '$1.52',
    introduction: 'Khí tự nhiên (Natural Gas) là nguồn năng lượng hóa thạch thiết yếu được tiêu thụ để phát điện, sưởi ấm công nghiệp và sản xuất phân bón. Giá khí gas có tính chu kỳ mùa vụ rất cao, nhạy cảm với điều kiện thời tiết mùa đông và hạ tầng xuất khẩu khí hóa lỏng (LNG).',
    website: 'https://www.cmegroup.com/markets/energy/natural-gas/natural-gas.html',
    explorer: 'https://www.tradingview.com/symbols/NGAS/'
  },
  'COPPER': {
    symbol: 'COPPER',
    name: 'Đồng (High Grade Copper)',
    category: 'commodity',
    tradingUnit: '25,000 Pounds (~11.3 Tấn)',
    baseCurrency: 'Copper',
    quoteCurrency: 'USD / Cent',
    pricingBenchmark: 'COMEX / London Metal Exchange (LME)',
    fiftyTwoWeekHigh: '$5.85',
    fiftyTwoWeekLow: '$3.90',
    introduction: 'Kim loại Đồng thường được các nhà kinh tế gọi là "Tiến sĩ Đồng" (Dr. Copper) vì khả năng dự báo chu kỳ kinh tế và sản xuất công nghiệp toàn cầu. Đồng là vật liệu không thể thiếu trong truyền tải điện, động cơ xe điện, trung tâm dữ liệu AI và công trình xây dựng.',
    website: 'https://www.lme.com/Metals/Non-ferrous/LME-Copper',
    explorer: 'https://www.tradingview.com/symbols/COPPER/'
  },
  'PLATINUM': {
    symbol: 'PLATINUM',
    name: 'Bạch kim (Platinum)',
    category: 'commodity',
    tradingUnit: '50 Troy Ounce',
    baseCurrency: 'Platinum',
    quoteCurrency: 'USD',
    pricingBenchmark: 'NYMEX / LPPM',
    fiftyTwoWeekHigh: '$1,220.00',
    fiftyTwoWeekLow: '$880.00',
    introduction: 'Bạch kim (Platinum) là kim loại quý hiếm hơn vàng gấp 30 lần, đóng vai trò then chốt làm chất xúc tác chuyển đổi khí thải ô tô, pin nhiên liệu hydro sạch và trang sức cao cấp. Nguồn cung bạch kim tập trung chủ yếu tại Nam Phi và Nga.',
    website: 'https://platinuminvestment.com/',
    explorer: 'https://www.tradingview.com/symbols/PLATINUM/'
  },

  // ==========================================
  // 5. NGOẠI HỐI (FOREX)
  // ==========================================
  'EURUSD': {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'forex',
    tradingUnit: '100,000 EUR (1 Standard Lot)',
    baseCurrency: 'EUR (Đồng Euro châu Âu)',
    quoteCurrency: 'USD (Đô la Mỹ)',
    pricingBenchmark: 'Interbank FX Market / OANDA',
    fiftyTwoWeekHigh: '1.1550',
    fiftyTwoWeekLow: '1.0330',
    introduction: 'EUR/USD là cặp tiền tệ được giao dịch sôi động nhất và có thanh khoản sâu nhất trên thế giới, chiếm gần 25% tổng khối lượng giao dịch ngoại hối toàn cầu. Tỷ giá phản ánh sức mạnh kinh tế tương quan giữa Khu vực đồng tiền chung châu Âu (Eurozone) và Hợp chúng quốc Hoa Kỳ.',
    website: 'https://www.ecb.europa.eu/',
    explorer: 'https://www.tradingview.com/symbols/EURUSD/'
  },
  'GBPUSD': {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar (Cable)',
    category: 'forex',
    tradingUnit: '100,000 GBP',
    baseCurrency: 'GBP (Bảng Anh)',
    quoteCurrency: 'USD (Đô la Mỹ)',
    pricingBenchmark: 'Interbank FX Market / OANDA',
    fiftyTwoWeekHigh: '1.3430',
    fiftyTwoWeekLow: '1.2050',
    introduction: 'GBP/USD (biệt danh "Cable" - dựa trên tuyến cáp điện báo xuyên Đại Tây Dương nối Luân Đôn và New York từ thế kỷ 19) là cặp tiền tệ lâu đời nhất thế giới, thể hiện sức mạnh kinh tế của Vương quốc Anh so với Mỹ.',
    website: 'https://www.bankofengland.co.uk/',
    explorer: 'https://www.tradingview.com/symbols/GBPUSD/'
  },
  'USDJPY': {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen (Gopher)',
    category: 'forex',
    tradingUnit: '100,000 USD',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY (Yên Nhật)',
    pricingBenchmark: 'Interbank FX Market / OANDA',
    fiftyTwoWeekHigh: '161.95',
    fiftyTwoWeekLow: '139.50',
    introduction: 'USD/JPY phản ánh tỷ giá hối đoái giữa đồng Đô la Mỹ và đồng Yên Nhật - trung tâm của các chiến lược giao dịch chênh lệch lãi suất (Carry Trade) toàn cầu do chênh lệch lợi suất trái phiếu giữa FED và Ngân hàng Trung ương Nhật Bản (BOJ).',
    website: 'https://www.boj.or.jp/en/',
    explorer: 'https://www.tradingview.com/symbols/USDJPY/'
  },
  'GBPJPY': {
    symbol: 'GBPJPY',
    name: 'Bảng Anh / Yên Nhật (Guppy)',
    category: 'forex',
    tradingUnit: '100,000 GBP',
    baseCurrency: 'GBP',
    quoteCurrency: 'JPY',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '210.50',
    fiftyTwoWeekLow: '180.20',
    introduction: 'GBPJPY được giới giao dịch gọi là "Quái thú" hay "Guppy/Dragon" vì biên độ biến động rất rộng (hàng trăm pips mỗi ngày). Cặp tiền này kết hợp lãi suất tương đối cao của Bảng Anh với dòng tiền trú ẩn của Yên Nhật.',
    website: 'https://www.bankofengland.co.uk/',
    explorer: 'https://www.tradingview.com/symbols/GBPJPY/'
  },
  'EURJPY': {
    symbol: 'EURJPY',
    name: 'Euro / Yên Nhật',
    category: 'forex',
    tradingUnit: '100,000 EUR',
    baseCurrency: 'EUR',
    quoteCurrency: 'JPY',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '180.00',
    fiftyTwoWeekLow: '154.40',
    introduction: 'EUR/JPY là cặp tỷ giá chéo giữa Euro và Yên Nhật, phản ánh luồng thương mại và đầu tư giữa Liên minh châu Âu và nền kinh tế lớn thứ tư thế giới là Nhật Bản.',
    website: 'https://www.ecb.europa.eu/',
    explorer: 'https://www.tradingview.com/symbols/EURJPY/'
  },
  'AUDUSD': {
    symbol: 'AUDUSD',
    name: 'Đô la Úc / US Dollar (Aussie)',
    category: 'forex',
    tradingUnit: '100,000 AUD',
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '0.7150',
    fiftyTwoWeekLow: '0.6350',
    introduction: 'AUD/USD ("Aussie") là đồng tiền hàng hóa tiêu biểu. Nền kinh tế Úc là nước xuất khẩu quặng sắt, than đá và vàng hàng đầu sang Trung Quốc, do đó AUD phản ánh độ nhạy bén rất cao với chu kỳ tăng trưởng thương mại châu Á - Thái Bình Dương.',
    website: 'https://www.rba.gov.au/',
    explorer: 'https://www.tradingview.com/symbols/AUDUSD/'
  },
  'USDCAD': {
    symbol: 'USDCAD',
    name: 'USD / Đô la Canada (Loonie)',
    category: 'forex',
    tradingUnit: '100,000 USD',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '1.4350',
    fiftyTwoWeekLow: '1.3170',
    introduction: 'USD/CAD ("Loonie") phản ánh mối quan hệ thương mại chặt chẽ giữa Mỹ và Canada. Vì Canada là nước xuất khẩu dầu mỏ lớn sang Mỹ, đồng CAD có mối tương quan nghịch rõ rệt với giá dầu thô thế giới.',
    website: 'https://www.bankofcanada.ca/',
    explorer: 'https://www.tradingview.com/symbols/USDCAD/'
  },
  'USDCHF': {
    symbol: 'USDCHF',
    name: 'USD / Franc Thụy Sĩ (Swissie)',
    category: 'forex',
    tradingUnit: '100,000 USD',
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '0.9250',
    fiftyTwoWeekLow: '0.8370',
    introduction: 'USD/CHF ("Swissie") đại diện cho đồng Franc Thụy Sĩ - một trong những đồng tiền an toàn và ổn định nhất thế giới nhờ nền kinh tế vững vàng, hệ thống ngân hàng uy tín và vị thế trung lập của Thụy Sĩ.',
    website: 'https://www.snb.ch/',
    explorer: 'https://www.tradingview.com/symbols/USDCHF/'
  },
  'NZDUSD': {
    symbol: 'NZDUSD',
    name: 'Đô la New Zealand / USD (Kiwi)',
    category: 'forex',
    tradingUnit: '100,000 NZD',
    baseCurrency: 'NZD',
    quoteCurrency: 'USD',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '0.6400',
    fiftyTwoWeekLow: '0.5780',
    introduction: 'NZD/USD ("Kiwi") phản ánh nền kinh tế xuất khẩu nông sản, sản phẩm bơ sữa và du lịch của New Zealand, liên kết chặt chẽ với tâm lý khẩu vị rủi ro (Risk-on / Risk-off) của thị trường tài chính.',
    website: 'https://www.rbnz.govt.nz/',
    explorer: 'https://www.tradingview.com/symbols/NZDUSD/'
  },
  'EURGBP': {
    symbol: 'EURGBP',
    name: 'Euro / Bảng Anh (Chunnel)',
    category: 'forex',
    tradingUnit: '100,000 EUR',
    baseCurrency: 'EUR',
    quoteCurrency: 'GBP',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '0.8800',
    fiftyTwoWeekLow: '0.8250',
    introduction: 'EUR/GBP phản ánh sự cân bằng sức mạnh kinh tế và chênh lệch lãi suất trực tiếp giữa Vương quốc Anh hậu Brexit và Liên minh Châu Âu.',
    website: 'https://www.ecb.europa.eu/',
    explorer: 'https://www.tradingview.com/symbols/EURGBP/'
  },
  'AUDJPY': {
    symbol: 'AUDJPY',
    name: 'Đô la Úc / Yên Nhật',
    category: 'forex',
    tradingUnit: '100,000 AUD',
    baseCurrency: 'AUD',
    quoteCurrency: 'JPY',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '112.50',
    fiftyTwoWeekLow: '90.80',
    introduction: 'AUD/JPY là một trong những phong vũ biểu đo lường tâm lý chấp nhận rủi ro (Risk Sentiment) rõ nét nhất trong thị trường ngoại hối: cặp tiền tăng khi kinh tế toàn cầu khởi sắc và giảm khi xảy ra khủng hoảng.',
    website: 'https://www.rba.gov.au/',
    explorer: 'https://www.tradingview.com/symbols/AUDJPY/'
  },
  'CHFJPY': {
    symbol: 'CHFJPY',
    name: 'Franc Thụy Sĩ / Yên Nhật',
    category: 'forex',
    tradingUnit: '100,000 CHF',
    baseCurrency: 'CHF',
    quoteCurrency: 'JPY',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '182.40',
    fiftyTwoWeekLow: '160.00',
    introduction: 'Cặp tiền tệ giữa hai đồng tiền trú ẩn an toàn nhất thế giới: Franc Thụy Sĩ và Yên Nhật, phản ánh sự biến chuyển của dòng vốn tài chính phòng hộ quốc tế.',
    website: 'https://www.snb.ch/',
    explorer: 'https://www.tradingview.com/symbols/CHFJPY/'
  },
  'CADJPY': {
    symbol: 'CADJPY',
    name: 'Đô la Canada / Yên Nhật',
    category: 'forex',
    tradingUnit: '100,000 CAD',
    baseCurrency: 'CAD',
    quoteCurrency: 'JPY',
    pricingBenchmark: 'Interbank FX Market',
    fiftyTwoWeekHigh: '113.80',
    fiftyTwoWeekLow: '95.50',
    introduction: 'CAD/JPY là cặp giao dịch kết hợp giữa nước xuất khẩu năng lượng lớn (Canada) và quốc gia nhập khẩu dầu mỏ lớn (Nhật Bản), chịu tác động mạnh bởi giá dầu thô.',
    website: 'https://www.bankofcanada.ca/',
    explorer: 'https://www.tradingview.com/symbols/CADJPY/'
  },

  // ==========================================
  // 6. CHỈ SỐ TOÀN CẦU (GLOBAL INDICES)
  // ==========================================
  'DXY': {
    symbol: 'DXY',
    name: 'US Dollar Index (Chỉ số Sức mạnh USD)',
    category: 'index',
    pricingBenchmark: 'Intercontinental Exchange (ICE)',
    tradingUnit: 'Điểm chỉ số rổ ngoại tệ',
    componentsCount: '6 đồng tiền chủ chốt (EUR, JPY, GBP, CAD, SEK, CHF)',
    fiftyTwoWeekHigh: '107.50',
    fiftyTwoWeekLow: '99.50',
    introduction: 'Chỉ số US Dollar Index (DXY) đo lường giá trị tương đối của đồng Đô la Mỹ so với một rổ gồm 6 đồng tiền ngoại tệ lớn của các đối tác thương mại hàng đầu của Mỹ (trong đó đồng Euro chiếm tỷ trọng lớn nhất với 57.6%). Khi DXY tăng, đồng USD mạnh lên so với phần còn lại của thế giới.',
    website: 'https://www.theice.com/market-data/indices/us-dollar-index',
    explorer: 'https://www.tradingview.com/symbols/ICEUS-DXY/'
  },
  'SPX': {
    symbol: 'SPX',
    name: 'S&P 500 Index',
    category: 'index',
    pricingBenchmark: 'S&P Dow Jones Indices / CME',
    componentsCount: '503 cổ phiếu của 500 công ty hàng đầu Mỹ',
    marketCap: 'Khoảng $48,000 tỷ USD',
    fiftyTwoWeekHigh: '7,820.00',
    fiftyTwoWeekLow: '4,950.00',
    introduction: 'Chỉ số Standard & Poor\'s 500 (S&P 500) là thước đo chuẩn mực nhất đại diện cho thị trường chứng khoán Hoa Kỳ, bao gồm 500 công ty đại chúng có vốn hóa lớn nhất niêm yết trên NYSE và NASDAQ, chiếm khoảng 80% tổng giá trị vốn hóa toàn thị trường chứng khoán Mỹ.',
    website: 'https://www.spglobal.com/spdji/en/indices/equity/sp-500/',
    explorer: 'https://www.tradingview.com/symbols/SPX/'
  },
  'NDX': {
    symbol: 'NDX',
    name: 'Nasdaq 100 Index',
    category: 'index',
    pricingBenchmark: 'Nasdaq Inc. / CME',
    componentsCount: '100 công ty phi tài chính lớn nhất sàn NASDAQ',
    marketCap: 'Khoảng $24,000 tỷ USD',
    fiftyTwoWeekHigh: '30,800.00',
    fiftyTwoWeekLow: '17,200.00',
    introduction: 'Nasdaq 100 bao gồm 100 doanh nghiệp phi tài chính hàng đầu thế giới niêm yết trên sàn NASDAQ. Chỉ số này tập trung cao độ vào nhóm công nghệ, AI, bán dẫn và internet tiên phong như Microsoft, Apple, Nvidia, Alphabet, Amazon, Meta và Tesla.',
    website: 'https://www.nasdaq.com/market-activity/indexes/ndx',
    explorer: 'https://www.tradingview.com/symbols/NDX/'
  },
  'DJI': {
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    category: 'index',
    pricingBenchmark: 'S&P Dow Jones Indices / CBOT',
    componentsCount: '30 tập đoàn công nghiệp bluechip trụ cột Mỹ',
    fiftyTwoWeekHigh: '52,200.00',
    fiftyTwoWeekLow: '37,600.00',
    introduction: 'Chỉ số bình quân công nghiệp Dow Jones (DJIA) là chỉ số chứng khoán lâu đời thứ hai tại Hoa Kỳ, quy tụ 30 tập đoàn đầu ngành đại diện cho sức mạnh và sự ổn định của nền kinh tế Mỹ qua hơn một thế kỷ.',
    website: 'https://www.spglobal.com/spdji/en/indices/equity/dow-jones-industrial-average/',
    explorer: 'https://www.tradingview.com/symbols/DJI/'
  },
  'JP225': {
    symbol: 'JP225',
    name: 'Nikkei 225 (Nhật Bản)',
    category: 'index',
    pricingBenchmark: 'Tokyo Stock Exchange (TSE) / OSE',
    componentsCount: '225 cổ phiếu hàng đầu Nhật Bản',
    fiftyTwoWeekHigh: '42,426.00',
    fiftyTwoWeekLow: '31,150.00',
    introduction: 'Nikkei 225 là chỉ số giá chứng khoán danh tiếng nhất của Nhật Bản, theo dõi 225 công ty lớn thuộc khu vực thứ nhất của Sở Giao dịch Chứng khoán Tokyo như Toyota, Sony, Nintendo, Tokyo Electron và SoftBank.',
    website: 'https://indexes.nikkei.co.jp/en/nkave/',
    explorer: 'https://www.tradingview.com/symbols/NI225/'
  },
  'UK100': {
    symbol: 'UK100',
    name: 'FTSE 100 (Vương quốc Anh)',
    category: 'index',
    pricingBenchmark: 'London Stock Exchange (LSE)',
    componentsCount: '100 công ty vốn hóa lớn nhất niêm yết tại London',
    fiftyTwoWeekHigh: '8,550.00',
    fiftyTwoWeekLow: '7,450.00',
    introduction: 'FTSE 100 ("Footsie") là chỉ số chứng khoán hàng đầu của Vương quốc Anh, gồm 100 công ty đại chúng lớn nhất niêm yết trên Sở giao dịch chứng khoán Luân Đôn như Shell, AstraZeneca, HSBC, Unilever và BP.',
    website: 'https://www.londonstockexchange.com/indices/ftse-100',
    explorer: 'https://www.tradingview.com/symbols/FTSE/'
  },
  'EU50': {
    symbol: 'EU50',
    name: 'Euro Stoxx 50 (Châu Âu)',
    category: 'index',
    pricingBenchmark: 'STOXX Ltd. / EUREX',
    componentsCount: '50 công ty bluechip hàng đầu thuộc Eurozone',
    fiftyTwoWeekHigh: '5,120.00',
    fiftyTwoWeekLow: '4,400.00',
    introduction: 'Euro Stoxx 50 là thước đo thị trường chứng khoán chuẩn mực của Khu vực đồng tiền chung châu Âu, bao gồm 50 doanh nghiệp dẫn đầu như ASML, LVMH, SAP, Siemens, TotalEnergies và Sanofi.',
    website: 'https://www.stoxx.com/index-details?symbol=SX5E',
    explorer: 'https://www.tradingview.com/symbols/SX5E/'
  },
  'US2000': {
    symbol: 'US2000',
    name: 'Russell 2000 (Small Cap Index)',
    category: 'index',
    pricingBenchmark: 'FTSE Russell / CME',
    componentsCount: '2.000 công ty vốn hóa vừa và nhỏ (Small-Cap) Mỹ',
    fiftyTwoWeekHigh: '2,460.00',
    fiftyTwoWeekLow: '1,920.00',
    introduction: 'Chỉ số Russell 2000 theo dõi 2.000 cổ phiếu doanh nghiệp vốn hóa nhỏ của Hoa Kỳ. Đây là thước đo chân thực về sức khỏe nội tại của nền kinh tế Mỹ vì doanh thu của các doanh nghiệp này chủ yếu đến từ thị trường nội địa.',
    website: 'https://www.ftserussell.com/products/indices/russell-us',
    explorer: 'https://www.tradingview.com/symbols/RUT/'
  }
};

export const SECTOR_TRANSLATIONS: Record<string, string> = {
  'Công nghệ thông tin': 'Information Technology',
  'Hàng tiêu dùng không thiết yếu': 'Consumer Discretionary',
  'Chất bán dẫn': 'Semiconductors',
  'Dịch vụ truyền thông': 'Communication Services',
  'Dịch vụ truyền thông & Giải trí': 'Media & Entertainment',
  'Tài chính công nghệ (Fintech)': 'Financial Technology (Fintech)',
  'Công nghệ & Vận tải': 'Technology & Transportation',
  'Hàng tiêu dùng thiết yếu': 'Consumer Staples',
  'Chăm sóc sức khỏe': 'Healthcare & Pharmaceuticals',
  'Thương mại & Công nghệ': 'Commerce & Technology',
};

export const INDUSTRY_TRANSLATIONS: Record<string, string> = {
  'Thiết bị điện tử tiêu dùng & Phần cứng': 'Consumer Electronics & Hardware',
  'Phần mềm cơ sở hạ tầng & Đám mây': 'Infrastructure Software & Cloud',
  'Sản xuất ô tô điện & Năng lượng tái tạo': 'Electric Vehicles & Clean Energy',
  'Vi xử lý GPU & Nền tảng Điện toán AI': 'GPU Processors & AI Computing',
  'Internet, Tìm kiếm trực tuyến & Trí tuệ nhân tạo': 'Internet, Search Engines & AI',
  'Thương mại điện tử & Điện toán đám mây': 'E-Commerce & Cloud Computing',
  'Mạng xã hội & Công nghệ tương tác số': 'Social Media & Interactive Digital Platforms',
  'Thiết kế vi xử lý CPU & GPU máy tính': 'CPU & GPU Semiconductor Design',
  'Sản xuất vi xử lý x86 & Xưởng đúc chip Foundry': 'x86 Processors & Semiconductor Foundry',
  'Thương mại điện tử & Fintech châu Á': 'Asian E-Commerce & Fintech',
  'Sản xuất điện ảnh, Truyền hình & Công viên giải trí': 'Motion Pictures, Television & Theme Parks',
  'Sàn giao dịch tài sản số & Lưu ký tiền mã hóa': 'Digital Asset Exchange & Custody',
  'Nền tảng gọi xe trực tuyến & Giao nhận đồ ăn': 'Ridesharing Platforms & Food Delivery',
  'Cơ sở dữ liệu doanh nghiệp & Hạ tầng OCI Cloud': 'Enterprise Databases & Cloud Infrastructure',
  'Sản xuất đồ uống & Nước giải khát không cồn': 'Beverages & Soft Drinks',
  'Dược phẩm sinh học & Thiết bị y tế công nghệ cao': 'Biopharmaceuticals & Medical Technology',
  'Tập đoàn niêm yết': 'Public Corporation',
};

export const INTRODUCTION_EN: Record<string, string> = {
  // Crypto Spot
  'BTCUSDT': 'Bitcoin is the first and largest decentralized cryptocurrency in the world, created in 2009 by the pseudonymous Satoshi Nakamoto. Operating on a peer-to-peer network with a Proof of Work consensus mechanism and a hard-capped supply of 21 million coins, Bitcoin is recognized globally as digital gold and an immutable store of value.',
  'ETHUSDT': 'Ethereum is an open-source decentralized smart contracts platform founded by Vitalik Buterin. It powers thousands of decentralized applications (dApps), decentralized finance (DeFi), NFTs, and Layer 2 rollup scaling solutions worldwide.',
  'BNBUSDT': 'BNB is the native cryptocurrency fueling the BNB Chain ecosystem and the Binance exchange, utilized for gas fee payments, transaction fee discounts, token launchpools, and auto-burn mechanisms.',
  'SOLUSDT': 'Solana is an ultra-high performance Layer 1 blockchain using Proof of History (PoH) alongside Proof of Stake (PoS) to achieve high transaction throughput and sub-second finality with minimal network fees.',
  'XRPUSDT': 'XRP operates on the open-source XRP Ledger, engineered to enable rapid, low-cost cross-border payments and liquidity settlements for major banking institutions globally.',
  'ADAUSDT': 'Cardano is a third-generation Proof-of-Stake blockchain platform founded by Charles Hoskinson, built on peer-reviewed academic research and formal verification methods.',
  'DOGEUSDT': 'Dogecoin is the original open-source peer-to-peer meme cryptocurrency created in 2013 by Billy Markus and Jackson Palmer, backed by a passionate community and widely used for micropayments.',
  'DOTUSDT': 'Polkadot is a multi-chain network architecture founded by Dr. Gavin Wood, connecting specialized sovereign blockchains (Parachains) into a unified, secure ecosystem via its Relay Chain.',
  'LINKUSDT': 'Chainlink is the industry-standard decentralized oracle network connecting smart contracts to real-world off-chain data, web APIs, and cross-chain messaging via CCIP.',
  'SUIUSDT': 'Sui is a high-throughput Layer 1 blockchain developed by Mysten Labs using the object-centric Move language for horizontal scaling and sub-second transaction finality.',
  'NEARUSDT': 'NEAR Protocol is a sharded, developer-friendly Layer 1 blockchain powered by Nightshade consensus, pioneering user-owned artificial intelligence and autonomous decentralized agents.',
  'AVAXUSDT': 'Avalanche is a smart contracts platform developed by Ava Labs, featuring sub-second transaction finality and customizable application-specific Subnets for enterprise deployment.',
  'APTUSDT': 'Aptos is a next-generation Layer 1 blockchain utilizing the Move programming language and Block-STM parallel execution engine for extreme safety and throughput.',
  'ARBUSDT': 'Arbitrum is the premier Layer 2 scaling solution for Ethereum, utilizing Optimistic Rollups to dramatically lower gas fees while inheriting Ethereum\'s base-layer security.',
  'OPUSDT': 'Optimism (OP Mainnet) is a low-cost, lightning-fast Ethereum Layer 2 scaling blockchain, pioneering the modular OP Stack for an interconnected Superchain ecosystem.',
  'TIAUSDT': 'Celestia is the first modular blockchain network focused specifically on scalable Data Availability (DA), enabling developers to launch custom rollups with ease.',
  'TONUSDT': 'The Open Network (TON) is a high-speed Layer 1 blockchain designed by Telegram, built for mass consumer adoption and native integration with over 900 million Telegram users.',
  'INJUSDT': 'Injective is an interoperable Layer 1 blockchain optimized for decentralized finance, on-chain order books, and institutional-grade derivatives trading.',
  'RENDERUSDT': 'Render Network is a decentralized GPU computing and rendering platform connecting creators with idle graphics hardware for 3D graphics and generative AI workloads.',
  'WIFUSDT': 'dogwifhat (WIF) is an iconic Solana ecosystem meme token featuring a Shiba Inu wearing a knit pink hat, characterized by a completely community-driven movement.',
  'SEIUSDT': 'Sei is an open-source Layer 1 blockchain optimized for lightning-fast trading execution, featuring Twin-Turbo consensus and a parallelized EVM environment.',
  'MATICUSDT': 'Polygon is an Ethereum scalability platform and zero-knowledge rollup infrastructure connecting multiple chains through the AggLayer unified liquidity protocol.',
  'LDOUSDT': 'Lido is the premier liquid staking protocol for Ethereum, enabling users to stake ETH and receive liquid stETH tokens to earn staking rewards while participating in DeFi.',
  'SHIBUSDT': 'Shiba Inu is a global decentralized crypto ecosystem featuring the ShibaSwap decentralized exchange, Shibarium Layer 2 scaling network, and NFT digital collectibles.',
  'TRXUSDT': 'TRON is a high-throughput delegated Proof-of-Stake blockchain founded by Justin Sun, operating as the largest settlement network for USDT stablecoin transfers worldwide.',

  // Crypto Futures
  'BTCUSDT.P': 'Bitcoin Perpetual Futures contract tracks spot BTC price movements, allowing traders to take leveraged Long and Short positions with up to 125x leverage and continuous 8-hour funding rates.',
  'ETHUSDT.P': 'Ethereum Perpetual Futures contract offers leveraged derivatives trading on ETH with up to 100x leverage and deep institutional liquidity.',
  'SOLUSDT.P': 'Solana Perpetual Futures contract enables high-leverage trading on SOL price action without contract expiration dates.',
  'SUIUSDT.P': 'Sui Perpetual Futures contract simulates the live market price of SUI tokens with high leverage support.',
  'NEARUSDT.P': 'NEAR Perpetual Futures contract allows USDT-margined derivative exposure to NEAR Protocol.',
  '1000PEPEUSDT.P': '1000PEPE Perpetual Futures bundles 1,000 Pepe meme tokens per unit to facilitate clean pricing steps and leveraged speculation.',
  'AVAXUSDT.SWAP': 'Avalanche Perpetual Swap contract provides deep derivatives liquidity for Avalanche tokens with up to 75x leverage.',
  'XRPUSDT.P': 'XRP Perpetual Futures contract enables bidirectional leveraged speculation on Ripple\'s market movements.',

  // US Stocks
  'AAPL': 'Apple Inc. is a leading global technology company that designs, develops, and sells consumer electronics (iPhone, Mac, iPad, Apple Watch), operating systems (iOS, macOS), and digital services (App Store, iCloud, Apple Pay, Apple Music).',
  'MSFT': 'Microsoft Corporation is a multinational software and cloud computing powerhouse, creator of Windows, Microsoft 365, Azure Cloud, and an industry leader in generative artificial intelligence via its strategic partnership with OpenAI.',
  'TSLA': 'Tesla, Inc. designs, manufactures, and sells electric passenger vehicles, solar energy systems, and utility-scale energy storage products (Megapack), while advancing Full Self-Driving (FSD) neural networks and humanoid robotics.',
  'NVDA': 'NVIDIA Corporation is the world leader in accelerated computing and graphics processing units (GPUs), powering enterprise artificial intelligence models, cloud data centers, and advanced graphics through its CUDA architecture and Blackwell chips.',
  'GOOGL': 'Alphabet Inc. is the parent company of Google, dominating global internet search, YouTube streaming media, Android mobile operating system, and cloud infrastructure via Google Cloud and Google DeepMind.',
  'AMZN': 'Amazon.com, Inc. is an American multinational technology company focusing on retail e-commerce, cloud computing services through AWS, digital streaming media, and global logistics infrastructure.',
  'META': 'Meta Platforms, Inc. builds technologies that connect over 3.2 billion people daily across Facebook, Instagram, WhatsApp, Messenger, and Threads, while developing open-source LLaMA foundation AI models.',
  'AMD': 'Advanced Micro Devices (AMD) develops high-performance semiconductor microprocessors (Ryzen, EPYC), graphics cards (Radeon), and data center AI accelerators (Instinct MI300X).',
  'INTC': 'Intel Corporation is an American semiconductor technology pioneer producing x86 microprocessors and investing heavily in advanced semiconductor foundries (Intel Foundry Services).',
  'BABA': 'Alibaba Group Holding Limited is a leading Chinese e-commerce and cloud technology conglomerate, operating Taobao, Tmall, AliExpress, and Alibaba Cloud.',
  'DIS': 'The Walt Disney Company is a premier multinational mass media and family entertainment conglomerate, home to Walt Disney Pictures, Pixar, Marvel Studios, Lucasfilm, Disneyland resorts, and Disney+.',
  'COIN': 'Coinbase Global, Inc. operates the largest cryptocurrency exchange in the United States, providing custody services for Wall Street spot Bitcoin and Ethereum ETFs.',
  'UBER': 'Uber Technologies, Inc. provides mobility services, ridesharing, freight logistics, and food delivery via Uber Eats across more than 70 countries worldwide.',
  'ORCL': 'Oracle Corporation provides enterprise software, relational database management systems, and high-performance cloud infrastructure (OCI) tailored for AI model training.',
  'KO': 'The Coca-Cola Company is the world\'s largest non-alcoholic beverage company, marketing famous global brands including Coca-Cola, Sprite, Fanta, Dasani, and Costa Coffee.',
  'JNJ': 'Johnson & Johnson is an American healthcare and pharmaceutical multinational corporation focused on innovative medicine, oncology, immunology, and advanced surgical medtech.',

  // Commodities
  'XAUUSD': 'Gold (XAU/USD) represents the value of one troy ounce of fine gold priced in US Dollars, serving as the ultimate global safe-haven hedge against inflation and macroeconomic volatility.',
  'XAGUSD': 'Silver (XAG/USD) is a precious metal with dual utility: serving as both an investment store of value and an essential industrial component in solar photovoltaics and electronics.',
  'USOIL': 'WTI Crude Oil is the primary pricing benchmark for the North American energy market, highly sensitive to OPEC+ production quotas, EIA petroleum storage, and global economic cycles.',
  'BRENT': 'Brent Crude Oil is extracted from the North Sea and serves as the international pricing benchmark for two-thirds of the world\'s globally traded oil shipments.',
  'NGAS': 'Natural Gas is a key fossil energy commodity utilized worldwide for domestic heating, electricity generation, and industrial chemical manufacturing.',
  'COPPER': 'High Grade Copper (\'Dr. Copper\') is widely recognized by economists as an accurate barometer of global economic health, indispensable for electrical grids, electric vehicles, and AI computing hardware.',
  'PLATINUM': 'Platinum is an ultra-rare precious metal utilized as an industrial catalytic converter, in hydrogen fuel cell clean energy technology, and for luxury jewelry.',

  // Forex
  'EURUSD': 'EUR/USD represents the foreign exchange rate between the European Union\'s Euro and the US Dollar, constituting the deepest and most liquid currency pair globally.',
  'GBPUSD': 'GBP/USD (\'Cable\') represents the British Pound against the US Dollar, reflecting bilateral trade and interest rate differentials between the UK and the US.',
  'USDJPY': 'USD/JPY reflects the currency exchange between the US Dollar and Japanese Yen, central to international Carry Trade strategies due to central bank policy differentials.',
  'GBPJPY': 'GBP/JPY (\'Guppy\') combines British Pound yields with Japanese Yen safe-haven flows, known for wide intraday trading ranges.',
  'EURJPY': 'EUR/JPY tracks the cross-rate between the Eurozone economy and Japan.',
  'AUDUSD': 'AUD/USD (\'Aussie\') represents Australia\'s commodity-driven economy, heavily correlated with global growth and raw material demand.',
  'USDCAD': 'USD/CAD (\'Loonie\') reflects bilateral North American trade and is strongly influenced by crude oil export dynamics.',
  'USDCHF': 'USD/CHF (\'Swissie\') pairs the US Dollar with the Swiss Franc, one of the world\'s premier neutral safe-haven currencies.',
  'NZDUSD': 'NZD/USD (\'Kiwi\') reflects New Zealand\'s agricultural export economy and broader global market risk sentiment.',
  'EURGBP': 'EUR/GBP tracks the direct currency equilibrium between the European Union and the post-Brexit United Kingdom.',
  'AUDJPY': 'AUD/JPY serves as a classic risk-on/risk-off sentiment barometer in global foreign exchange markets.',
  'CHFJPY': 'CHF/JPY reflects currency flows between the world\'s two foremost safe-haven jurisdictions: Switzerland and Japan.',
  'CADJPY': 'CAD/JPY combines a major oil-exporting economy (Canada) with a major energy importer (Japan).',

  // Indices
  'DXY': 'The US Dollar Index (DXY) measures the relative performance of the US Dollar against a basket of six major global currencies, heavily weighted toward the Euro.',
  'SPX': 'The S&P 500 Index tracks 500 of the largest publicly traded corporations in the United States, accounting for approximately 80% of total American equity market capitalization.',
  'NDX': 'The Nasdaq 100 Index tracks 100 of the largest non-financial corporations listed on the NASDAQ exchange, heavily weighted toward leading technology, AI, and software innovators.',
  'DJI': 'The Dow Jones Industrial Average (DJIA) tracks 30 prominent bluechip American industrial corporations, serving as a historic gauge of US commercial leadership.',
  'JP225': 'The Nikkei 225 is Japan\'s premier stock market benchmark, tracking 225 top companies listed on the Tokyo Stock Exchange including Toyota, Sony, and Nintendo.',
  'UK100': 'The FTSE 100 Index tracks the 100 largest publicly traded companies on the London Stock Exchange, including Shell, AstraZeneca, HSBC, and Unilever.',
  'EU50': 'The Euro Stoxx 50 tracks 50 bluechip industry leaders across Eurozone countries, including ASML, LVMH, SAP, and Siemens.',
  'US2000': 'The Russell 2000 Index measures the performance of 2,000 small-cap American companies, offering an accurate snapshot of the domestic US consumer economy.'
};

/**
 * Trả về thông tin cơ bản cho bất kỳ mã giao dịch nào, hỗ trợ đa ngôn ngữ (vi, en).
 */
export const getFundamentalData = (
  stock: {
    symbol: string;
    name: string;
    market?: string;
    exchange?: string;
    price?: number;
  },
  lang: string = 'vi'
): FundamentalData => {
  let baseData = FUNDAMENTAL_DATA[stock.symbol];

  if (!baseData) {
    // Tự động phân loại danh mục
    let category: AssetCategory = 'crypto';
    const m = stock.market || '';
    if (m.includes('Cổ phiếu')) category = 'stock';
    else if (m.includes('Hàng hóa')) category = 'commodity';
    else if (m.includes('Ngoại hối')) category = 'forex';
    else if (m.includes('Chỉ số')) category = 'index';
    else category = 'crypto';

    const basePrice = stock.price || 100;

    if (category === 'stock') {
      baseData = {
        symbol: stock.symbol,
        name: stock.name,
        category: 'stock',
        sector: 'Thương mại & Công nghệ',
        industry: 'Tập đoàn niêm yết',
        ceo: 'Hội đồng Quản trị',
        headquarters: 'Hoa Kỳ / Quốc tế',
        exchange: stock.exchange || 'NASDAQ / NYSE',
        marketCap: `$${(basePrice * 1.5).toFixed(0)} Tỷ USD`,
        peRatio: '28.5x',
        pbRatio: '4.2x',
        eps: `$${(basePrice * 0.035).toFixed(2)}`,
        dividendYield: '1.20%',
        fiftyTwoWeekHigh: `$${(basePrice * 1.25).toFixed(2)}`,
        fiftyTwoWeekLow: `$${(basePrice * 0.75).toFixed(2)}`,
        website: `https://finance.yahoo.com/quote/${stock.symbol}`,
        introduction: `${stock.name} (${stock.symbol}) là cổ phiếu doanh nghiệp niêm yết trên thị trường quốc tế, được giao dịch với mã khớp lệnh ${stock.symbol}. Mã này được hỗ trợ đầy đủ các công cụ phân tích kỹ thuật, dữ liệu lệnh và đòn bẩy trên nền tảng.`
      };
    } else if (category === 'commodity') {
      baseData = {
        symbol: stock.symbol,
        name: stock.name,
        category: 'commodity',
        tradingUnit: 'Đơn vị hợp đồng tiêu chuẩn',
        baseCurrency: stock.symbol,
        quoteCurrency: 'USD',
        fiftyTwoWeekHigh: `$${(basePrice * 1.2).toFixed(2)}`,
        fiftyTwoWeekLow: `$${(basePrice * 0.8).toFixed(2)}`,
        website: 'https://www.tradingview.com/markets/',
        introduction: `${stock.name} (${stock.symbol}) là mặt hàng tài nguyên - năng lượng chiến lược được giao dịch trên thị trường hàng hóa phái sinh quốc tế.`
      };
    } else if (category === 'forex') {
      baseData = {
        symbol: stock.symbol,
        name: stock.name,
        category: 'forex',
        tradingUnit: '100,000 Đơn vị tiền tệ cơ sở (1 Lot)',
        baseCurrency: stock.symbol.slice(0, 3),
        quoteCurrency: stock.symbol.slice(3, 6) || 'USD',
        pricingBenchmark: 'Thị trường Ngoại hối Liên ngân hàng Quốc tế',
        fiftyTwoWeekHigh: (basePrice * 1.08).toFixed(4),
        fiftyTwoWeekLow: (basePrice * 0.92).toFixed(4),
        website: 'https://www.tradingview.com/markets/currencies/',
        introduction: `Cặp tiền tệ ${stock.name} (${stock.symbol}) phản ánh tỷ giá quy đổi giữa hai đồng tiền pháp định quốc tế với thanh khoản cao và hoạt động liên tục 24/5.`
      };
    } else if (category === 'index') {
      baseData = {
        symbol: stock.symbol,
        name: stock.name,
        category: 'index',
        pricingBenchmark: stock.exchange || 'Sở Giao dịch Chứng khoán Quốc tế',
        fiftyTwoWeekHigh: (basePrice * 1.15).toFixed(2),
        fiftyTwoWeekLow: (basePrice * 0.85).toFixed(2),
        website: 'https://www.tradingview.com/markets/indices/',
        introduction: `${stock.name} (${stock.symbol}) là chỉ số thị trường đại diện cho rổ tài sản tài chính then chốt, phản ánh tổng quan sức khỏe kinh tế và xu hướng thị trường.`
      };
    } else {
      baseData = {
        symbol: stock.symbol,
        name: stock.name,
        category: 'crypto',
        marketCap: `$${(basePrice * 250).toLocaleString()} USD`,
        circulatingSupply: 'Đang lưu hành',
        maxSupply: 'Theo giao thức',
        rank: '#TOP',
        website: 'https://coinmarketcap.com/',
        introduction: `${stock.name} (${stock.symbol}) là tài sản mã hóa blockchain được niêm yết giao dịch trên sàn với tính thanh khoản cao và hỗ trợ giao dịch đòn bẩy.`
      };
    }
  }

  // Nếu người dùng chọn tiếng Anh (en)
  if (lang === 'en') {
    return {
      ...baseData,
      introduction: INTRODUCTION_EN[stock.symbol] || baseData.introductionEn || baseData.introduction,
      sector: SECTOR_TRANSLATIONS[baseData.sector || ''] || baseData.sectorEn || baseData.sector,
      industry: INDUSTRY_TRANSLATIONS[baseData.industry || ''] || baseData.industryEn || baseData.industry,
      circulatingSupply: baseData.circulatingSupply?.replace('Đang lưu hành', 'In Circulation'),
      maxSupply: baseData.maxSupply?.replace('Không giới hạn', 'Unlimited').replace('Theo giao thức', 'Protocol governed'),
      tradingUnit: baseData.tradingUnit?.replace('Đơn vị hợp đồng tiêu chuẩn', 'Standard Contract Unit').replace('Đơn vị tiền tệ cơ sở', 'Base Currency Units'),
    };
  }

  return baseData;
};

/**
 * Phân tích chuỗi số có chữ B, M, T hoặc dấu phẩy thành giá trị số nguyên/thực
 */
export const parseRawSupply = (val?: string): number => {
  if (!val) return 0;
  let clean = val.replace(/,/g, '').replace(/\$/g, '').trim();
  const match = clean.match(/^([\d.]+)\s*([A-Za-z]*)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return 0;
  const unit = match[2]?.toUpperCase() || '';
  if (unit === 'T') return num * 1e12;
  if (unit === 'B') return num * 1e9;
  if (unit === 'M') return num * 1e6;
  if (unit === 'K') return num * 1e3;
  return num;
};

export const parseDollarValue = (val?: string): number => {
  if (!val) return 0;
  let clean = val.replace(/,/g, '').replace(/\$/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const formatLiveUSD = (val?: number, compact = false): string => {
  if (!val || isNaN(val) || val <= 0) return '--';
  if (compact) {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
  return `$${Math.round(val).toLocaleString('en-US')}`;
};

export interface RealtimeFundamentalResult {
  marketCapLive: string;
  marketCapCompact: string;
  marketCapRaw: number;
  fdvLive?: string;
  fdvCompact?: string;
  fdvRaw?: number;
  peRatioLive?: string;
  dividendYieldLive?: string;
  distanceToATH?: string;
  distanceTo52wHigh?: string;
  distanceTo52wLow?: string;
  circulatingSupply: string;
  maxSupply: string;
}

/**
 * Tính toán toàn bộ chỉ số tài chính theo GIÁ THỰC TẾ (Real-Time Price)
 */
export const calculateRealtimeMetrics = (
  data: FundamentalData,
  currentPrice: number
): RealtimeFundamentalResult => {
  const isStock = data.category === 'stock';
  const isCrypto = data.category === 'crypto' || !data.category;

  let marketCapRaw = 0;
  let fdvRaw = 0;
  let peRatioLive: string | undefined = undefined;
  let dividendYieldLive: string | undefined = undefined;
  let distanceToATH: string | undefined = undefined;
  let distanceTo52wHigh: string | undefined = undefined;
  let distanceTo52wLow: string | undefined = undefined;

  if (isStock) {
    // 1. Cổ phiếu
    const shares = data.sharesOutstandingRaw || parseRawSupply(data.sharesOutstanding);
    if (shares > 0 && currentPrice > 0) {
      marketCapRaw = shares * currentPrice;
    }

    const eps = data.epsRaw || parseDollarValue(data.eps);
    if (eps > 0 && currentPrice > 0) {
      peRatioLive = `${(currentPrice / eps).toFixed(1)}x`;
    } else {
      peRatioLive = data.peRatio;
    }

    const divPerShare = data.annualDividendPerShareRaw;
    if (divPerShare !== undefined && divPerShare > 0 && currentPrice > 0) {
      dividendYieldLive = `${((divPerShare / currentPrice) * 100).toFixed(2)}%`;
    } else {
      dividendYieldLive = data.dividendYield;
    }

    const h52 = data.fiftyTwoWeekHighRaw || parseDollarValue(data.fiftyTwoWeekHigh);
    if (h52 > 0 && currentPrice > 0) {
      const pct = ((currentPrice - h52) / h52) * 100;
      distanceTo52wHigh = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    }

    const l52 = data.fiftyTwoWeekLowRaw || parseDollarValue(data.fiftyTwoWeekLow);
    if (l52 > 0 && currentPrice > 0) {
      const pct = ((currentPrice - l52) / l52) * 100;
      distanceTo52wLow = `+${pct.toFixed(1)}%`;
    }
  } else if (isCrypto) {
    // 2. Tiền điện tử
    const circSupply = data.circulatingSupplyRaw || parseRawSupply(data.circulatingSupply);
    if (circSupply > 0 && currentPrice > 0) {
      marketCapRaw = circSupply * currentPrice;
    }

    const maxSup = data.maxSupplyRaw || parseRawSupply(data.maxSupply) || circSupply;
    if (maxSup > 0 && currentPrice > 0) {
      fdvRaw = maxSup * currentPrice;
    }

    const ath = data.athRaw || parseDollarValue(data.allTimeHigh);
    if (ath > 0 && currentPrice > 0) {
      const pct = ((currentPrice - ath) / ath) * 100;
      distanceToATH = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    }
  } else {
    // 3. Hàng hóa / Ngoại hối / Chỉ số
    const h52 = data.fiftyTwoWeekHighRaw || parseDollarValue(data.fiftyTwoWeekHigh);
    if (h52 > 0 && currentPrice > 0) {
      const pct = ((currentPrice - h52) / h52) * 100;
      distanceTo52wHigh = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    }
    const l52 = data.fiftyTwoWeekLowRaw || parseDollarValue(data.fiftyTwoWeekLow);
    if (l52 > 0 && currentPrice > 0) {
      const pct = ((currentPrice - l52) / l52) * 100;
      distanceTo52wLow = `+${pct.toFixed(1)}%`;
    }
  }

  return {
    marketCapRaw,
    marketCapLive: marketCapRaw > 0 ? formatLiveUSD(marketCapRaw, false) : (data.marketCap || '--'),
    marketCapCompact: marketCapRaw > 0 ? formatLiveUSD(marketCapRaw, true) : (data.marketCap || '--'),
    fdvRaw,
    fdvLive: fdvRaw > 0 ? formatLiveUSD(fdvRaw, false) : (data.fullyDilutedValuation || '--'),
    fdvCompact: fdvRaw > 0 ? formatLiveUSD(fdvRaw, true) : (data.fullyDilutedValuation || '--'),
    peRatioLive,
    dividendYieldLive,
    distanceToATH,
    distanceTo52wHigh,
    distanceTo52wLow,
    circulatingSupply: data.circulatingSupply || '--',
    maxSupply: data.maxSupply || '--',
  };
};

