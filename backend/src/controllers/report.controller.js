const Transaction = require('../models/transaction.model');
const Vip = require('../models/vip.model');
const Technician = require('../models/technician.model');
const Project = require('../models/project.model');
const DailyReport = require('../models/dailyReport.model');

// 获取所有交易记录
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, vipId, technicianId } = req.query;

    // 构建查询条件
    const query = {};

    // 按时间范围筛选
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        // 设置本地时区的开始时间
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        // 设置本地时区的结束时间
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 按交易类型筛选
    if (type) {
      query.type = type;
    }

    // 按VIP筛选
    if (vipId) {
      query.vip = vipId;
    }

    // 按技师筛选
    if (technicianId) {
      query.technician = technicianId;
    }

    // 执行查询并填充关联数据
    const transactions = await Transaction.find(query)
      .populate('vip', 'name phone')
      .populate('technician', 'name code')
      .populate('projects.project', 'name price')
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取充值报表
exports.getRechargeReport = async (req, res) => {
  try {
    const { startDate, endDate, phone } = req.query;

    // 构建查询条件
    const query = { type: 'recharge' };

    // 按时间范围筛选
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 按手机号筛选
    if (phone) {
      const vips = await Vip.find({ 
        phone: { 
          $regex: phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // Escape special regex characters
          $options: 'i' 
        } 
      });
      const vipIds = vips.map(vip => vip._id);
      query.vip = { $in: vipIds };
    }

    // 执行查询并填充关联数据
    const transactions = await Transaction.find(query)
      .populate('vip', 'name phone')
      .populate('technician', 'name code')
      .sort({ date: -1 });

    // 计算总充值金额
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // 汇总每位VIP的充值金额
    const vipSummary = {};
    transactions.forEach(t => {
      const vipId = t.vip._id.toString();
      if (!vipSummary[vipId]) {
        vipSummary[vipId] = {
          vip: t.vip,
          totalAmount: 0,
          count: 0
        };
      }
      vipSummary[vipId].totalAmount += t.amount;
      vipSummary[vipId].count += 1;
    });

    res.status(200).json({
      transactions,
      summary: {
        totalAmount,
        totalCount: transactions.length,
        vipSummary: Object.values(vipSummary)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取消费报表
exports.getConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate, technicianId, phone } = req.query;

    console.log('消费报表查询参数:', { startDate, endDate, technicianId, phone });

    // 构建查询条件
    const query = { type: 'consume' };

    // 按时间范围筛选 - 使用统一的时区处理
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
        console.log('开始时间:', start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
        console.log('结束时间:', end);
      }
    }

    // 按技师筛选
    if (technicianId) {
      query.technician = technicianId;
    }

    // 按手机号筛选
    if (phone) {
      const vips = await Vip.find({ 
        phone: { 
          $regex: phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // Escape special regex characters
          $options: 'i' 
        } 
      });
      const vipIds = vips.map(vip => vip._id);
      query.vip = { $in: vipIds };
    }

    console.log('查询条件:', JSON.stringify(query, null, 2));

    // 执行查询并填充关联数据
    const transactions = await Transaction.find(query)
      .populate('vip', 'name phone')
      .populate('technician', 'name code')
      .populate('projects.project', 'name price')
      .sort({ date: -1 });

    console.log('查询到的交易数量:', transactions.length);
    console.log('前3条交易记录:', transactions.slice(0, 3).map(t => ({
      id: t._id,
      date: t.date,
      type: t.type,
      amount: t.amount,
      vip: t.vip?.name,
      technician: t.technician?.name
    })));

    // 计算总消费金额
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // 汇总技师业绩
    const technicianSummary = {};
    // 汇总项目消费
    const projectSummary = {};

    transactions.forEach(t => {
      // 技师业绩统计
      if (t.technician) {
        const techId = t.technician._id.toString();
        if (!technicianSummary[techId]) {
          technicianSummary[techId] = {
            technician: t.technician,
            totalAmount: 0,
            count: 0
          };
        }
        technicianSummary[techId].totalAmount += t.amount;
        technicianSummary[techId].count += 1;
      }

      // 项目消费统计
      if (t.projects && t.projects.length) {
        t.projects.forEach(p => {
          if (p.project) {
            const projId = p.project._id.toString();
            if (!projectSummary[projId]) {
              projectSummary[projId] = {
                project: p.project,
                totalQuantity: 0,
                totalAmount: 0
              };
            }
            projectSummary[projId].totalQuantity += p.quantity;
            projectSummary[projId].totalAmount += p.project.price * p.quantity;
          }
        });
      }
    });

    res.status(200).json({
      transactions,
      summary: {
        totalAmount,
        totalCount: transactions.length,
        technicianSummary: Object.values(technicianSummary),
        projectSummary: Object.values(projectSummary)
      }
    });
  } catch (error) {
    console.error('消费报表查询失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create date range query
const getDateRangeQuery = (startDate, endDate, field = 'date') => {
  const query = {};
  if (startDate || endDate) {
    query[field] = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      query[field].$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      query[field].$lte = end;
    }
  }
  return query;
};

// 获取 VIP 概览数据 - CORRECTED to use 'date' for transactions
exports.getVipSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactionDateQuery = getDateRangeQuery(startDate, endDate, 'date'); // Use 'date' for Transactions
    const vipCreationDateQuery = getDateRangeQuery(startDate, endDate, 'createdAt'); // Use 'createdAt' for Vips

    // 1. Aggregate Recharge and Consumption totals
    const transactionAgg = await Transaction.aggregate([
      { $match: { ...transactionDateQuery, type: { $in: ['recharge', 'consume'] } } }, // 修正：使用 'consume' 而不是 'consumption'
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          activeMembersSet: {
            $addToSet: { $cond: [{ $eq: ['$type', 'consume'] }, '$vip', null] } // 修正：使用 'consume'
          }
        }
      }
    ]);

    const rechargeTotal = transactionAgg.find(g => g._id === 'recharge')?.totalAmount || 0;
    const consumptionTotal = transactionAgg.find(g => g._id === 'consume')?.totalAmount || 0; // 修正：使用 'consume'
    const activeMembersList = transactionAgg.find(g => g._id === 'consume')?.activeMembersSet || []; // 修正：使用 'consume'
    const activeMembers = activeMembersList.filter(vipId => vipId !== null).length;

    // 2. Count New VIPs created in the date range
    const newMembers = await Vip.countDocuments(vipCreationDateQuery); // Use vipCreationDateQuery

    res.status(200).json({
      totalRecharge: rechargeTotal,
      totalConsumption: consumptionTotal,
      newMembers: newMembers,
      activeMembers: activeMembers
    });

  } catch (error) {
    console.error("Error fetching VIP summary:", error);
    res.status(500).json({ message: error.message });
  }
};

