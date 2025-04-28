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
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // 设置结束日期为当天的23:59:59
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
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
    const { startDate, endDate } = req.query;
    
    // 构建查询条件
    const query = { type: 'recharge' };
    
    // 按时间范围筛选
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // 设置结束日期为当天的23:59:59
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    // 执行查询并填充VIP数据
    const transactions = await Transaction.find(query)
      .populate('vip', 'name phone')
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
    const { startDate, endDate, technicianId } = req.query;
    
    // 构建查询条件
    const query = { type: 'consumption' };
    
    // 按时间范围筛选
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // 设置结束日期为当天的23:59:59
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
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
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create date range query - CORRECTED to use 'date'
const getDateRangeQuery = (startDate, endDate, field = 'date') => { // Use 'date' by default
  const query = {};
  if (startDate || endDate) {
    query[field] = {}; // Use dynamic field name
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query[field].$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
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
      { $match: { ...transactionDateQuery, type: { $in: ['recharge', 'consumption'] } } }, // Use transactionDateQuery
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          activeMembersSet: {
            $addToSet: { $cond: [{ $eq: ['$type', 'consumption'] }, '$vip', null] }
          }
        }
      }
    ]);

    const rechargeTotal = transactionAgg.find(g => g._id === 'recharge')?.totalAmount || 0;
    const consumptionTotal = transactionAgg.find(g => g._id === 'consumption')?.totalAmount || 0;
    const activeMembersList = transactionAgg.find(g => g._id === 'consumption')?.activeMembersSet || [];
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

// 获取平台 (Douyin/Meituan) 概览数据 - CORRECTED to use 'date'
exports.getPlatformSummary = async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;

    if (!platform || !['douyin', 'meituan'].includes(platform.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid or missing platform parameter (douyin or meituan required)' });
    }

    const dateQuery = getDateRangeQuery(startDate, endDate, 'date'); // Use 'date'

    const platformAgg = await Transaction.aggregate([
       // Match uses 'date' now via dateQuery
       { $match: { ...dateQuery, type: 'consumption', paymentMethod: platform.toLowerCase() } }, 
       {
         $group: {
           _id: null, 
           totalRevenue: { $sum: '$amount' },
           orderCount: { $sum: 1 }
           // totalHours: { $sum: '$hours' } 
         }
       }
    ]);

    const summary = platformAgg[0] || { totalRevenue: 0, orderCount: 0 };

    res.status(200).json({
      totalRevenue: summary.totalRevenue,
      orderCount: summary.orderCount
      // totalHours: summary.totalHours
    });

  } catch (error) {
      console.error(`Error fetching ${platform} summary:`, error);
      res.status(500).json({ message: error.message });
  }
};

// 获取现金/POS 概览数据 - CORRECTED to use 'date'
exports.getCashSummary = async (req, res) => {
   try {
    const { startDate, endDate } = req.query;
    const dateQuery = getDateRangeQuery(startDate, endDate, 'date'); // Use 'date'

     const cashPosAgg = await Transaction.aggregate([
       // Match uses 'date' now via dateQuery
       { $match: { ...dateQuery, type: 'consumption', paymentMethod: { $in: ['cash', 'pos'] } } }, 
       {
         $group: {
           _id: '$paymentMethod', 
           totalRevenue: { $sum: '$amount' },
           transactionCount: { $sum: 1 }
           // totalHours: { $sum: '$hours' } 
         }
       }
    ]);

    const cashTotal = cashPosAgg.find(g => g._id === 'cash') || { totalRevenue: 0, transactionCount: 0 };
    const posTotal = cashPosAgg.find(g => g._id === 'pos') || { totalRevenue: 0, transactionCount: 0 };

    const combinedSummary = {
        totalRevenue: (cashTotal.totalRevenue || 0) + (posTotal.totalRevenue || 0),
        transactionCount: (cashTotal.transactionCount || 0) + (posTotal.transactionCount || 0)
        // totalHours: ...
    }

    res.status(200).json(combinedSummary);

  } catch (error) {
      console.error("Error fetching Cash/POS summary:", error);
      res.status(500).json({ message: error.message });
  }
};

// 创建或更新手动导入的日报
exports.createDailyReport = async (req, res) => {
  try {
    const {
      date, // Expecting YYYY-MM-DD string or Date object
      douyinHours, douyinRevenue,
      meituanHours, meituanRevenue,
      cashHours, cashRevenue,
      posHours, posRevenue
      // createdBy // Optional: Pass user identifier if available
    } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required for the daily report.' });
    }

    // Prepare the report data object
    const reportData = {
      date: new Date(date), // Ensure it's a Date object
      douyin: { hours: douyinHours || 0, revenue: douyinRevenue || 0 },
      meituan: { hours: meituanHours || 0, revenue: meituanRevenue || 0 },
      cash: { hours: cashHours || 0, revenue: cashRevenue || 0 },
      pos: { hours: posHours || 0, revenue: posRevenue || 0 },
      // createdBy: createdBy // Set if provided
      updatedAt: new Date() // Explicitly set update time
    };

    // Use findOneAndUpdate with upsert: true to create if not exists, update if exists
    // Match based on the date (set to start of day by pre-save hook)
    const startOfDay = new Date(reportData.date);
    startOfDay.setHours(0, 0, 0, 0);

    const updatedReport = await DailyReport.findOneAndUpdate(
      { date: startOfDay },
      { $set: reportData },
      {
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        runValidators: true, // Ensure schema validation runs
        setDefaultsOnInsert: true // Apply defaults if creating new
      }
    );

    res.status(201).json(updatedReport);

  } catch (error) {
    console.error("Error creating/updating daily report:", error);
    // Handle potential duplicate key error if unique index fails unexpectedly
    if (error.code === 11000) {
        return res.status(409).json({ message: `Daily report for date ${date} already exists or conflict occurred.` });
    }
    res.status(500).json({ message: error.message });
  }
}; 