// 获取汇率
exports.getRates = async (req, res) => {
  try {
    // 这里可以集成真实的汇率API，现在返回模拟数据
    const rates = {
      USD: {
        CNY: 7.2,
        EUR: 0.85,
        JPY: 110.5
      },
      CNY: {
        USD: 0.14,
        EUR: 0.12,
        JPY: 15.3
      },
      EUR: {
        USD: 1.18,
        CNY: 8.47,
        JPY: 130.0
      }
    };

    res.json({
      success: true,
      data: rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取汇率失败:', error);
    res.status(500).json({ message: '获取汇率失败' });
  }
}; 