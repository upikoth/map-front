/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	IUserGetResponse,
	UserRole,
	IUserPatchRequest,
	IUserPostRequest,
	IUserDeleteRequest,
} from 'src/api';

export default {
	get(): Promise<IUserGetResponse> {
		return new Promise((res) => {
			res({
				id: '1',
				email: 'upikoth@gmail.com',
				role: UserRole.SuperAdmin,
				firstName: 'Иван',
				secondName: 'Дёмин',
				patronymic: 'Николаевич',
			});
		});
	},
	patch(data: IUserPatchRequest): Promise<void> {
		return new Promise((res) => {
			res();
		});
	},
	post(data: IUserPostRequest): Promise<void> {
		return new Promise((res) => {
			res();
		});
	},
	delete(data: IUserDeleteRequest): Promise<void> {
		return new Promise((res) => {
			res();
		});
	},
};
