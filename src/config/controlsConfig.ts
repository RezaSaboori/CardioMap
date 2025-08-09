// Central configuration for GIS controls
// Keep this file simple: define controls and items directly.

import { getFlowDataConfigNames } from './flowDataConfig';
import { getPointDataConfigNames } from './pointDataConfig';
import { getDatasetNames } from './geoDataConfig';
import { getMapIds } from './geoJsonConfig';

export type ControlType = 'data' | 'map';

// Leaf item consumed by current UI
export interface ControlItem {
  label: string; // Display label shown in UI
  value: string; // Underlying value used by the app (e.g., 'nothing', 'flowdata:...', 'pointdata:...', dataset name, or map ID)
}

// Hierarchical item for nested menus
export interface ControlNode {
  label: string;
  value?: string; // Present only on leaves
  children?: ControlNode[]; // Optional submenu children
}

export interface SingleControlConfig {
  type: ControlType;
  items: ControlNode[];
}

// Simple, explicit controls configuration map keyed by control ID (e.g., '0.1', '0.2')

export const controlsConfig: Record<string, SingleControlConfig> = {
  // 01: Combined Data Selector (Nothing / Flow / Dataset / Point)
  '01': {
    type: 'data',
    // Always include mapping for 'nothing'
    items: [
      { label: 'هیچ', value: 'nothing' },
      { label: 'مسیر بیماران', value: 'مسیر بیماران' }, // flowdata
              // dataset
      {
        label: 'وضعیت استانی',
        children: [
          { label: 'جمعیت استانی', value: 'جمعیت' },
          { label: 'وضعیت سلامتی', value: 'وضعیت سلامت' },
        ],
      },
      { label: 'مراکز پژوهشی', value: 'مراکز پژوهشی' },  // pointdata
    ],
  },

  // 02: Map Selector (list of map IDs)
  '02': {
    type: 'map',
    // Define labels here so we don't rely on displayName in geoJsonConfig
    // You can extend this list; validator will log missing map IDs
    items: [
      { label: 'کل کشور', value: 'Iran' },
      
      
      
      {
        label: 'استان‌ها',
        children: [
          { label: 'تهران', value: 'Tehran' },
          { label: 'البرز', value: 'Alborz' },
          { label: 'اردبیل', value: 'Ardabil' },
          { label: 'بوشهر', value: 'Bushehr' },
          { label: 'چهارمحال و بختیاری', value: 'ChaharmahalandBakhtiyari' },
          { label: 'آذربایجان شرقی', value: 'EastAzerbaijan' },
          { label: 'فارس', value: 'Fars' },
          { label: 'گیلان', value: 'Gilan' },
          { label: 'گلستان', value: 'Golestan' },
          { label: 'همدان', value: 'Hamadan' },
          { label: 'هرمزگان', value: 'Hormozgan' },
          { label: 'ایلام', value: 'Ilam' },
          { label: 'اصفهان', value: 'Isfahan' },
          { label: 'کرمان', value: 'Kerman' },
          { label: 'کرمانشاه', value: 'Kermanshah' },
          { label: 'خوزستان', value: 'Khuzestan' },
          { label: 'کهگیلویه و بویراحمد', value: 'KohgiluyeandBuyerAhmad' },
          { label: 'کردستان', value: 'Kurdistan' },
          { label: 'لرستان', value: 'Lorestan' },
          { label: 'مرکزی', value: 'Markazi' },
          { label: 'مازندران', value: 'Mazandaran' },
          { label: 'خراسان شمالی', value: 'NorthKhorasan' },
          { label: 'قزوین', value: 'Qazvin' },
          { label: 'قم', value: 'Qom' },
          { label: 'خراسان رضوی', value: 'RazaviKhorasan' },
          { label: 'سمنان', value: 'Semnan' },
          { label: 'سیستان و بلوچستان', value: 'SistanandBaluchestan' },
          { label: 'خراسان جنوبی', value: 'SouthKhorasan' },
          { label: 'آذربایجان غربی', value: 'WestAzerbaijan' },
          { label: 'یزد', value: 'Yazd' },
          { label: 'زنجان', value: 'Zanjan' },
        ],
      },
    ],
  },
};

// Flatten hierarchical nodes to leaves consumed by current UI
const flattenNodes = (nodes: ControlNode[]): ControlItem[] => {
  const out: ControlItem[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      out.push(...flattenNodes(node.children));
    }
    if (node.value) {
      out.push({ label: node.label, value: node.value });
    }
  }
  return out;
};

