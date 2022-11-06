import { axiosInstance } from 'src/boot/axios';
import mocks from './mocks';
import { isUseMocks } from 'src/api';

export interface IUserSessionPostRequest {
	login: string;
	password: string;
}

export default {
	put(data: IUserSessionPostRequest): Promise<void> {
		if (isUseMocks) {
			return mocks.userSession.post(data);
		}

		return axiosInstance.put('/api/v1/session', data);
	},
	get(): Promise<void> {
		if (isUseMocks) {
			return mocks.userSession.get();
		}

		return axiosInstance.get('/api/v1/session');
	},
	delete(): Promise<void> {
		if (isUseMocks) {
			return mocks.userSession.delete();
		}

		return axiosInstance.delete('/api/v1/session');
	},
};
