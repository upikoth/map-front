import { axiosInstance } from 'src/boot/axios';

export interface IIndustrialQuarterPutRequest {
	zuArea: number;
	oksArea: number;
	grade: number;
	district: string;
	oksAccidentRate: number;
	oksAverageAgeYears: number;
	name: string;
	image: Blob;
	workerCount: number;
	objects: {
		zu: number[];
		oks: number[];
	};
}

export interface IIndustrialQuarterDeleteRequest {
	id: number;
}

export interface IIndustrialQuarterDeleteResponse {
	success: number;
	data: string;
}

interface IIndustrialQuarterGeometry {
	type: string;
	features: {
		type: string;
		geometry: unknown;
		properties: unknown;
	}[];
}

export interface IIndustrialQuarterDetail {
	author: string;
	date: string;
	district: string;
	grade: number;
	hasNewZU: boolean;
	id: number;
	imageLink: string;
	isAffectedBySPR: boolean;
	isAffectedBySZZ: boolean;
	isAffectedByTOKN: boolean;
	oksAccidentRate: number;
	oksArea: number;
	oksAverageAgeYears: number;
	oksCount: number;
	orgCount: number;
	workerCount: number;
	zuArea: number;
	zuCount: number;
	objects: {
		oks: IIndustrialQuarterGeometry;
		org: IIndustrialQuarterGeometry;
		spr: IIndustrialQuarterGeometry;
		szz: IIndustrialQuarterGeometry;
		tokn: IIndustrialQuarterGeometry;
		zu: IIndustrialQuarterGeometry;
	};
}
export interface IIndustrialQuarterGetRequest {
	id: number;
}

export interface IIndustrialQuarterGetResponse {
	item: IIndustrialQuarterDetail;
}

export default {
	put(data: IIndustrialQuarterPutRequest): Promise<void> {
		const formData = new FormData();

		formData.append('zuArea', data.zuArea.toString());
		formData.append('oksArea', data.oksArea.toString());
		formData.append('grade', data.grade.toString());
		formData.append('district', data.district.toString());
		formData.append('workerCount', data.workerCount.toString());
		formData.append('objects', JSON.stringify(data.objects));
		formData.append('oksAccidentRate', data.oksAccidentRate.toString());
		formData.append('oksAverageAgeYears', data.oksAverageAgeYears.toString());
		formData.append('name', data.name.toString());
		formData.append('image', data.image);

		return axiosInstance.put('/api/v1/industrialQuarter', formData);
	},
	get(
		params: IIndustrialQuarterGetRequest
	): Promise<IIndustrialQuarterGetResponse> {
		return axiosInstance.get('/api/v1/industrialQuarter', { params });
	},
	delete(
		params: IIndustrialQuarterDeleteRequest
	): Promise<IIndustrialQuarterDeleteResponse> {
		return axiosInstance.delete('/api/v1/industrialQuarter', { params });
	},
};
