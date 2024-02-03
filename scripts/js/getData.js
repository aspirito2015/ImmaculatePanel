// Specify the local CSV file path
const catFilePath = './data/20240127_categories_export.csv';
const chaFilePath = './data/20240127_characters_export.csv';
const edgFilePath = './data/20240127_edgelist_export.csv';
var catJSON = fetchAndConvert(catFilePath);
var chaJSON = fetchAndConvert(chaFilePath);
var edgJSON = fetchAndConvert(edgFilePath);

export function getCat (id) { return catJSON[id]; }
export function getCha (id) { return chaJSON[id]; }
export function getEdg (id) { return edgJSON[id]; }


function fetchAndConvert(csvFilePath) {
    console.log(csvFilePath);
    var tmp;
    fetch(csvFilePath)
        .then(response => response.text())
        .then(csvContent => {
            tmp = convertCSVtoJSON(csvContent);
            console.log(tmp);
            return tmp;
    })
    .catch(error => console.error('Error fetching CSV file:', error));
    console.log("idk");
}


function convertCSVtoJSON(csvContent) {
    // console.log("convertCSVtoJSON");
    // console.log(csvContent);
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const jsonArray = [];
    
    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        const entry = {};
        
        for (let j = 1; j < headers.length; j++) {
            entry[headers[j]] = data[j];
        }
        
        jsonArray.push({[data[0]]: entry});
    }
    
    return jsonArray;
}
