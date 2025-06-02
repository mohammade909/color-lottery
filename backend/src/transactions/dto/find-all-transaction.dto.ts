import { Transaction } from "../entities/transaction.entity";

export class FindAllTransactionsDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  type?: 'deposit' | 'withdrawal';
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'timestamp' | 'amount' | 'type' | 'status' = 'timestamp';
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}

export class PaginatedTransactionResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}