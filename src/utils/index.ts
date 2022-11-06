import { ICommonError } from 'src/api';

export * from './user';

export const isError = (error: unknown): error is ICommonError => {
	return !!error && typeof (error as ICommonError).code === 'string';
};
