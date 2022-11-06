import { axiosInstance } from 'src/boot/axios';

export interface IUserRegistrationPostRequest {
	email: string;
	password: string;
}

export default {
	post(data: IUserRegistrationPostRequest): Promise<void> {
		return axiosInstance.post('/api/user-registration', data);
	},
};
