const fs = require('fs');
const csv = require('csv-parser');

/**
 * Reads a CSV file and processes its content.
 * 
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Array>} - A promise that resolves with the parsed data.
 */
async function readCSV(filePath) {
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({ separator: '|' }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const cleanedResults = results.map(item => {
                    return Object.fromEntries(
                        Object.entries(item).map(([key, value]) => [
                            key.replace(/^\s+|\s+$/g, '')
                                .replace(/[^a-zA-Z0-9_]/g, ''),
                            value
                        ])
                    );
                });
                resolve(cleanedResults);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

/**
 * Finds the CityId for a given city name.
 * 
 * @param {Array} data - The array of CSV parsed data.
 * @param {string} cityName - The city name to search for.
 * @returns {string|null} - Returns the CityId or null if not found.
 */
function getCityIdByName(data, cityName) {
    const city = data.find(item => item.City && item.City.toUpperCase() === cityName.toUpperCase());
    return city ? city.CityId : null;
};

module.exports = {
    readCSV,
    getCityIdByName
};
