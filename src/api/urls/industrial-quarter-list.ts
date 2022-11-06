import { axiosInstance } from 'src/boot/axios';
import mocks from './mocks';
import { isUseMocks } from 'src/api';

export interface IIndustrialQuarterListGetRequest {
	offset: number;
	limit: number;
}

export interface IIndustrialQuarterListItem {
	id: number;
	zuArea: number;
	author: string;
	date: string;
	grade: number;
	workerCount: number;
}

export interface IIndustrialQuarterListGetResponse {
	success: number;
	items: IIndustrialQuarterListItem[];
	total: number;
}

export default {
	get(
		params: IIndustrialQuarterListGetRequest
	): Promise<IIndustrialQuarterListGetResponse> {
		if (isUseMocks) {
			return mocks.industrialQuarterList.get(params);
		}

		return axiosInstance.get('/api/v1/industrialQuarters', { params });
	},
};
