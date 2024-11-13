/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { ENUM_TRANSACTION_STATUS } from '../../utilities/enum';
import Transaction from './transaction.model';

const getAllTransactionFromDB = async (query: Record<string, any>) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({ status: ENUM_TRANSACTION_STATUS.SUCCESS }).populate({path:"entityId"}),
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



const getMyTransactionFromDB = async(profileId:string,query:Record<string,any>)=>{
    const transactionQuery = new QueryBuilder(
        Transaction.find({ status: ENUM_TRANSACTION_STATUS.SUCCESS,entityId:profileId}),
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
}



const transactionServices = {
    getAllTransactionFromDB,
    getMyTransactionFromDB
}

export default transactionServices;