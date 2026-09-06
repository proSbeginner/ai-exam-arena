export type DataSource = 'mock' | 'supabase';

export class DataSourceConfigError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'INVALID_DATA_SOURCE',
  ) {
    super(message);
  }
}

export function getDataSource(): DataSource {
  const dataSource = process.env.DATA_SOURCE;

  if (dataSource === 'mock' || dataSource === 'supabase') {
    return dataSource;
  }

  throw new DataSourceConfigError(
    'DATA_SOURCE must be set to either "mock" or "supabase".',
  );
}
