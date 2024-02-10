import { getCategoryIDs, getSummaryBools } from "./gameManager.js";
import { sqliteQuery } from "./sqliteQuerier.js";

main();

function main() {
    document.getElementById("giveup").addEventListener("click", function () {
        summary_on();
    });
    document.getElementById("x-btn").addEventListener("click", function () {
        summary_off();
    });
    document.getElementById("copy-sum").addEventListener("click", function () {
        copy_sum();
    });
    fillSummaryPanel();
}

export function summary_on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("sum").style.display = "";
    document.body.classList.add('noscroll');
}

export function summary_off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("sum").style.display = "none";
    document.body.classList.remove('noscroll');
}

async function fillSummaryPanel() {
    let answerGrid = document.getElementById("answer-grid");
    let intersection_tags = answerGrid.getElementsByClassName("ans-num");
    let hyperlink_tags = answerGrid.getElementsByTagName("a");
    let category_ids = getCategoryIDs();
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let cat_1 = category_ids[x];
            let cat_2 = category_ids[y + 3];
            let q = `SELECT catID_1, intersection FROM intersections WHERE 
                (catID_1=${cat_1} AND catID_2=${cat_2}) 
                OR (catID_1=${cat_2} AND catID_2=${cat_1})`;
            let result = await sqliteQuery(q);
            let n = result[cat_1].intersection;
            let index = x + 3 * y;
            let url = `answers.html?category1=${cat_1}&category2=${cat_2}`;
            hyperlink_tags[index].href = url;
            hyperlink_tags[index].target = "_blank";
            intersection_tags[index].innerHTML = n;
        }
    }
    console.log("finished filling summary panel");
}

function copy_sum() {
    let txt = "";
    let count = 0;
    let sum_bools = getSummaryBools();
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (sum_bools[x + 3 * y]) {
                // Green Square: 🟩 Dec: &#129001	Hex: &#x1F7E9
                txt += "&#129001";
                count++;
            } else {
                // White Square: ⬜ Dec: &#11036    Hex:	&#x2B1C
                txt += "&#11036";
            }
        }
        txt += "\n";
    }
    txt = "Immaculate Inning 999 " + count + "/9:\nRarity: 999\n" + txt + "Play at https://aspirito2015.github.io/MarvelGrid_HTML/";
    let copy_tmp = document.getElementById("copy-tmp");
    copy_tmp.innerHTML = txt;
    navigator.clipboard.writeText(copy_tmp.innerHTML);
    console.log("Copied to clipboard");
}
