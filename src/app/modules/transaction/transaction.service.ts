/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { ENUM_TRANSACTION_STATUS } from '../../utilities/enum';
import Transaction from './transaction.model';
import cron from 'node-cron';
const getAllTransactionFromDB = async (query: Record<string, any>) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({ status: ENUM_TRANSACTION_STATUS.SUCCESS }).populate({
      path: 'entityId',
    }),
    query,
  )
    .search(['entityType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();

  const result = await transactionQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const getMyTransactionFromDB = async (
  profileId: string,
  query: Record<string, any>,
) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({
      status: ENUM_TRANSACTION_STATUS.SUCCESS,
      entityId: profileId,
    }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();

  const result = await transactionQuery.modelQuery;
  return {
    meta,
    result,
  };
};

// crone jobs
cron.schedule('*/2 * * * *', async () => {
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
  try {
    const deletePendingTransactions = await Transaction.deleteMany({
      status: 'pending',
      createdAt: { $lt: twoMinsAgo },
    });
    console.log(
      `Deleted ${deletePendingTransactions.deletedCount} pending transactions.`,
    );
  } catch (error) {
    console.error('Error processing old redeem requests:', error);
  }
});

const transactionServices = {
  getAllTransactionFromDB,
  getMyTransactionFromDB,
};

export default transactionServices;
