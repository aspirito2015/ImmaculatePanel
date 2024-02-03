alreadyExists = false;
function initializeChartJS() {
    if (alreadyExists) {
        return;
    }
    const xValues = Array.from({length: 10}, (_, i) => i);
    const yValues = [3, 0, 0, 1, 1, 3, 7, 12, 15, 21];
    chart = new Chart("playerScores", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [
                {
                backgroundColor: "rgb(89 209 133)",
                data: yValues,
                borderRadius: Number.MAX_VALUE,
                borderSkipped: false,
                barPercentage: 0.15,
                datalabels: {
                    anchor: "end",
                    align: "end",
                    offset: 4,
                },
                },
            ],
        },
        options: {
            animation: { duration: 0 },
            plugins: {
                legend: false,
                tooltip: { enabled: false },
            },
            scales: {
                y: { display: false },
                x: { 
                    title: {
                        font: {
                            color: "white",
                            family: "'Comic Sans MS', 'Comic Sans', cursive",
                        },
                        display: true,
                        text: "SCORE",
                        padding: { top: 10 },
                    }, 
                },
            },
            hover: { mode: null },
        },
        plugins: [ChartDataLabels],
    });

    alreadyExists = true;
}