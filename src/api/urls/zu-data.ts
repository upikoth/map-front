import { axiosInstance } from 'src/boot/axios';

export interface IZuGetRequest {
	offset: number;
	limit: number;
	viewport: unknown;
}

export interface IZuGetResponse {
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
	get(params: IZuGetRequest): Promise<IZuGetResponse> {
		return axiosInstance.get('/api/v1/zuData', { params });
	},
};
