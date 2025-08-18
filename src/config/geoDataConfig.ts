// src/config/geoDataConfig.ts

// Import CSV files with Vite's URL handling
import IranProvincesSampleCsv from '../datasets/IranProvincesSample.csv?url';
import AorticDiseasesCsv from '../datasets/Disease/AorticDiseases.csv?url';
import AtrialFibrillationCsv from '../datasets/Disease/AtrialFibrillation.csv?url';
import CongenitalHeartDiseaseCsv from '../datasets/Disease/CongenitalHeartDisease.csv?url';
import DeepVeinThrombosisCsv from '../datasets/Disease/DeepVeinThrombosis.csv?url';
import CoronaryArteryDiseaseCsv from '../datasets/Disease/CoronaryArteryDisease.csv?url';
import HeartFailureCsv from '../datasets/Disease/HeartFailure.csv?url';
import HeartValveDiseaseCsv from '../datasets/Disease/HeartValveDisease.csv?url';
import PeripheralArteryDiseaseCsv from '../datasets/Disease/PeripheralArteryDisease.csv?url';
import PulmonaryEmbolismCsv from '../datasets/Disease/PulmonaryEmbolism.csv?url';

export interface ColorCondition {
  type: 'threshold' | 'range' | 'category';
  value?: number | string;
  minValue?: number;
  maxValue?: number;
  color: string;
  condition?: (value: any, data: any) => boolean; // Custom condition function
}

export interface DynamicColorConfig {
  defaultColor: string;
  conditions: ColorCondition[];
}

export interface CardConfig {
  [columnName: string]: {
    title: string;
    unit?: string;
    info?: string;
    colorCondition?: DynamicColorConfig; // Dynamic color configuration
  };
}

export interface GeoDatasetConfig {
  name: string; // Display name for Legend Title and UI Selector
  type: 'numeric' | 'categorical';
  csvPath: string; // Path to the CSV data
  geoJsonPath: string; // Path to the corresponding GeoJSON
  joinProperty: string; // The property in the GeoJSON to join with the CSV data
  csvJoinColumn: string; // The column in the CSV to use for joining with GeoJSON
  dataColumn: string; // The column in the CSV containing the primary data to visualize
  colorGradients?: [string, string, string]; // For numeric types
  colorMap?: Record<string, string>; // For categorical types
  cardConfig: CardConfig; // Configuration for the display cards
}

