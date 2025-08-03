import { geoDataConfig, getDatasetConfig, getDatasetNames } from './geoDataConfig';

describe('GeoDataConfig', () => {
  test('should have at least two datasets configured', () => {
    expect(geoDataConfig.length).toBeGreaterThanOrEqual(2);
  });

  test('should have Iran Province Population dataset', () => {
    const populationConfig = getDatasetConfig('Iran Province Population');
    expect(populationConfig).toBeDefined();
    expect(populationConfig?.type).toBe('numeric');
    expect(populationConfig?.dataColumn).toBe('pop');
  });

  test('should have Health Status dataset', () => {
    const healthConfig = getDatasetConfig('Health Status');
    expect(healthConfig).toBeDefined();
    expect(healthConfig?.type).toBe('categorical');
    expect(healthConfig?.dataColumn).toBe('health_status');
  });

  test('should return dataset names', () => {
    const names = getDatasetNames();
    expect(names).toContain('Iran Province Population');
    expect(names).toContain('Health Status');
  });

  test('should return undefined for non-existent dataset', () => {
    const config = getDatasetConfig('Non-existent Dataset');
    expect(config).toBeUndefined();
  });

  test('all datasets should have required properties', () => {
    geoDataConfig.forEach(config => {
      expect(config.name).toBeDefined();
      expect(config.type).toBeDefined();
      expect(config.csvPath).toBeDefined();
      expect(config.geoJsonPath).toBeDefined();
      expect(config.joinProperty).toBeDefined();
      expect(config.dataColumn).toBeDefined();
      expect(config.cardConfig).toBeDefined();
    });
  });

  test('numeric datasets should have colorGradients', () => {
    geoDataConfig
      .filter(config => config.type === 'numeric')
      .forEach(config => {
        expect(config.colorGradients).toBeDefined();
        expect(config.colorGradients?.length).toBe(3);
      });
  });
}); 