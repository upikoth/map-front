import { axiosInstance } from 'src/boot/axios';

export interface IToknGetRequest {
	offset: number;
	limit: number;
	viewport?: unknown;
}

export interface IToknGetResponse {
	limit: number;
	offset: number;
	total: number;
	collection: {
		type: string;
		features: {
			type: string;
			geometry: unknown;
			properties: unknown;
		}[];
	};
}

export default {
	get(params: IToknGetRequest): Promise<IToknGetResponse> {
		return axiosInstance.get('/api/v1/toknData', { params });
	},
};
