import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

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

    return {
      ...balance,
      total: balance.income - balance.outcome,
    };
  }
}

export default TransactionsRepository;
