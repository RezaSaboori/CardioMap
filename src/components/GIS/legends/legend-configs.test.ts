import { getDynamicFlowLegendConfig, getDynamicResearchCentersLegendConfig } from './legend-configs';

describe('Legend Configuration Tests', () => {
  describe('getDynamicFlowLegendConfig', () => {
    it('should return undefined for empty flows array', () => {
      const result = getDynamicFlowLegendConfig([], {}, {});
      expect(result).toBeUndefined();
    });

    it('should return undefined for null flows', () => {
      const result = getDynamicFlowLegendConfig(null as any, {}, {});
      expect(result).toBeUndefined();
    });

    it('should create legend with only categories present in the data', () => {
      const flows = [
        { id: '1', category: 'type1', origin: [0, 0], destination: [1, 1], sizeValue: 10 },
        { id: '2', category: 'type2', origin: [0, 0], destination: [1, 1], sizeValue: 20 },
        { id: '3', category: 'type1', origin: [0, 0], destination: [1, 1], sizeValue: 15 }
      ];

      const colorMap = {
        type1: '#ff0000',
        type2: '#00ff00',
        type3: '#0000ff' // This should not appear in the legend
      };

      const categoryLabels = {
        type1: 'Type 1',
        type2: 'Type 2',
        type3: 'Type 3'
      };

      const result = getDynamicFlowLegendConfig(flows, colorMap, categoryLabels);

      expect(result).toEqual({
        title: 'Flow Data',
        legendProps: {
          colorMap: {
            type1: '#ff0000',
            type2: '#00ff00'
          },
          categoryLabels: {
            type1: 'Type 1',
            type2: 'Type 2'
          },
          showLegend: true
        }
      });
    });

    it('should return undefined when no categories match the color map', () => {
      const flows = [
        { id: '1', category: 'unknown', origin: [0, 0], destination: [1, 1], sizeValue: 10 }
      ];

      const colorMap = {
        type1: '#ff0000',
        type2: '#00ff00'
      };

      const result = getDynamicFlowLegendConfig(flows, colorMap, {});
      expect(result).toBeUndefined();
    });
  });

  describe('getDynamicResearchCentersLegendConfig', () => {
    it('should return undefined for empty points array', () => {
      const result = getDynamicResearchCentersLegendConfig([], {}, {});
      expect(result).toBeUndefined();
    });

    it('should return undefined for null points', () => {
      const result = getDynamicResearchCentersLegendConfig(null as any, {}, {});
      expect(result).toBeUndefined();
    });

    it('should create legend with only categories present in the research centers data', () => {
      const points = [
        { id: '1', name: 'Center 1', category: 'Hospital', coordinates: [0, 0], sizeValue: 10 },
        { id: '2', name: 'Center 2', category: 'Research Center', coordinates: [1, 1], sizeValue: 20 },
        { id: '3', name: 'Center 3', category: 'Hospital', coordinates: [2, 2], sizeValue: 15 }
      ];

      const colorMap = {
        Hospital: '#ff0000',
        'Research Center': '#00ff00',
        'Research Facility': '#0000ff' // This should not appear in the legend
      };

      const categoryLabels = {
        Hospital: 'Hospital',
        'Research Center': 'Research Center',
        'Research Facility': 'Research Facility'
      };

      const result = getDynamicResearchCentersLegendConfig(points, colorMap, categoryLabels);

      expect(result).toEqual({
        title: 'Research Centers',
        legendProps: {
          colorMap: {
            Hospital: '#ff0000',
            'Research Center': '#00ff00'
          },
          categoryLabels: {
            Hospital: 'Hospital',
            'Research Center': 'Research Center'
          },
          showLegend: true
        }
      });
    });

    it('should return undefined when no categories match the color map', () => {
      const points = [
        { id: '1', name: 'Center 1', category: 'Unknown', coordinates: [0, 0], sizeValue: 10 }
      ];

      const colorMap = {
        Hospital: '#ff0000',
        'Research Center': '#00ff00'
      };

      const result = getDynamicResearchCentersLegendConfig(points, colorMap, {});
      expect(result).toBeUndefined();
    });
  });
}); 