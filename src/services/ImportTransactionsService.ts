import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const records = fs.createReadStream(filename);

    const parses = csvParse({
      from_line: 2,
    })

    const parseCSV = records.pipe(parses);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [ title, type, value, category ] = line.map((cell: string) => cell.trim());

      if (!title || !type || !value) return;

      if (category) {
        categories.push(category);
      }

      transactions.push({ title, type, value, category });
    })

    await new Promise(resolve => parseCSV.on('end', resolve))

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });

    const existentCategoriesTitles = existentCategories.map(category => category.title);

    const categoriesToInsert = categories.filter(
      category => !existentCategoriesTitles.includes(category)
    ).reduce((unique: string[], item: string) => {
      return unique.includes(item) ? unique : [...unique, item];
    }, []);

    const newCategories = categoriesRepository.create(
      categoriesToInsert.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [ ...newCategories, ...existentCategories ];

    const newTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category
        )
      })),
    );

    return  await transactionsRepository.save(newTransactions);
  }
}

export default ImportTransactionsService;
