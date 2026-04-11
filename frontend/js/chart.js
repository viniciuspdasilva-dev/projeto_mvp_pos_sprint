let timelineChartInstance = null;

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