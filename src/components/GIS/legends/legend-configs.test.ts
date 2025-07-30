import { getDynamicFlowLegendConfig, getDynamicResearchCentersLegendConfig } from './legend-configs';

describe('Legend Configuration Tests', () => {
  describe('getDynamicFlowLegendConfig', () => {
    it('should return null for empty flows array', () => {
      const result = getDynamicFlowLegendConfig([], {}, {});
      expect(result).toBeNull();
    });

    it('should return null for null flows', () => {
      const result = getDynamicFlowLegendConfig(null as any, {}, {});
      expect(result).toBeNull();
    });

    it('should create legend with only categories present in the data', () => {
      const flows = [
        { id: '1', category: 'type1', name: 'Flow 1' },
        { id: '2', category: 'type2', name: 'Flow 2' },
        { id: '3', category: 'type1', name: 'Flow 3' }
      ];

      const colorMap = {
        type1: '#ff0000',
        type2: '#00ff00',
        type3: '#0000ff' // This should not appear in legend
      };

      const categoryLabels = {
        type1: 'Type 1',
        type2: 'Type 2',
        type3: 'Type 3'
      };

      const result = getDynamicFlowLegendConfig(flows, colorMap, categoryLabels, 'Test Dataset');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Dataset');
      expect(result?.legendProps.colorMap).toEqual({
        type1: '#ff0000',
        type2: '#00ff00'
      });
      expect(result?.legendProps.categoryLabels).toEqual({
        type1: 'Type 1',
        type2: 'Type 2'
      });
    });

    it('should use category name as fallback when category label is not provided', () => {
      const flows = [
        { id: '1', category: 'type1', name: 'Flow 1' },
        { id: '2', category: 'type2', name: 'Flow 2' }
      ];

      const colorMap = {
        type1: '#ff0000',
        type2: '#00ff00'
      };

      const result = getDynamicFlowLegendConfig(flows, colorMap, {}, 'Test Dataset');

      expect(result?.legendProps.categoryLabels).toEqual({
        type1: 'type1',
        type2: 'type2'
      });
    });

    it('should return null when no categories match the color map', () => {
      const flows = [
        { id: '1', category: 'unknown', name: 'Flow 1' }
      ];

      const colorMap = {
        type1: '#ff0000',
        type2: '#00ff00'
      };

      const result = getDynamicFlowLegendConfig(flows, colorMap, {});
      expect(result).toBeNull();
    });
  });

  describe('getDynamicResearchCentersLegendConfig', () => {
    it('should return null for empty points array', () => {
      const result = getDynamicResearchCentersLegendConfig([], {}, {});
      expect(result).toBeNull();
    });

    it('should return null for null points', () => {
      const result = getDynamicResearchCentersLegendConfig(null as any, {}, {});
      expect(result).toBeNull();
    });

    it('should create legend with only categories present in the research centers data', () => {
      const points = [
        { id: '1', category: 'Hospital', name: 'Hospital A' },
        { id: '2', category: 'Research Center', name: 'Research Center B' },
        { id: '3', category: 'Hospital', name: 'Hospital C' }
      ];

      const colorMap = {
        'Hospital': '#ff0000',
        'Research Center': '#00ff00',
        'Research Facility': '#0000ff' // This should not appear in legend
      };

      const categoryLabels = {
        'Hospital': 'Hospitals',
        'Research Center': 'Research Centers',
        'Research Facility': 'Research Facilities'
      };

      const result = getDynamicResearchCentersLegendConfig(points, colorMap, categoryLabels);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Research Centers');
      expect(result?.legendProps.colorMap).toEqual({
        'Hospital': '#ff0000',
        'Research Center': '#00ff00'
      });
      expect(result?.legendProps.categoryLabels).toEqual({
        'Hospital': 'Hospitals',
        'Research Center': 'Research Centers'
      });
    });

    it('should use category name as fallback when category label is not provided', () => {
      const points = [
        { id: '1', category: 'Hospital', name: 'Hospital A' },
        { id: '2', category: 'Research Center', name: 'Research Center B' }
      ];

      const colorMap = {
        'Hospital': '#ff0000',
        'Research Center': '#00ff00'
      };

      const result = getDynamicResearchCentersLegendConfig(points, colorMap, {});

      expect(result?.legendProps.categoryLabels).toEqual({
        'Hospital': 'Hospital',
        'Research Center': 'Research Center'
      });
    });

    it('should return null when no categories match the color map', () => {
      const points = [
        { id: '1', category: 'Unknown', name: 'Unknown Facility' }
      ];

      const colorMap = {
        'Hospital': '#ff0000',
        'Research Center': '#00ff00'
      };

      const result = getDynamicResearchCentersLegendConfig(points, colorMap, {});
      expect(result).toBeNull();
    });
  });
}); 