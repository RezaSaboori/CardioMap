// src/config/geoJsonConfig.ts

// Import CSV files with Vite's URL handling
import IranProvincesSampleCsv from '../datasets/IranProvincesSample.csv?url';
import TehranCountiesSampleCsv from '../datasets/TehranCountiesSample.csv?url';

export interface GeoJsonMapConfig {
  geojson: string;           // GeoJSON file location
  csv?: string;              // Optional CSV data file
  hoverTag: string;          // Tag for hover display (e.g., 'name:fa', 'name:en')
  displayName: string;       // Display name for controller
}

export const geoJsonConfig: Record<string, GeoJsonMapConfig> = {
  Iran: { 
    geojson: '../../datasets/geojson/Iran.json', 
    csv: IranProvincesSampleCsv,
    hoverTag: 'name:fa',
    displayName: 'ایران'
  },
  Tehran: { 
    geojson: '../../datasets/geojson/Tehran.json', 
    csv: TehranCountiesSampleCsv,
    hoverTag: 'name:fa',
    displayName: 'تهران'
  },
  // Add all provinces with their configurations
  Alborz: { 
    geojson: '../../datasets/geojson/Alborz.json',
    hoverTag: 'name:fa',
    displayName: 'البرز'
  },
  Ardabil: { 
    geojson: '../../datasets/geojson/Ardabil.json',
    hoverTag: 'name:fa',
    displayName: 'اردبیل'
  },
  Bushehr: { 
    geojson: '../../datasets/geojson/Bushehr.json',
    hoverTag: 'name:fa',
    displayName: 'بوشهر'
  },
  ChaharmahalandBakhtiyari: { 
    geojson: '../../datasets/geojson/ChaharmahalandBakhtiyari.json',
    hoverTag: 'name:fa',
    displayName: 'چهارمحال و بختیاری'
  },
  EastAzerbaijan: { 
    geojson: '../../datasets/geojson/EastAzerbaijan.json',
    hoverTag: 'name:fa',
    displayName: 'آذربایجان شرقی'
  },
  Fars: { 
    geojson: '../../datasets/geojson/Fars.json',
    hoverTag: 'name:fa',
    displayName: 'فارس'
  },
  Gilan: { 
    geojson: '../../datasets/geojson/Gilan.json',
    hoverTag: 'name:fa',
    displayName: 'گیلان'
  },
  Golestan: { 
    geojson: '../../datasets/geojson/Golestan.json',
    hoverTag: 'name:fa',
    displayName: 'گلستان'
  },
  Hamadan: { 
    geojson: '../../datasets/geojson/Hamadan.json',
    hoverTag: 'name:fa',
    displayName: 'همدان'
  },
  Hormozgan: { 
    geojson: '../../datasets/geojson/Hormozgan.json',
    hoverTag: 'name:fa',
    displayName: 'هرمزگان'
  },
  Ilam: { 
    geojson: '../../datasets/geojson/Ilam.json',
    hoverTag: 'name:fa',
    displayName: 'ایلام'
  },
  Isfahan: { 
    geojson: '../../datasets/geojson/Isfahan.json',
    hoverTag: 'name:fa',
    displayName: 'اصفهان'
  },
  Kerman: { 
    geojson: '../../datasets/geojson/Kerman.json',
    hoverTag: 'name:fa',
    displayName: 'کرمان'
  },
  Kermanshah: { 
    geojson: '../../datasets/geojson/Kermanshah.json',
    hoverTag: 'name:fa',
    displayName: 'کرمانشاه'
  },
  Khuzestan: { 
    geojson: '../../datasets/geojson/Khuzestan.json',
    hoverTag: 'name:fa',
    displayName: 'خوزستان'
  },
  KohgiluyeandBuyerAhmad: { 
    geojson: '../../datasets/geojson/KohgiluyeandBuyerAhmad.json',
    hoverTag: 'name:fa',
    displayName: 'کهگیلویه و بویراحمد'
  },
  Kurdistan: { 
    geojson: '../../datasets/geojson/Kurdistan.json',
    hoverTag: 'name:fa',
    displayName: 'کردستان'
  },
  Lorestan: { 
    geojson: '../../datasets/geojson/Lorestan.json',
    hoverTag: 'name:fa',
    displayName: 'لرستان'
  },
  Markazi: { 
    geojson: '../../datasets/geojson/Markazi.json',
    hoverTag: 'name:fa',
    displayName: 'مرکزی'
  },
  Mazandaran: { 
    geojson: '../../datasets/geojson/Mazandaran.json',
    hoverTag: 'name:fa',
    displayName: 'مازندران'
  },
  NorthKhorasan: { 
    geojson: '../../datasets/geojson/NorthKhorasan.json',
    hoverTag: 'name:fa',
    displayName: 'خراسان شمالی'
  },
  Qazvin: { 
    geojson: '../../datasets/geojson/Qazvin.json',
    hoverTag: 'name:fa',
    displayName: 'قزوین'
  },
  Qom: { 
    geojson: '../../datasets/geojson/Qom.json',
    hoverTag: 'name:fa',
    displayName: 'قم'
  },
  RazaviKhorasan: { 
    geojson: '../../datasets/geojson/RazaviKhorasan.json',
    hoverTag: 'name:fa',
    displayName: 'خراسان رضوی'
  },
  Semnan: { 
    geojson: '../../datasets/geojson/Semnan.json',
    hoverTag: 'name:fa',
    displayName: 'سمنان'
  },
  SistanandBaluchestan: { 
    geojson: '../../datasets/geojson/SistanandBaluchestan.json',
    hoverTag: 'name:fa',
    displayName: 'سیستان و بلوچستان'
  },
  SouthKhorasan: { 
    geojson: '../../datasets/geojson/SouthKhorasan.json',
    hoverTag: 'name:fa',
    displayName: 'خراسان جنوبی'
  },
  WestAzerbaijan: { 
    geojson: '../../datasets/geojson/WestAzerbaijan.json',
    hoverTag: 'name:fa',
    displayName: 'آذربایجان غربی'
  },
  Yazd: { 
    geojson: '../../datasets/geojson/Yazd.json',
    hoverTag: 'name:fa',
    displayName: 'یزد'
  },
  Zanjan: { 
    geojson: '../../datasets/geojson/Zanjan.json',
    hoverTag: 'name:fa',
    displayName: 'زنجان'
  }
};

// Helper function to get map config by ID
export const getMapConfig = (mapId: string): GeoJsonMapConfig | undefined => {
  return geoJsonConfig[mapId];
};

// Helper function to get all map IDs
export const getMapIds = (): string[] => {
  return Object.keys(geoJsonConfig);
};

// Helper function to get display name for a map
export const getMapDisplayName = (mapId: string): string => {
  const config = geoJsonConfig[mapId];
  return config ? config.displayName : mapId;
};

// Helper function to get hover tag for a map
export const getMapHoverTag = (mapId: string): string => {
  const config = geoJsonConfig[mapId];
  return config ? config.hoverTag : 'name:en';
};

// Helper function to get GeoJSON path for a map
export const getMapGeoJsonPath = (mapId: string): string | undefined => {
  const config = geoJsonConfig[mapId];
  return config ? config.geojson : undefined;
};

// Helper function to get CSV path for a map
export const getMapCsvPath = (mapId: string): string | undefined => {
  const config = geoJsonConfig[mapId];
  return config ? config.csv : undefined;
};

// Helper function to check if a map has CSV data
export const hasMapCsvData = (mapId: string): boolean => {
  const config = geoJsonConfig[mapId];
  return config ? !!config.csv : false;
}; 