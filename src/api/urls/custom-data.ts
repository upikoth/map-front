import { axiosInstance } from 'src/boot/axios';

export interface ICustomDataGetRequest {
	name: string;
}

export interface ICustomDataGetResponse {
	item: {
		name: string;
		value: string;
	};
}

export default {
	get(params: ICustomDataGetRequest): Promise<ICustomDataGetResponse> {
		return axiosInstance.get('/api/v1/customData', { params });
	},
};
