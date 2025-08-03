#!/usr/bin/env python3
"""
GeoJSON Nested Value Extractor

This script extracts values from nested GeoJSON properties based on user-specified paths
and exports them to a CSV file.
"""

import json
import csv
import sys
from pathlib import Path
from typing import List, Any, Dict
import argparse

class NestedValueExtractor:
    def __init__(self, geojson_path: str):
        self.geojson_path = Path(geojson_path)
        self.data = None
        self.extracted_values = []
    
    def load_geojson(self) -> bool:
        """Load the GeoJSON file."""
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
    
    def get_nested_value(self, obj: Any, path: str) -> Any:
        """
        Extract value from nested object using dot notation path.
        
        Args:
            obj: The object to search in
            path: Dot-separated path (e.g., "tags.name:en")
        
        Returns:
            The value at the specified path, or None if not found
        """
        try:
            keys = path.split('.')
            current = obj
            
            for key in keys:
                if isinstance(current, dict) and key in current:
                    current = current[key]
                else:
                    return None
            
            return current
        except (KeyError, TypeError, AttributeError):
            return None
    
    def extract_values(self, path: str) -> List[str]:
        """
        Extract values from all features using the specified path.
        
        Args:
            path: Dot-separated path to the nested value
            
        Returns:
            List of extracted values
        """
        if not self.data or 'features' not in self.data:
            print("❌ Error: No features found in GeoJSON file.")
            return []
        
        values = []
        features = self.data['features']
        
        print(f"🔍 Extracting values from path: '{path}'")
        print(f"�� Processing {len(features)} features...")
        
        for i, feature in enumerate(features):
            properties = feature.get('properties', {})
            value = self.get_nested_value(properties, path)
            
            if value is not None:
                values.append(str(value))
                print(f"  Feature {i+1}: Found '{value}'")
            else:
                values.append("")  # Empty string for missing values
                print(f"  Feature {i+1}: No value found")
        
        return values
    
    def export_to_csv(self, values: List[str], output_path: str = None) -> str:
        """
        Export extracted values to a CSV file.
        
        Args:
            values: List of values to export
            output_path: Output CSV file path (optional)
            
        Returns:
            Path to the generated CSV file
        """
        if not output_path:
            # Save in the helper directory by default
            helper_dir = Path(__file__).parent
            stem = self.geojson_path.stem
            output_path = helper_dir / f"{stem}_extracted_values.csv"
        
        output_path = Path(output_path)
        
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write header
            writer.writerow(['value'])
            
            # Write values
            for value in values:
                writer.writerow([value])
        
        return str(output_path)
    
    def analyze_available_paths(self) -> Dict[str, List[str]]:
        """
        Analyze the first few features to show available nested paths.
        
        Returns:
            Dictionary of available paths and their sample values
        """
        if not self.data or 'features' not in self.data:
            return {}
        
        available_paths = {}
        features = self.data['features'][:3]  # Analyze first 3 features
        
        for i, feature in enumerate(features):
            properties = feature.get('properties', {})
            self._find_nested_paths(properties, f"Feature {i+1}", available_paths)
        
        return available_paths
    
    def _find_nested_paths(self, obj: Any, current_path: str, paths: Dict[str, List[str]], max_depth: int = 3):
        """
        Recursively find all nested paths in an object.
        
        Args:
            obj: The object to analyze
            current_path: Current path being built
            paths: Dictionary to store found paths
            max_depth: Maximum depth to search
        """
        if max_depth <= 0 or not isinstance(obj, dict):
            return
        
        for key, value in obj.items():
            path = f"{current_path}.{key}" if current_path != "" else key
            
            if isinstance(value, dict):
                # Store the path for nested objects
                if path not in paths:
                    paths[path] = []
                paths[path].append(f"<nested object with {len(value)} keys>")
                
                # Recursively search deeper
                self._find_nested_paths(value, path, paths, max_depth - 1)
            else:
                # Store the path for simple values
                if path not in paths:
                    paths[path] = []
                paths[path].append(str(value))
    
    def run(self, path: str, output_path: str = None) -> bool:
        """
        Run the complete extraction process.
        
        Args:
            path: Dot-separated path to extract values from
            output_path: Output CSV file path (optional)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.load_geojson():
            return False
        
        print(f"�� Analyzing GeoJSON: {self.geojson_path}")
        print(f"🔍 Target path: '{path}'")
        print("=" * 60)
        
        # Show available paths for reference
        print("📋 Available nested paths (from first 3 features):")
        available_paths = self.analyze_available_paths()
        for path_name, samples in available_paths.items():
            print(f"  - {path_name}")
            for sample in samples[:2]:  # Show first 2 samples
                print(f"    Sample: {sample}")
        print("=" * 60)
        
        # Extract values
        values = self.extract_values(path)
        
        if not values:
            print("❌ No values found for the specified path.")
            return False
        
        # Export to CSV
        csv_path = self.export_to_csv(values, output_path)
        
        print("=" * 60)
        print(f"✅ Extraction complete!")
        print(f"📊 Extracted {len(values)} values")
        print(f"📄 CSV file: {csv_path}")
        
        # Show summary
        non_empty_values = [v for v in values if v.strip()]
        print(f"📈 Non-empty values: {len(non_empty_values)}")
        print(f"�� Empty values: {len(values) - len(non_empty_values)}")
        
        if non_empty_values:
            print(f"🎯 Sample values:")
            for i, value in enumerate(non_empty_values[:5]):
                print(f"  {i+1}. {value}")
        
        return True

def main():
    """Main function to run the nested value extractor."""
    parser = argparse.ArgumentParser(
        description='Extract nested values from GeoJSON file and export to CSV'
    )
    parser.add_argument('geojson_path', help='Path to the GeoJSON file')
    parser.add_argument('path', help='Dot-separated path to extract (e.g., "tags.name:en")')
    parser.add_argument('-o', '--output', help='Output CSV file path (optional)')
    
    args = parser.parse_args()
    
    extractor = NestedValueExtractor(args.geojson_path)
    
    if extractor.run(args.path, args.output):
        print("\n�� Success! Check the generated CSV file for your extracted values.")
    else:
        print("\n❌ Extraction failed. Please check the file path and property path.")
        sys.exit(1)

if __name__ == "__main__":
    main() 