const urlBase = 'http://localhost:8000'

async function getPredictions() {
    const response = await fetch(`${urlBase}/predictions`);
    const data = await response.json();
    console.log(data);
    return data;
}

async function loadKPIs() {
    try {
        const response = await fetch(`${urlBase}/stats`);
        if (!response.ok) {
            throw new Error("Erro ao carregar dados");
            return;
        }
        const data = await response.json();

        const totalPredictions = data.total_predictions || 0;
        const predictionsByClass = data.predictions_by_class || [];
        const avgProbability = data.average_probability || 0;

        const highRisk = predictionsByClass.find(item => item.prediction === 1)?.count || 0;
        const lowRisk = predictionsByClass.find(item => item.prediction === 0)?.count || 0;

        document.getElementById("kpiTotalPredictions").textContent = totalPredictions;
        document.getElementById("kpiHighRisk").textContent = highRisk;
        document.getElementById("kpiLowRisk").textContent = lowRisk;
        document.getElementById("kpiAvgProbability").textContent = `${avgProbability * 100}%`;
    } catch (error) {
        console.error("Erro ao carregar KPIs:", error);
    }
}