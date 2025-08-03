#!/usr/bin/env python3
"""
GeoJSON Structure Analyzer

This script analyzes a GeoJSON file and generates a comprehensive markdown file
showing the structure, variables, and properties of the GeoJSON data.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Set
from datetime import datetime
import argparse

class GeoJSONAnalyzer:
    def __init__(self, geojson_path: str):
        self.geojson_path = Path(geojson_path)
        self.data = None
        self.analysis = {
            'file_info': {},
            'structure': {},
            'properties': {},
            'geometry_types': set(),
            'coordinate_systems': set(),
            'statistics': {}
        }
    
    def load_geojson(self) -> bool:
        """Load and validate the GeoJSON file."""
        try:
            with open(self.geojson_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            return True
        except FileNotFoundError:
            print(f"❌ Error: File '{self.geojson_path}' not found.")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Error: Invalid JSON in '{self.geojson_path}': {e}")
            return False
    
    def analyze_file_info(self):
        """Analyze basic file information."""
        self.analysis['file_info'] = {
            'file_path': str(self.geojson_path),
            'file_size': self.geojson_path.stat().st_size,
            'file_size_mb': round(self.geojson_path.stat().st_size / (1024 * 1024), 2),
            'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def analyze_structure(self):
        """Analyze the overall structure of the GeoJSON."""
        if not self.data:
            return
        
        self.analysis['structure'] = {
            'type': self.data.get('type'),
            'has_features': 'features' in self.data,
            'feature_count': len(self.data.get('features', [])),
            'has_bbox': 'bbox' in self.data,
            'has_crs': 'crs' in self.data,
            'top_level_keys': list(self.data.keys())
        }
        
        if 'crs' in self.data:
            self.analysis['coordinate_systems'].add(str(self.data['crs']))
    
    def analyze_properties(self):
        """Analyze properties across all features."""
        if not self.data or 'features' not in self.data:
            return
        
        all_properties = {}
        property_types = {}
        property_values = {}
        unique_values = {}
        
        for feature in self.data['features']:
            properties = feature.get('properties', {})
            
            for key, value in properties.items():
                # Track property existence
                if key not in all_properties:
                    all_properties[key] = 0
                all_properties[key] += 1
                
                # Track property types
                value_type = type(value).__name__
                if key not in property_types:
                    property_types[key] = set()
                property_types[key].add(value_type)
                
                # Track sample values
                if key not in property_values:
                    property_values[key] = []
                if len(property_values[key]) < 5:  # Keep first 5 samples
                    property_values[key].append(str(value))
                
                # Track unique values
                if key not in unique_values:
                    unique_values[key] = set()
                unique_values[key].add(str(value))
        
        self.analysis['properties'] = {
            'all_properties': dict(sorted(all_properties.items(), key=lambda x: x[1], reverse=True)),
            'property_types': {k: list(v) for k, v in property_types.items()},
            'sample_values': property_values,
            'unique_value_counts': {k: len(v) for k, v in unique_values.items()}
        }
    
    def analyze_geometry(self):
        """Analyze geometry types and coordinate systems."""
        if not self.data or 'features' not in self.data:
            return
        
        geometry_types = set()
        coordinate_counts = []
        
        for feature in self.data['features']:
            geometry = feature.get('geometry', {})
            geom_type = geometry.get('type')
            if geom_type:
                geometry_types.add(geom_type)
            
            # Analyze coordinates
            coords = geometry.get('coordinates', [])
            if coords:
                coord_count = self._count_coordinates(coords)
                coordinate_counts.append(coord_count)
        
        self.analysis['geometry_types'] = geometry_types
        self.analysis['statistics']['avg_coordinates'] = sum(coordinate_counts) / len(coordinate_counts) if coordinate_counts else 0
        self.analysis['statistics']['total_features'] = len(self.data['features'])
    
    def _count_coordinates(self, coords) -> int:
        """Recursively count coordinates in a geometry."""
        if isinstance(coords, (int, float)):
            return 1
        elif isinstance(coords, list):
            return sum(self._count_coordinates(coord) for coord in coords)
        return 0
    
    def generate_markdown(self, output_path: str = None) -> str:
        """Generate a comprehensive markdown report."""
        if not output_path:
            # Save in the helper directory by default
            helper_dir = Path(__file__).parent
            stem = self.geojson_path.stem
            output_path = helper_dir / f"{stem}.structure.md"
        
        md_content = []
        
        # Header
        md_content.append(f"# GeoJSON Structure Analysis")
        md_content.append(f"")
        md_content.append(f"**File:** `{self.analysis['file_info']['file_path']}`  ")
        md_content.append(f"**Analysis Date:** {self.analysis['file_info']['analysis_date']}  ")
        md_content.append(f"**File Size:** {self.analysis['file_info']['file_size_mb']} MB")
        md_content.append(f"")
        
        # File Information
        md_content.append(f"## 📁 File Information")
        md_content.append(f"")
        md_content.append(f"| Property | Value |")
        md_content.append(f"|----------|-------|")
        md_content.append(f"| File Path | `{self.analysis['file_info']['file_path']}` |")
        md_content.append(f"| File Size | {self.analysis['file_info']['file_size_mb']} MB |")
        md_content.append(f"| Analysis Date | {self.analysis['file_info']['analysis_date']} |")
        md_content.append(f"")
        
        # Structure Overview
        md_content.append(f"## 🏗️ Structure Overview")
        md_content.append(f"")
        md_content.append(f"| Property | Value |")
        md_content.append(f"|----------|-------|")
        md_content.append(f"| GeoJSON Type | `{self.analysis['structure']['type']}` |")
        md_content.append(f"| Feature Count | {self.analysis['structure']['feature_count']} |")
        md_content.append(f"| Has Bounding Box | {'✅' if self.analysis['structure']['has_bbox'] else '❌'} |")
        md_content.append(f"| Has CRS | {'✅' if self.analysis['structure']['has_crs'] else '❌'} |")
        md_content.append(f"")
        
        # Top-level keys
        md_content.append(f"### Top-level Keys")
        md_content.append(f"")
        for key in self.analysis['structure']['top_level_keys']:
            md_content.append(f"- `{key}`")
        md_content.append(f"")
        
        # Geometry Analysis
        if self.analysis['geometry_types']:
            md_content.append(f"## 📐 Geometry Analysis")
            md_content.append(f"")
            md_content.append(f"### Geometry Types")
            md_content.append(f"")
            for geom_type in sorted(self.analysis['geometry_types']):
                md_content.append(f"- `{geom_type}`")
            md_content.append(f"")
            
            if self.analysis['statistics']['avg_coordinates'] > 0:
                md_content.append(f"### Statistics")
                md_content.append(f"")
                md_content.append(f"| Metric | Value |")
                md_content.append(f"|--------|-------|")
                md_content.append(f"| Average Coordinates per Feature | {self.analysis['statistics']['avg_coordinates']:.1f} |")
                md_content.append(f"| Total Features | {self.analysis['statistics']['total_features']} |")
                md_content.append(f"")
        
        # Properties Analysis
        if self.analysis['properties']['all_properties']:
            md_content.append(f"## 📊 Properties Analysis")
            md_content.append(f"")
            md_content.append(f"### Property Summary")
            md_content.append(f"")
            md_content.append(f"| Property | Occurrences | Data Types | Unique Values |")
            md_content.append(f"|----------|-------------|------------|---------------|")
            
            for prop, count in self.analysis['properties']['all_properties'].items():
                types = ', '.join(self.analysis['properties']['property_types'][prop])
                unique_count = self.analysis['properties']['unique_value_counts'][prop]
                md_content.append(f"| `{prop}` | {count} | {types} | {unique_count} |")
            md_content.append(f"")
            
            # Sample Values
            md_content.append(f"### Sample Values")
            md_content.append(f"")
            for prop, samples in self.analysis['properties']['sample_values'].items():
                md_content.append(f"#### `{prop}`")
                md_content.append(f"")
                for i, sample in enumerate(samples, 1):
                    md_content.append(f"{i}. `{sample}`")
                md_content.append(f"")
        
        # Coordinate Systems
        if self.analysis['coordinate_systems']:
            md_content.append(f"## �� Coordinate Systems")
            md_content.append(f"")
            for crs in self.analysis['coordinate_systems']:
                md_content.append(f"- {crs}")
            md_content.append(f"")
        
        # Recommendations
        md_content.append(f"## �� Recommendations")
        md_content.append(f"")
        md_content.append(f"### For React Map Integration")
        md_content.append(f"")
        
        # Find potential name properties
        name_properties = []
        for prop in self.analysis['properties']['all_properties'].keys():
            if any(word in prop.lower() for word in ['name', 'region', 'province', 'state', 'area', 'id']):
                name_properties.append(prop)
        
        if name_properties:
            md_content.append(f"**Potential join properties for region mapping:**")
            md_content.append(f"")
            for prop in name_properties:
                md_content.append(f"- `{prop}`")
            md_content.append(f"")
        
        md_content.append(f"### Data Quality Notes")
        md_content.append(f"")
        if self.analysis['structure']['feature_count'] == 0:
            md_content.append(f"- ⚠️ No features found in the GeoJSON file")
        else:
            md_content.append(f"- ✅ Found {self.analysis['structure']['feature_count']} features")
        
        if not self.analysis['properties']['all_properties']:
            md_content.append(f"- ⚠️ No properties found in features")
        else:
            md_content.append(f"- ✅ Found {len(self.analysis['properties']['all_properties'])} unique properties")
        
        if not self.analysis['geometry_types']:
            md_content.append(f"- ⚠️ No geometry types found")
        else:
            md_content.append(f"- ✅ Found {len(self.analysis['geometry_types'])} geometry type(s)")
        md_content.append(f"")
        
        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(md_content))
        
        return output_path
    
    def analyze(self) -> bool:
        """Run the complete analysis."""
        if not self.load_geojson():
            return False
        
        print(f"�� Analyzing GeoJSON: {self.geojson_path}")
        
        self.analyze_file_info()
        self.analyze_structure()
        self.analyze_properties()
        self.analyze_geometry()
        
        return True

def main():
    """Main function to run the GeoJSON analyzer."""
    parser = argparse.ArgumentParser(description='Analyze GeoJSON file structure and generate markdown report')
    parser.add_argument('geojson_path', help='Path to the GeoJSON file')
    parser.add_argument('-o', '--output', help='Output markdown file path (optional)')
    
    args = parser.parse_args()
    
    analyzer = GeoJSONAnalyzer(args.geojson_path)
    
    if analyzer.analyze():
        output_path = analyzer.generate_markdown(args.output)
        print(f"✅ Analysis complete! Markdown report generated: {output_path}")
        print(f"📊 Found {analyzer.analysis['structure']['feature_count']} features")
        print(f"📋 Found {len(analyzer.analysis['properties']['all_properties'])} unique properties")
        if analyzer.analysis['geometry_types']:
            print(f"📐 Geometry types: {', '.join(analyzer.analysis['geometry_types'])}")
    else:
        print("❌ Analysis failed. Please check the file path and format.")
        sys.exit(1)

if __name__ == "__main__":
    main() 