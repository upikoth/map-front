import { axiosInstance } from 'src/boot/axios';

export interface IPresentationGetRequest {
	id: number;
}

export interface IPresentationGetResponse {
	blob: Blob;
}

export default {
	get(params: IPresentationGetRequest): Promise<IPresentationGetResponse> {
		return axiosInstance.get('/api/v1/presentation', {
			params,
			responseType: 'blob',
		});
	},
};
