import { axiosInstance } from 'src/boot/axios';

export interface ISprGetRequest {
	offset: number;
	limit: number;
	viewport?: unknown;
}

export interface ISprGetResponse {
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
	get(params: ISprGetRequest): Promise<ISprGetResponse> {
		return axiosInstance.get('/api/v1/sprData', { params });
	},
};