export const geoDataConfig: GeoDatasetConfig[] = [
  {
    name: 'جمعیت',
    type: 'numeric',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'name',
    dataColumn: 'pop',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      pop: {
        title: 'Population',
        unit: 'people',
        info: 'Total population of the province',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 1000000,
              color: '#ff6b6b', // Red for high population
              condition: (value) => value > 1000000
            },
            {
              type: 'threshold',
              value: 500000,
              color: '#4ecdc4', // Teal for medium population
              condition: (value) => value > 500000 && value <= 1000000
            }
          ]
        }
      },
      Area: {
        title: 'Area',
        unit: 'km²',
        info: 'The total area of the province'
      }
    }
  },
  {
    name: 'وضعیت سلامت',
    type: 'categorical',
    csvPath: IranProvincesSampleCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'name',
    dataColumn: 'health_status',
    colorMap: {
      good: '#4caf50',    // green
      medium: '#ffeb3b',  // yellow
      poor: '#ff9800'     // orange
    },
    cardConfig: {
      health_status: {
        title: 'Health Status',
        info: 'Overall health status of the province',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'category',
              value: 'poor',
              color: '#ff6b6b' // Red for poor health
            },
            {
              type: 'category',
              value: 'medium',
              color: '#ffd93d' // Yellow for medium health
            },
            {
              type: 'category',
              value: 'good',
              color: '#6bcf7f' // Green for good health
            }
          ]
        }
      },
      'Doctors per 10k': {
        title: 'Doctors per 10k',
        unit: 'doctors',
        info: 'Healthcare professionals per 10,000 residents',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 10,
              color: '#ff6b6b', // Red for low doctor ratio
              condition: (value) => value < 10
            },
            {
              type: 'threshold',
              value: 20,
              color: '#4ecdc4', // Teal for medium doctor ratio
              condition: (value) => value >= 10 && value < 20
            },
            {
              type: 'threshold',
              value: 20,
              color: '#6bcf7f', // Green for high doctor ratio
              condition: (value) => value >= 20
            }
          ]
        }
      },
      'Hospital Beds': {
        title: 'Hospital Beds',
        unit: 'beds',
        info: 'Total number of hospital beds',
        colorCondition: {
          defaultColor: '#ffffff',
          conditions: [
            {
              type: 'threshold',
              value: 1000,
              color: '#ff6b6b', // Red for low bed count
              condition: (value) => value < 1000
            },
            {
              type: 'threshold',
              value: 3000,
              color: '#ffd93d', // Yellow for medium bed count
              condition: (value) => value >= 1000 && value < 3000
            },
            {
              type: 'threshold',
              value: 3000,
              color: '#6bcf7f', // Green for high bed count
              condition: (value) => value >= 3000
            }
          ]
        }
      },
      Area: {
        title: 'Area',
        unit: 'km²',
        info: 'The total area of the province'
      }
    }
  },
  // --- Disease Datasets ---
  // Aortic Diseases
  {
    name: 'بروز بیماری آئورت',
    type: 'numeric',
    csvPath: AorticDiseasesCsv,
    geoJsonPath: '../../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز بیماری آئورت',
        unit: '',
        info: 'Incidence of Aortic Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع بیماری آئورت',
    type: 'numeric',
    csvPath: AorticDiseasesCsv,
    geoJsonPath: '../../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع بیماری آئورت',
        unit: '',
        info: 'Prevalence of Aortic Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر آئورت',
    type: 'numeric',
    csvPath: AorticDiseasesCsv,
    geoJsonPath: '../../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر آئورت',
        unit: '',
        info: 'Mortality from Aortic Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار بیماری آئورت',
    type: 'numeric',
    csvPath: AorticDiseasesCsv,
    geoJsonPath: '../../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار بیماری آئورت',
        unit: '',
        info: 'Global Burden of Aortic Disease (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Atrial Fibrillation
  {
    name: 'بروز فیبریلاسیون دهلیزی',
    type: 'numeric',
    csvPath: AtrialFibrillationCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز فیبریلاسیون دهلیزی',
        unit: '',
        info: 'Incidence of Atrial Fibrillation',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع فیبریلاسیون دهلیزی',
    type: 'numeric',
    csvPath: AtrialFibrillationCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع فیبریلاسیون دهلیزی',
        unit: '',
        info: 'Prevalence of Atrial Fibrillation',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر فیبریلاسیون دهلیزی',
    type: 'numeric',
    csvPath: AtrialFibrillationCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر فیبریلاسیون دهلیزی',
        unit: '',
        info: 'Mortality from Atrial Fibrillation',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار فیبریلاسیون دهلیزی',
    type: 'numeric',
    csvPath: AtrialFibrillationCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار فیبریلاسیون دهلیزی',
        unit: '',
        info: 'Global Burden of Atrial Fibrillation (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Deep Vein Thrombosis
  {
    name: 'بروز ترومبوز ورید عمقی',
    type: 'numeric',
    csvPath: DeepVeinThrombosisCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز ترومبوز ورید عمقی',
        unit: '',
        info: 'Incidence of Deep Vein Thrombosis',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع ترومبوز ورید عمقی',
    type: 'numeric',
    csvPath: DeepVeinThrombosisCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع ترومبوز ورید عمقی',
        unit: '',
        info: 'Prevalence of Deep Vein Thrombosis',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر ترومبوز ورید عمقی',
    type: 'numeric',
    csvPath: DeepVeinThrombosisCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر ترومبوز ورید عمقی',
        unit: '',
        info: 'Mortality from Deep Vein Thrombosis',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار ترومبوز ورید عمقی',
    type: 'numeric',
    csvPath: DeepVeinThrombosisCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار ترومبوز ورید عمقی',
        unit: '',
        info: 'Global Burden of Deep Vein Thrombosis (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Coronary Artery Disease
  {
    name: 'بروز بیماری عروق کرونر',
    type: 'numeric',
    csvPath: CoronaryArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز بیماری عروق کرونر',
        unit: '',
        info: 'Incidence of Coronary Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع بیماری عروق کرونر',
    type: 'numeric',
    csvPath: CoronaryArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع بیماری عروق کرونر',
        unit: '',
        info: 'Prevalence of Coronary Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر بیماری عروق کرونر',
    type: 'numeric',
    csvPath: CoronaryArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر بیماری عروق کرونر',
        unit: '',
        info: 'Mortality from Coronary Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار بیماری عروق کرونر',
    type: 'numeric',
    csvPath: CoronaryArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار بیماری عروق کرونر',
        unit: '',
        info: 'Global Burden of Coronary Artery Disease (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Heart Failure
  {
    name: 'بروز نارسایی قلبی',
    type: 'numeric',
    csvPath: HeartFailureCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز نارسایی قلبی',
        unit: '',
        info: 'Incidence of Heart Failure',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع نارسایی قلبی',
    type: 'numeric',
    csvPath: HeartFailureCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع نارسایی قلبی',
        unit: '',
        info: 'Prevalence of Heart Failure',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر نارسایی قلبی',
    type: 'numeric',
    csvPath: HeartFailureCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر نارسایی قلبی',
        unit: '',
        info: 'Mortality from Heart Failure',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار نارسایی قلبی',
    type: 'numeric',
    csvPath: HeartFailureCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار نارسایی قلبی',
        unit: '',
        info: 'Global Burden of Heart Failure (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Congenital Heart Disease
  {
    name: 'بروز بیماری مادرزادی قلب',
    type: 'numeric',
    csvPath: CongenitalHeartDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز بیماری مادرزادی قلب',
        unit: '',
        info: 'Incidence of Congenital Heart Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع بیماری مادرزادی قلب',
    type: 'numeric',
    csvPath: CongenitalHeartDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع بیماری مادرزادی قلب',
        unit: '',
        info: 'Prevalence of Congenital Heart Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر بیماری مادرزادی قلب',
    type: 'numeric',
    csvPath: CongenitalHeartDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر بیماری مادرزادی قلب',
        unit: '',
        info: 'Mortality from Congenital Heart Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار بیماری مادرزادی قلب',
    type: 'numeric',
    csvPath: CongenitalHeartDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار بیماری مادرزادی قلب',
        unit: '',
        info: 'Global Burden of Congenital Heart Disease (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Heart Valve Disease
  {
    name: 'بروز بیماری دریچه قلب',
    type: 'numeric',
    csvPath: HeartValveDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز بیماری دریچه قلب',
        unit: '',
        info: 'Incidence of Heart Valve Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع بیماری دریچه قلب',
    type: 'numeric',
    csvPath: HeartValveDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع بیماری دریچه قلب',
        unit: '',
        info: 'Prevalence of Heart Valve Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر بیماری دریچه قلب',
    type: 'numeric',
    csvPath: HeartValveDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر بیماری دریچه قلب',
        unit: '',
        info: 'Mortality from Heart Valve Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار بیماری دریچه قلب',
    type: 'numeric',
    csvPath: HeartValveDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار بیماری دریچه قلب',
        unit: '',
        info: 'Global Burden of Heart Valve Disease (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Peripheral Artery Disease
  {
    name: 'بروز بیماری شریان محیطی',
    type: 'numeric',
    csvPath: PeripheralArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز بیماری شریان محیطی',
        unit: '',
        info: 'Incidence of Peripheral Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع بیماری شریان محیطی',
    type: 'numeric',
    csvPath: PeripheralArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع بیماری شریان محیطی',
        unit: '',
        info: 'Prevalence of Peripheral Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر بیماری شریان محیطی',
    type: 'numeric',
    csvPath: PeripheralArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر بیماری شریان محیطی',
        unit: '',
        info: 'Mortality from Peripheral Artery Disease',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار بیماری شریان محیطی',
    type: 'numeric',
    csvPath: PeripheralArteryDiseaseCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار بیماری شریان محیطی',
        unit: '',
        info: 'Global Burden of Peripheral Artery Disease (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  // Pulmonary Embolism
  {
    name: 'بروز آمبولی ریوی',
    type: 'numeric',
    csvPath: PulmonaryEmbolismCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Incidence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Incidence Metric': {
        title: 'بروز آمبولی ریوی',
        unit: '',
        info: 'Incidence of Pulmonary Embolism',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'شیوع آمبولی ریوی',
    type: 'numeric',
    csvPath: PulmonaryEmbolismCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Primary Prevalence Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Primary Prevalence Metric': {
        title: 'شیوع آمبولی ریوی',
        unit: '',
        info: 'Prevalence of Pulmonary Embolism',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'مرگ و میر آمبولی ریوی',
    type: 'numeric',
    csvPath: PulmonaryEmbolismCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Key Mortality Metric',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Key Mortality Metric': {
        title: 'مرگ و میر آمبولی ریوی',
        unit: '',
        info: 'Mortality from Pulmonary Embolism',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  },
  {
    name: 'بار آمبولی ریوی',
    type: 'numeric',
    csvPath: PulmonaryEmbolismCsv,
    geoJsonPath: '../../datasets/geojson/Iran.json',
    joinProperty: 'tags.name:en',
    csvJoinColumn: 'Province',
    dataColumn: 'Global Burden (2019)',
    colorGradients: ['#FFEDA0', '#FEB24C', '#F03B20'],
    cardConfig: {
      'Global Burden (2019)': {
        title: 'بار آمبولی ریوی',
        unit: '',
        info: 'Global Burden of Pulmonary Embolism (2019)',
        colorCondition: { defaultColor: '#ffffff', conditions: [] }
      }
    }
  }
];

// Helper function to get dataset config by name
export const getDatasetConfig = (name: string): GeoDatasetConfig | undefined => {
  return geoDataConfig.find(config => config.name === name);
};

// Helper function to get all dataset names for UI selector
export const getDatasetNames = (): string[] => {
  return geoDataConfig.map(config => config.name);
};

// Helper function to get color map for categorical data
export const getCategoricalColorMap = (): Record<string, string> => {
  return {
    good: '#4caf50', // green
    medium: '#ffeb3b', // yellow
    poor: '#ff9800', // orange
  };
};

// Helper function to get category labels for categorical data
export const getCategoricalLabels = (): Record<string, string> => {
  return {
    good: 'Good',
    medium: 'Medium', 
    poor: 'Poor'
  };
}; 