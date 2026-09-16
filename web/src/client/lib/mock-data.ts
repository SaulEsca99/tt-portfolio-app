export const holdings = [
  { symbol: 'VTI', name: 'Vanguard Total Stock', weight: 42, value: '$42,000', change: '+8.4%', positive: true },
  { symbol: 'VXUS', name: 'Vanguard Intl. Stock', weight: 22, value: '$22,000', change: '+3.1%', positive: true },
  { symbol: 'BND', name: 'Vanguard Total Bond', weight: 20, value: '$20,000', change: '-1.2%', positive: false },
  { symbol: 'VNQ', name: 'Vanguard Real Estate', weight: 10, value: '$10,000', change: '+5.8%', positive: true },
  { symbol: 'CASH', name: 'Cash & Equivalents', weight: 6, value: '$6,000', change: '0.0%', positive: true }
];

export const equityData = [
  { month: 'Jan', portfolio: 100, benchmark: 100 },
  { month: 'Feb', portfolio: 101.8, benchmark: 100.7 },
  { month: 'Mar', portfolio: 99.5, benchmark: 98.9 },
  { month: 'Apr', portfolio: 103.8, benchmark: 102.1 },
  { month: 'May', portfolio: 106.2, benchmark: 104.7 },
  { month: 'Jun', portfolio: 105.1, benchmark: 104.3 },
  { month: 'Jul', portfolio: 109.5, benchmark: 107.5 },
  { month: 'Aug', portfolio: 112.7, benchmark: 110.1 },
  { month: 'Sep', portfolio: 114.4, benchmark: 112.6 },
  { month: 'Oct', portfolio: 117.9, benchmark: 114.8 },
  { month: 'Nov', portfolio: 116.5, benchmark: 115.4 },
  { month: 'Dec', portfolio: 121.4, benchmark: 118.2 }
];

export const allocationData = holdings.map((item, index) => ({
  name: item.symbol,
  value: item.weight,
  fill: ['#62d7c6', '#8fa7ff', '#f0b36b', '#d68cf2', '#7f8a9b'][index]
}));

export const marketData = [
  { ticker: 'SPY', name: 'S&P 500 ETF', price: '$563.21', change: '+0.74%', positive: true },
  { ticker: 'QQQ', name: 'Nasdaq 100 ETF', price: '$482.10', change: '+1.12%', positive: true },
  { ticker: 'IWM', name: 'Russell 2000 ETF', price: '$218.54', change: '-0.28%', positive: false },
  { ticker: 'TLT', name: '20+ Year Treasury', price: '$92.18', change: '-0.61%', positive: false },
  { ticker: 'GLD', name: 'Gold Trust', price: '$245.90', change: '+0.36%', positive: true }
];
