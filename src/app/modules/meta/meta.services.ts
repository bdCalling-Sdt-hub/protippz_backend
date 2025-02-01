import League from '../league/league.model';
import NormalUser from '../normalUser/normalUser.model';
import Player from '../player/player.model';
import Team from '../team/team.model';
import Tip from '../tip/tip.model';

const getAdminDashboardMetaDataFromDB = async () => {
  const totalUser = await NormalUser.countDocuments();
  const totalLeague = await League.countDocuments();
  const totalTeam = await Team.countDocuments();
  const totalPlayer = await Player.countDocuments();
  const result = await Tip.aggregate([
    {
      $group: {
        _id: null,
        totalTip: { $sum: '$amount' },
      },
    },
  ]);

  const totalTip = result.length ? result[0].totalTip : 0;
  return {
    totalUser,
    totalLeague,
    totalTeam,
    totalPlayer,
    totalTip,
  };
};

const getChartDataForTips = async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const monthlyTips = await Tip.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
    {
      $project: {
        month: '$_id.month',
        totalAmount: 1,
        _id: 0,
      },
    },
  ]);

  // Define all 12 months with default totalAmount as 0
  const allMonths = [
    { month: 'Jan', totalAmount: 0 },
    { month: 'Feb', totalAmount: 0 },
    { month: 'Mar', totalAmount: 0 },
    { month: 'Apr', totalAmount: 0 },
    { month: 'May', totalAmount: 0 },
    { month: 'Jun', totalAmount: 0 },
    { month: 'Jul', totalAmount: 0 },
    { month: 'Aug', totalAmount: 0 },
    { month: 'Sep', totalAmount: 0 },
    { month: 'Oct', totalAmount: 0 },
    { month: 'Nov', totalAmount: 0 },
    { month: 'Dec', totalAmount: 0 },
  ];

  // Map the month number from aggregation result to month name and merge
  // const result = allMonths.map((monthData, index) => {
  //   const monthResult = monthlyTips.find((tip) => tip.month === index + 1);
  //   return {
  //     month: monthData.month,
  //     totalAmount: monthResult ? monthResult.totalAmount : 0,
  //   };
  // });

  // return result;
  const result = allMonths.map((monthData, index) => {
    const monthResult = monthlyTips.find((tip) => tip.month === index + 1);
    const totalAmount = monthResult ? monthResult.totalAmount : 0;
    const profit = totalAmount * 0.1; // Calculate 10% profit
    return {
      month: monthData.month,
      totalAmount,
      profit,
    };
  });

  return result;
};
const getUserChartData = async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const monthlyUserCounts = await NormalUser.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        userCount: { $sum: 1 }, // Counting users
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
    {
      $project: {
        month: '$_id.month',
        userCount: 1,
        _id: 0,
      },
    },
  ]);

  // Define all 12 months with default userCount as 0
  const allMonths = [
    { month: 'Jan', userCount: 0 },
    { month: 'Feb', userCount: 0 },
    { month: 'Mar', userCount: 0 },
    { month: 'Apr', userCount: 0 },
    { month: 'May', userCount: 0 },
    { month: 'Jun', userCount: 0 },
    { month: 'Jul', userCount: 0 },
    { month: 'Aug', userCount: 0 },
    { month: 'Sep', userCount: 0 },
    { month: 'Oct', userCount: 0 },
    { month: 'Nov', userCount: 0 },
    { month: 'Dec', userCount: 0 },
  ];

  // Map the month number from aggregation result to month name and merge
  const result = allMonths.map((monthData, index) => {
    const monthResult = monthlyUserCounts.find(
      (user) => user.month === index + 1,
    );
    return {
      month: monthData.month,
      userCount: monthResult ? monthResult.userCount : 0,
    };
  });

  return result;
};

const metaServices = {
  getAdminDashboardMetaDataFromDB,
  getChartDataForTips,
  getUserChartData,
};

export default metaServices;
