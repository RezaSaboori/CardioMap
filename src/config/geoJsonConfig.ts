// src/config/geoJsonConfig.ts

// Import CSV files with Vite's URL handling
import IranProvincesSampleCsv from '../datasets/IranProvincesSample.csv?url';
import TehranCountiesSampleCsv from '../datasets/TehranCountiesSample.csv?url';

export interface GeoJsonMapConfig {
  geojson: string;           // GeoJSON file location
  csv?: string;              // Optional CSV data file
  hoverTag: string;          // Tag for hover display (e.g., 'name:fa', 'name:en')
}

export const geoJsonConfig: Record<string, GeoJsonMapConfig> = {
  Iran: { 
    geojson: '../../datasets/geojson/Iran.json', 
    csv: IranProvincesSampleCsv,
    hoverTag: 'name:fa'
  },
  Tehran: { 
    geojson: '../../datasets/geojson/Tehran.json', 
    csv: TehranCountiesSampleCsv,
    hoverTag: 'name:fa'
  },
  // Add all provinces with their configurations
  Alborz: { 
    geojson: '../../datasets/geojson/Alborz.json',
    hoverTag: 'name:fa'
  },
  Ardabil: { 
    geojson: '../../datasets/geojson/Ardabil.json',
    hoverTag: 'name:fa'
  },
  Bushehr: { 
    geojson: '../../datasets/geojson/Bushehr.json',
    hoverTag: 'name:fa'
  },
  ChaharmahalandBakhtiyari: { 
    geojson: '../../datasets/geojson/ChaharmahalandBakhtiyari.json',
    hoverTag: 'name:fa'
  },
  EastAzerbaijan: { 
    geojson: '../../datasets/geojson/EastAzerbaijan.json',
    hoverTag: 'name:fa'
  },
  Fars: { 
    geojson: '../../datasets/geojson/Fars.json',
    hoverTag: 'name:fa'
  },
  Gilan: { 
    geojson: '../../datasets/geojson/Gilan.json',
    hoverTag: 'name:fa'
  },
  Golestan: { 
    geojson: '../../datasets/geojson/Golestan.json',
    hoverTag: 'name:fa'
  },
  Hamadan: { 
    geojson: '../../datasets/geojson/Hamadan.json',
    hoverTag: 'name:fa'
  },
  Hormozgan: { 
    geojson: '../../datasets/geojson/Hormozgan.json',
    hoverTag: 'name:fa'
  },
  Ilam: { 
    geojson: '../../datasets/geojson/Ilam.json',
    hoverTag: 'name:fa'
  },
  Isfahan: { 
    geojson: '../../datasets/geojson/Isfahan.json',
    hoverTag: 'name:fa'
  },
  Kerman: { 
    geojson: '../../datasets/geojson/Kerman.json',
    hoverTag: 'name:fa'
  },
  Kermanshah: { 
    geojson: '../../datasets/geojson/Kermanshah.json',
    hoverTag: 'name:fa'
  },
  Khuzestan: { 
    geojson: '../../datasets/geojson/Khuzestan.json',
    hoverTag: 'name:fa'
  },
  KohgiluyeandBuyerAhmad: { 
    geojson: '../../datasets/geojson/KohgiluyeandBuyerAhmad.json',
    hoverTag: 'name:fa'
  },
  Kurdistan: { 
    geojson: '../../datasets/geojson/Kurdistan.json',
    hoverTag: 'name:fa'
  },
  Lorestan: { 
    geojson: '../../datasets/geojson/Lorestan.json',
    hoverTag: 'name:fa'
  },
  Markazi: { 
    geojson: '../../datasets/geojson/Markazi.json',
    hoverTag: 'name:fa'
  },
  Mazandaran: { 
    geojson: '../../datasets/geojson/Mazandaran.json',
    hoverTag: 'name:fa'
  },
  NorthKhorasan: { 
    geojson: '../../datasets/geojson/NorthKhorasan.json',
    hoverTag: 'name:fa'
  },
  Qazvin: { 
    geojson: '../../datasets/geojson/Qazvin.json',
    hoverTag: 'name:fa'
  },
  Qom: { 
    geojson: '../../datasets/geojson/Qom.json',
    hoverTag: 'name:fa'
  },
  RazaviKhorasan: { 
    geojson: '../../datasets/geojson/RazaviKhorasan.json',
    hoverTag: 'name:fa'
  },
  Semnan: { 
    geojson: '../../datasets/geojson/Semnan.json',
    hoverTag: 'name:fa'
  },
  SistanandBaluchestan: { 
    geojson: '../../datasets/geojson/SistanandBaluchestan.json',
    hoverTag: 'name:fa'
  },
  SouthKhorasan: { 
    geojson: '../../datasets/geojson/SouthKhorasan.json',
    hoverTag: 'name:fa'
  },
  WestAzerbaijan: { 
    geojson: '../../datasets/geojson/WestAzerbaijan.json',
    hoverTag: 'name:fa'
  },
  Yazd: { 
    geojson: '../../datasets/geojson/Yazd.json',
    hoverTag: 'name:fa'
  },
  Zanjan: { 
    geojson: '../../datasets/geojson/Zanjan.json',
    hoverTag: 'name:fa'
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