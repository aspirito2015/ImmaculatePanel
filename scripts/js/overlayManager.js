import { search_off } from "./searchManager.js";
import { summary_off } from "./summaryManager.js";

main();

function main() {
    // Handle disabling overlays on click outside of the overlay
    srch_bar.addEventListener("click", function (e) { e.stopPropagation(); });
    document.getElementById('sum').addEventListener("click", function (e) {
        e.stopPropagation();
    });
    document.getElementById('overlay').addEventListener("click", function () {
        search_off();
        // summary_off();
        summary_off();
    });
    console.log("overlayManager.js main() done");
}
