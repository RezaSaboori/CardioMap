# GIS Helper Scripts

This directory contains Python utility scripts for analyzing and extracting data from GeoJSON files.

## Scripts

### 1. `geojson_structure_analyzer.py`

Analyzes a GeoJSON file and generates a comprehensive markdown report showing the structure, properties, and variables.

**Usage:**
```bash
python geojson_structure_analyzer.py <geojson_file_path> [-o output_file.md]
```

**Example:**
```bash
python geojson_structure_analyzer.py ../../datasets/geojson/Iran.json
```

**Output:** Generates a markdown file (e.g., `Iran.structure.md`) in the helper directory containing:
- File information and statistics
- Structure overview
- Geometry analysis
- Properties analysis with sample values
- Recommendations for React map integration

### 2. `extract_nested_values.py`

Extracts values from nested GeoJSON properties using dot notation and exports them to a CSV file.

**Usage:**
```bash
python extract_nested_values.py <geojson_file_path> <nested_path> [-o output_file.csv]
```

**Examples:**
```bash
# Extract English province names
python extract_nested_values.py ../../datasets/geojson/Iran.json "tags.name:en"

# Extract Persian province names
python extract_nested_values.py ../../datasets/geojson/Iran.json "tags.name:fa"

# Extract ISO codes
python extract_nested_values.py ../../datasets/geojson/Iran.json "tags.ISO3166-2"

# With custom output file
python extract_nested_values.py ../../datasets/geojson/Iran.json "tags.name:en" -o province_names.csv
```

**Output:** Generates a CSV file (e.g., `Iran_extracted_values.csv`) in the helper directory with a single column containing the extracted values.

## Path Notation

The scripts use dot notation to access nested properties:

- `tags.name:en` - Accesses `name:en` property inside the `tags` object
- `properties.region` - Accesses `region` property directly
- `tags.ISO3166-2` - Accesses `ISO3166-2` property inside the `tags` object

## Output Location

All output files are saved in the helper directory by default:
- Structure analysis reports: `*.structure.md`
- Extracted values: `*_extracted_values.csv`

## Requirements

- Python 3.6+
- Standard library modules: `json`, `csv`, `sys`, `pathlib`, `argparse`

## Integration with React GIS

These scripts help with:
1. **Understanding GeoJSON structure** - Use the structure analyzer to see available properties
2. **Finding join properties** - Identify the correct property names for region mapping
3. **Data extraction** - Extract specific values for use in your React application
4. **Quality assurance** - Verify data consistency and completeness

## Example Workflow

1. **Analyze your GeoJSON:**
   ```bash
   python geojson_structure_analyzer.py ../../datasets/geojson/Iran.json
   ```

2. **Review the generated markdown** to understand the structure

3. **Extract specific values:**
   ```bash
   python extract_nested_values.py ../../datasets/geojson/Iran.json "tags.name:en"
   ```

4. **Use the CSV output** in your React application for region mapping 