// 获取平台 (Douyin/Meituan/POS) 概览数据
exports.getPlatformSummary = async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;

    if (!platform || !['douyin', 'meituan', 'pos'].includes(platform.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid or missing platform parameter (douyin, meituan, or pos required)' });
    }

    // 构建日期查询条件
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 从日报中获取数据
    const reports = await DailyReport.find(query);

    const summary = reports.reduce((acc, report) => {
      const platformData = report[platform.toLowerCase()];
      if (platformData) {
        acc.totalRevenue += platformData.revenue || 0;
        acc.totalHours += platformData.hours || 0;
        acc.orderCount += 1;
      }
      return acc;
    }, { totalRevenue: 0, totalHours: 0, orderCount: 0 });

    res.status(200).json(summary);

  } catch (error) {
    console.error(`Error fetching ${req.query.platform} summary:`, error);
    res.status(500).json({ message: error.message });
  }
};

// 获取现金/POS 概览数据
exports.getCashSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 构建日期查询条件
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 从日报中获取数据
    const reports = await DailyReport.find(query);

    const summary = reports.reduce((acc, report) => {
      if (report.cash) {
        acc.totalRevenue += report.cash.revenue || 0;
        acc.totalHours += report.cash.hours || 0;
      }
      acc.transactionCount += 1;
      return acc;
    }, { totalRevenue: 0, totalHours: 0, transactionCount: 0 });

    res.status(200).json(summary);

  } catch (error) {
    console.error('Error fetching cash summary:', error);
    res.status(500).json({ message: error.message });
  }
};

// 创建或更新手动导入的日报
exports.createDailyReport = async (req, res) => {
  try {
    const {
      date,
      douyinHours, douyinRevenue,
      meituanHours, meituanRevenue,
      cashHours, cashRevenue,
      posHours, posRevenue
    } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required for the daily report.' });
    }

    // 准备报告数据对象
    const reportData = {
      date: new Date(date),
      douyin: {
        hours: douyinHours || 0,
        revenue: douyinRevenue || 0
      },
      meituan: {
        hours: meituanHours || 0,
        revenue: meituanRevenue || 0
      },
      cash: {
        hours: cashHours || 0,
        revenue: cashRevenue || 0
      },
      pos: {
        hours: posHours || 0,
        revenue: posRevenue || 0
      },
      updatedAt: new Date()
    };

    // 设置日期为当天的开始时间（UTC）
    const startOfDay = new Date(reportData.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    reportData.date = startOfDay;

    // 查找并更新或创建日报记录
    const updatedReport = await DailyReport.findOneAndUpdate(
      { date: startOfDay },
      { $set: reportData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json(updatedReport);

  } catch (error) {
    console.error("Error creating/updating daily report:", error);
    res.status(500).json({ message: error.message });
  }
};
