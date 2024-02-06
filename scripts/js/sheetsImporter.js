var url_root = 'https://docs.google.com/spreadsheets/d/';
var q1 = '/gviz/tq?';
var q2 = 'tqx=out:json';

export async function importSheet(ssid, sheetName, query) {
    console.log(`started importing ${sheetName} - ${query}`);
    var q3 = `sheet=${sheetName}`;
    var q4 = encodeURIComponent(query);
    var url = `${url_root}${ssid}${q1}&${q2}&${q3}&tq=${q4}`;
    var response = await fetch(url);
    var data = await response.text();
    var temp = data.substr(47).slice(0, -2);
    var json = JSON.parse(temp);
    console.log(`finished importing ${sheetName} - ${query}`);
    return json;
}

// Take the messy json we get from our url fetch and simplify it
export function cleanJSON(jsonData) {
    let cleanData = {};
    let column_labels = [];
    let cols = jsonData.table.cols;
    let x = 0;
    for (let i = 0; i < cols.length; i++) {
        // set x to 1 if there aren't column labels so the first row isn't data
        if (cols[i].label == "") {
            x = 1;
            break;
        }
        column_labels.push(cols[i].label);
    }

    let rows = jsonData.table.rows;
    // if there weren't column labels earlier, use the first row as labels
    if (x == 1) {
        for (let y = 0; y < rows[0].c.length; y++) {
            column_labels.push(rows[0].c[y].v);
        }
    }
    // use the rest of the rows to populate the object
    for (x; x < rows.length; x++) {
        var id = rows[x].c[0].v;
        var d = {};
        for (let y = 1; y < column_labels.length; y++) {
            let temp = "";
            if (rows[x].c[y] != null) temp = rows[x].c[y].v;
            d[column_labels[y]] = temp;
        }
        cleanData[id] = d;
    }
    return cleanData;
}

export async function getCharacterData(characterID) {
    let ssid = "1FbVRkJ1NM3ZxvR2Ms2rincVCsGE3MYoehnIc8Vxf4NY";
    let query = `select A,B,C,D,E where A='${characterID}'`;
    let results = await importSheet(ssid, "characters_export", query);
    let data = cleanJSON(results)[characterID];
    return data;
}
