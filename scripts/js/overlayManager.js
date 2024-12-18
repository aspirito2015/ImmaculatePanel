import { search_off } from "./searchManager.js";
import { summary_off } from "./summaryManager.js";

let loading = false;
let loadingNum = 0;

main();

function main() {
    // Handle disabling overlays on click outside of the overlay
    let elements = document.getElementsByClassName("stop-propagation");
    console.log(elements);
    Array.from(elements).forEach(element => {
        console.log(element);
        element.addEventListener("click", function (e) {
            e.stopPropagation();
        });
    });
    document.getElementById('overlay').addEventListener("click", function() {
        search_off();
        summary_off();
    });
    // FROM BAD COMMIT
    // document.getElementById('scrim').addEventListener("click", function () {
    //     if (!loading) {
    //         console.log(`is not loading! (loading is ${loading})`);
    //         search_off();
    //         summary_off();
    //         console.log("SCRIM PRESSED");
    //     }
    // });
    console.log("overlayManager.js main() done");
}

export function isLoading () {
    return loading;
}

export function setLoading (b) {
    loadingNum += (b ? 1 : -1);
    if (loadingNum > 0) {
        if (loading) return;
        loading = true;
        document.getElementById("scrim").style.display = "block";
        document.body.classList.add('noscroll');
    } else {
        if (!loading) return;
        loading = false;
        document.getElementById("scrim").style.display = "none";
        document.body.classList.remove('noscroll');
    }
}
