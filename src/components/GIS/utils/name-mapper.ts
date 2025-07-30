const provinceNameMap: { [key: string]: string } = {
    "Alborz": "Alborz",
    "Ardabil": "Ardabil",
    "Bushehr": "Bushehr",
    "ChaharmahalandBakhtiari": "Chahar Mahal and Bakhtiari",
    "EastAzerbaijan": "East Azerbaijan",
    "Fars": "Fars",
    "Gilan": "Gilan",
    "Golestan": "Golestan",
    "Hamadan": "Hamadan",
    "Hormozgan": "Hormozgan",
    "Ilam": "Ilam",
    "Isfahan": "Isfahan",
    "Kerman": "Kerman",
    "Kermanshah": "Kermanshah",
    "Khuzestan": "Khuzestan",
    "Kohgiluyeh and Boyer-Ahmad": "Kohgiluyeh and Boyer-Ahmad",
    "Kurdistan": "Kurdistan",
    "Lorestan": "Lorestan",
    "Markazi": "Markazi",
    "Mazandaran": "Mazandaran",
    "NorthKhorasan": "North Khorasan",
    "Qazvin": "Qazvin",
    "Qom": "Qom",
    "RazaviKhorasan": "Razavi Khorasan",
    "Semnan": "Semnan",
    "SistanandBaluchestan": "Sistan and Baluchestan",
    "SouthKhorasan": "South Khorasan",
    "Tehran": "Tehran",
    "WestAzerbaijan": "West Azerbaijan",
    "Yazd": "Yazd",
    "Zanjan": "Zanjan"
};

export const getCsvProvinceName = (geoJsonProvinceId: string): string | undefined => {
    return provinceNameMap[geoJsonProvinceId];
}; 