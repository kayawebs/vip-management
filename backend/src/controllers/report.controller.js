const Transaction = require('../models/transaction.model');
const Vip = require('../models/vip.model');
const Technician = require('../models/technician.model');
const Project = require('../models/project.model');

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