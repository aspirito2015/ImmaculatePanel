import { getSummaryBools } from "./gameManager.js";

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
    })
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
