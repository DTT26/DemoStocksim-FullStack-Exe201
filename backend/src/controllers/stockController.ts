import { Request, Response } from 'express';
import { vnStockService } from '../services/vnStockService';

export const getKlines = async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'FPT';
    const resolution = (req.query.resolution as string) || (req.query.timeframe as string) || 'D';
    const from = req.query.from ? parseInt(req.query.from as string, 10) : undefined;
    const to = req.query.to ? parseInt(req.query.to as string, 10) : undefined;

    const data = await vnStockService.getKlines(symbol, resolution, from, to);
    return res.status(200).json({
      success: true,
      symbol,
      resolution,
      count: data.length,
      data
    });
  } catch (error: any) {
    console.error('[StockController] getKlines error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu nến chứng khoán',
      error: error.message
    });
  }
};

export const getQuotes = async (req: Request, res: Response) => {
  try {
    const rawSymbols = (req.query.symbols as string) || 'FPT,HPG,VCB,SSI,VIC,VNINDEX,VN30';
    const symbols = rawSymbols
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const quotes = await vnStockService.getQuotes(symbols);
    return res.status(200).json({
      success: true,
      data: quotes
    });
  } catch (error: any) {
    console.error('[StockController] getQuotes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo giá chứng khoán',
      error: error.message
    });
  }
};