export const getControlItems = (controlId: string): ControlItem[] => {
  const cfg = controlsConfig[controlId];
  if (!cfg) return [];
  return flattenNodes(cfg.items);
};

export const getNestedControlItems = (controlId: string): ControlNode[] => {
  return controlsConfig[controlId]?.items ?? [];
};

export const getLabelForControlValue = (controlId: string, value: string): string | undefined => {
  const items = getControlItems(controlId);
  return items.find((i) => i.value === value)?.label;
};

export const getValueForControlLabel = (controlId: string, label: string): string | undefined => {
  const items = getControlItems(controlId);
  return items.find((i) => i.label === label)?.value;
};

// Resolve a user-defined data item value to the internal value space
// If user provided plain names without prefixes, we infer based on known config names
export const resolveDataControlValue = (value: string): string => {
  if (value === 'nothing' || value.startsWith('flowdata:') || value.startsWith('pointdata:')) {
    return value;
  }
  const flowNames = new Set(getFlowDataConfigNames());
  const pointNames = new Set(getPointDataConfigNames());
  const datasetNames = new Set(getDatasetNames());

  if (flowNames.has(value)) return `flowdata:${value}`;
  if (pointNames.has(value)) return `pointdata:${value}`;
  if (datasetNames.has(value)) return value;
  // Unknown: return as-is so validator warns; UI will still show it
  return value;
};

// Validate that configured items match available items from other configs, and vice versa.
// Logs mismatches to console.
export const validateControlsConfig = (): void => {
  try {
    // Build allowed sets for 'data' controls
    const flowNames = new Set(getFlowDataConfigNames());
    const pointNames = new Set(getPointDataConfigNames());
    const datasetNames = new Set(getDatasetNames());

    const allowedDataValues = new Set<string>();
    allowedDataValues.add('nothing');
    flowNames.forEach((n) => allowedDataValues.add(`flowdata:${n}`));
    pointNames.forEach((n) => allowedDataValues.add(`pointdata:${n}`));
    datasetNames.forEach((n) => allowedDataValues.add(n));

    const allConfiguredDataValues = new Set<string>();
    const allConfiguredMapValues = new Set<string>();

    const collectDataValues = (nodes: ControlNode[]) => {
      for (const n of nodes) {
        if (n.children) collectDataValues(n.children);
        if (n.value) allConfiguredDataValues.add(resolveDataControlValue(n.value));
      }
    };
    const collectMapValues = (nodes: ControlNode[]) => {
      for (const n of nodes) {
        if (n.children) collectMapValues(n.children);
        if (n.value) allConfiguredMapValues.add(n.value);
      }
    };

    Object.entries(controlsConfig).forEach(([id, cfg]) => {
      if (cfg.type === 'data') collectDataValues(cfg.items);
      if (cfg.type === 'map') collectMapValues(cfg.items);
    });

    // Unknown values in data controls
    const unknownDataValues: string[] = [];
    allConfiguredDataValues.forEach((val) => {
      if (!allowedDataValues.has(val)) unknownDataValues.push(val);
    });

    // Missing values not covered by data controls (exclude 'nothing')
    const missingDataValues: string[] = [];
    allowedDataValues.forEach((val) => {
      if (val === 'nothing') return;
      if (!allConfiguredDataValues.has(val)) missingDataValues.push(val);
    });

    // Maps
    const allowedMapValues = new Set(getMapIds());
    const unknownMapValues: string[] = [];
    allConfiguredMapValues.forEach((val) => {
      if (!allowedMapValues.has(val)) unknownMapValues.push(val);
    });
    const missingMapValues: string[] = [];
    allowedMapValues.forEach((val) => {
      if (!allConfiguredMapValues.has(val)) missingMapValues.push(val);
    });

    if (unknownDataValues.length > 0) {
      console.warn('[ControlsConfig] Unknown data values in controls config (not present in flow/point/dataset configs):', unknownDataValues);
    }
    if (missingDataValues.length > 0) {
      console.warn('[ControlsConfig] Data values present in configs but missing in controls config:', missingDataValues);
    }
    if (unknownMapValues.length > 0) {
      console.warn('[ControlsConfig] Unknown map values in controls config (not present in geoJsonConfig):', unknownMapValues);
    }
    if (missingMapValues.length > 0) {
      console.warn('[ControlsConfig] Map IDs present in geoJsonConfig but missing in controls config:', missingMapValues);
    }
  } catch (err) {
    console.error('[ControlsConfig] Validation error:', err);
  }
};


