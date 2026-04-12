let timelineChartInstance = null;
let riskDistributionChartInstance = null;

async function loadChartPrincipal(days = 10) {
    const urlBase = 'http://localhost:8000'
    const response = await fetch(`${urlBase}/stats/timeline?days=${days}`);
    const data = await response.json();
    console.log(data);

    const labels = data.map(item => item.date);
    const positiveData = data.map(item => item.positive);
    const negativeData = data.map(item => item.negative);

    const ctx = document.getElementById('grafico-principal').getContext('2d');

    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }

    timelineChartInstance = new Chart(
        ctx,
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Risco alto",
                        data: positiveData,
                        borderColor: "#dc3545",
                        backgroundColor: "rgba(220, 53, 69, 0.15)",
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "Risco baixo",
                        data: negativeData,
                        borderColor: "#198754",
                        backgroundColor: "rgba(25, 135, 84, 0.15)",
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                        },
                        title: {
                            display: true,
                            text: 'Quantidade'
                        },
                    }
                }
            }
        }
    )


}

async function loadRiskDistributionChart() {
    try {
        const urlBase = 'http://localhost:8000'
        const response = await fetch(`${urlBase}/stats`);
        if (!response.ok) {
            throw new Error("Erro ao carregar dados");
            return;
        }
        const data = await response.json();
        console.log(data);
        const predictionsByClass = data.predictions_by_class || [];

        const highRisk = predictionsByClass.find(item => item.prediction === 1)?.count || 0;
        console.log(highRisk);
        const lowRisk = predictionsByClass.find(item => item.prediction === 0)?.count || 0;
        console.log(lowRisk);

        const lowRiskCountElement = document.getElementById("lowRiskCount");
        if (lowRiskCountElement) lowRiskCountElement.textContent = lowRisk;
        const highRiskCountElement = document.getElementById("highRiskCount");
        if (highRiskCountElement) highRiskCountElement.textContent = highRisk;

        const ctx = document.getElementById("riskDistributionChart").getContext("2d");
        if (!ctx) {
            console.error("Canvas riskDistributionChart não encontrado");
            return;
        }
        if (riskDistributionChartInstance) {
            riskDistributionChartInstance.destroy();
        }

        riskDistributionChartInstance = new Chart(
            ctx, {
                type: "doughnut",
                data: {
                    labels: ["Baixo risco", "Alto risco"],
                    datasets: [
                        {
                            data: [lowRisk, highRisk],
                            backgroundColor: ["#198754", "#dc3545"],
                            hoverOffset: 8,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom"
                        }
                    }
                }
            });
    } catch
        (err) {
        console.error("Erro ao carregar gráfico doughnut:", error);
    }
}