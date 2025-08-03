// This file is no longer needed as the CSV names now match the GeoJSON names exactly
// The mapping has been removed to eliminate unnecessary code complexity

export const getCsvProvinceName = (geoJsonProvinceId: string): string | undefined => {
    // Since CSV names now match GeoJSON names exactly, we can return the input directly
    // or implement a simple normalization if needed
    return geoJsonProvinceId;
}; 