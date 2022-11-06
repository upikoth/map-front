import { axiosInstance } from 'src/boot/axios';
import mocks from './mocks';
import { isUseMocks } from 'src/api';

export interface IUserListGetRequest {
	offset: number;
	limit: number;
}

export interface IUserListGetItemResponse {
	id: number;
	login: string;
	firstName: string;
	secondName: string;
	patronymic?: string;
}

export interface IUserListGetResponse {
	users: IUserListGetItemResponse[];
	total: number;
}

export default {
	get(params: IUserListGetRequest): Promise<IUserListGetResponse> {
		if (isUseMocks) {
			return mocks.userList.get(params);
		}

		return axiosInstance.get('/api/v1/users', { params });
	},
};
