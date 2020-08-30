import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import logger from '../logger';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (accumulator, transaction: Transaction) => {
        accumulator[transaction.type] += Number(transaction.value);

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    const total = balance.income - balance.outcome;
    
    logger.child({ balance }).debug("test from TransactionsRepository#getBalance");
    logger.child({ total }).info("test2 from TransactionsRepository#getBalance");

    return {
      ...balance,
      total,
    };
  }
}

export default TransactionsRepository;
