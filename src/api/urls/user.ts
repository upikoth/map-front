import { axiosInstance } from 'src/boot/axios';
import mocks from './mocks';
import { isUseMocks } from 'src/api';

export interface IUserGetResponse {
	id: string;
	email: string;
	role: UserRole;
	firstName: string;
	secondName: string;
	patronymic?: string;
}

export enum UserRole {
	SuperAdmin = 'super-admin',
	Admin = 'admin',
	User = 'user',
}

export interface IUserPatchRequest {
	id: string;
	email?: string;
	firstName?: string;
	secondName?: string;
	patronymic?: string;
}

export interface IUserGetRequest {
	id?: string;
}

export interface IUserPostRequest {
	email: string;
	password: string;
	role: UserRole;
	firstName: string;
	secondName: string;
	patronymic?: string;
}

export interface IUserDeleteRequest {
	id: number;
}

export default {
	async get(params?: IUserGetRequest): Promise<IUserGetResponse> {
		if (isUseMocks) {
			return mocks.user.get();
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const { user } = await axiosInstance.get('/api/v1/session', { params });
		const { firstName, id, login, patronymic, secondName } = user;

		return {
			id,
			firstName,
			secondName,
			patronymic,
			email: login,
			role: UserRole.SuperAdmin,
		};
	},
	patch(data: IUserPatchRequest): Promise<void> {
		if (isUseMocks) {
			return mocks.user.patch(data);
		}

		return axiosInstance.patch('/api/user', data);
	},
	put(data: IUserPostRequest): Promise<void> {
		if (isUseMocks) {
			return mocks.user.post(data);
		}

		const { firstName, email, password, patronymic, secondName } = data;

		return axiosInstance.put('/api/v1/users', {
			firstName,
			password,
			patronymic,
			secondName,
			login: email,
		});
	},
	delete(params: IUserDeleteRequest): Promise<void> {
		if (isUseMocks) {
			return mocks.user.delete(params);
		}

		return axiosInstance.delete('/api/user', { params });
	},
};
