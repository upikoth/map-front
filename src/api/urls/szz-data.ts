import { axiosInstance } from 'src/boot/axios';

export interface ISzzGetRequest {
	offset: number;
	limit: number;
	viewport?: unknown;
}

export interface ISzzGetResponse {
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
	get(params: ISzzGetRequest): Promise<ISzzGetResponse> {
		return axiosInstance.get('/api/v1/szzData', { params });
	},
};
