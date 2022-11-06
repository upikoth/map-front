import { axiosInstance } from 'src/boot/axios';

export interface IOrgGetRequest {
	offset: number;
	limit: number;
	viewport?: unknown;
}

export interface IOrgGetResponse {
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
	get(params: IOrgGetRequest): Promise<IOrgGetResponse> {
		return axiosInstance.get('/api/v1/orgData', { params });
	},
};
