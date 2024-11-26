import { search_off } from "./searchManager.js";
import { summary_off } from "./summaryManager.js";

let loading = false;

main();

function main() {
    // Handle disabling overlays on click outside of the overlay
    srch_bar.addEventListener("click", function (e) { e.stopPropagation(); });
    document.getElementById('sum').addEventListener("click", function (e) {
        e.stopPropagation();
    });
    document.getElementById('scrim').addEventListener("click", function () {
        if (!loading) {
            console.log(`is not loading! (loading is ${loading})`);
            search_off();
            summary_off();
        }
    });
    console.log("overlayManager.js main() done");
}

export function isLoading () {
    return loading;
}

export function setLoading (b) {
    if (b) {
        loading = true;
        document.getElementById("overlay").style.display = "block";
        document.getElementById('loading').style.display = "";
        document.body.classList.add('noscroll');
    } else {
        loading = false;
        document.getElementById("overlay").style.display = "none";
        document.getElementById('loading').style.display = "none";
        document.getElementById('overlay').addEventListener("click", function () {
            if (!loading) {
                console.log(`is not loading! (loading is ${loading})`);
                search_off();
                summary_off();
            }
        });
    }
}
