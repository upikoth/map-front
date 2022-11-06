import { axiosInstance } from 'src/boot/axios';

export interface IOksGetRequest {
	offset: number;
	limit: number;
	viewport?: unknown;
}

export interface IOksGetResponse {
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
	get(params: IOksGetRequest): Promise<IOksGetResponse> {
		return axiosInstance.get('/api/v1/oksData', { params });
	},
};
