import { loadResearchCentersData } from '../../src/components/GIS/utils/csv-loader';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('loadResearchCentersData', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should load and parse research center data correctly', async () => {
        const mockCsvData = `
"ID","name:en","name:fa","Category:en","Category:fa","Province","City","Latitude","Longitude","SizeMetric","Map","Part"
"1","Center A","مرکز الف","Research Center","مرکز تحقیقاتی","Tehran","Tehran","35.6892","51.3890","80","Iran","Tehran"
"2","Center B","مرکز ب","Hospital","بیمارستان","Isfahan","Isfahan","32.6546","51.6680","60","Iran","Isfahan"
        `.trim();

        fetchMock.mockResponseOnce(mockCsvData);

        const data = await loadResearchCentersData();

        expect(data).toHaveLength(2);
        expect(data[0].name).toBe('Center A');
        expect(data[0].coordinates).toEqual([51.3890, 35.6892]);
        expect(data[0].sizeValue).toBe(0.8);
        expect(data[1].category).toBe('Hospital');
    });

    it('should handle fetch errors gracefully', async () => {
        fetchMock.mockReject(new Error('API is down'));

        const data = await loadResearchCentersData();
        expect(data).toEqual([]);
    });

    it('should handle parsing errors gracefully by skipping invalid rows', async () => {
        const mockCsvData = `
"ID","name:en","name:fa","Category:en","Category:fa","Province","City","Latitude","Longitude","SizeMetric","Map","Part"
"1","Center A","مرکز الف","Research Center","مرکز تحقیقاتی","Tehran","Tehran","35.6892","51.3890","80","Iran","Tehran"
"2","Center B","مرکز ب","Hospital","بیمارستان","Isfahan","Isfahan","invalid","invalid","60","Iran","Isfahan"
        `.trim();

        fetchMock.mockResponseOnce(mockCsvData);

        const data = await loadResearchCentersData();
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('Center A');
    });
}); 