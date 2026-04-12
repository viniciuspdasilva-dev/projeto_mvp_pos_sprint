const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
const form = document.getElementById("predictionForm");
const submitBtn = document.getElementById("submitBtn");
const fillExampleBtn = document.getElementById("fillExampleBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const formMessage = document.getElementById("formMessage");
const emptyState = document.getElementById("emptyState");

const loadingState = document.getElementById("loadingState");
const resultContainer = document.getElementById("resultContainer");
const resultBadge = document.getElementById("resultBadge");

const resultScore = document.getElementById("resultScore");
const resultLabel = document.getElementById("resultLabel");
const resultProbability = document.getElementById("resultProbability");
const resultAlert = document.getElementById("resultAlert");
const riskBarFill = document.getElementById("riskBarFill");


function getNumberValue(id) {
    return Number(document.getElementById(id).value);
}

function getPayload() {
    return {
        age: getNumberValue("age"),
        anaemia: getNumberValue("anaemia"),
        creatinine_phosphokinase: getNumberValue("creatinine_phosphokinase"),
        diabetes: getNumberValue("diabetes"),
        ejection_fraction: getNumberValue("ejection_fraction"),
        high_blood_pressure: getNumberValue("high_blood_pressure"),
        platelets: getNumberValue("platelets"),
        serum_creatinine: getNumberValue("serum_creatinine"),
        serum_sodium: getNumberValue("serum_sodium"),
        sex: getNumberValue("sex"),
        smoking: getNumberValue("smoking"),
        time: getNumberValue("time"),
    };
}

function showMessage(type, text) {
    formMessage.innerHTML = `<div class="alert alert-${type} mb-0">${text}</div>`;
}

function clearMessage() {
    formMessage.innerHTML = "";
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
}

function setFormValues(data) {
    document.getElementById("age").value = data.age;
    document.getElementById("anaemia").value = data.anaemia;
    document.getElementById("creatinine_phosphokinase").value = data.creatinine_phosphokinase;
    document.getElementById("diabetes").value = data.diabetes;
    document.getElementById("ejection_fraction").value = data.ejection_fraction;
    document.getElementById("high_blood_pressure").value = data.high_blood_pressure;
    document.getElementById("platelets").value = data.platelets;
    document.getElementById("serum_creatinine").value = data.serum_creatinine;
    document.getElementById("serum_sodium").value = data.serum_sodium;
    document.getElementById("sex").value = data.sex;
    document.getElementById("smoking").value = data.smoking;
    document.getElementById("time").value = data.time;
}

function generateLowRiskExample() {
    return {
        age: randomInt(40, 65),
        anaemia: randomInt(0, 1),
        creatinine_phosphokinase: randomInt(23, 250),
        diabetes: randomInt(0, 1),
        ejection_fraction: randomInt(40, 60),
        high_blood_pressure: randomInt(0, 1),
        platelets: randomFloat(200000, 450000),
        serum_creatinine: randomFloat(0.7, 1.3),
        serum_sodium: randomInt(135, 145),
        sex: randomInt(0, 1),
        smoking: randomInt(0, 1),
        time: randomInt(120, 300)
    };
}

function generateHighRiskExample() {
    return {
        age: randomInt(65, 90),
        anaemia: randomInt(0, 1),
        creatinine_phosphokinase: randomInt(250, 800),
        diabetes: randomInt(0, 1),
        ejection_fraction: randomInt(15, 35),
        high_blood_pressure: randomInt(0, 1),
        platelets: randomFloat(100000, 250000),
        serum_creatinine: randomFloat(1.8, 5.0),
        serum_sodium: randomInt(120, 134),
        sex: randomInt(0, 1),
        smoking: randomInt(0, 1),
        time: randomInt(1, 90)
    };
}

let lastProfileWasHighRisk = false;

function updateButtonLabelAndStyle() {
    let btnFillExample = document.getElementById("fillExampleBtn");
    btnFillExample.textContent = lastProfileWasHighRisk ? "Exemplo de perfil baixo risco" : "Exemplo de perfil alto risco";
    btnFillExample.classList.remove("btn-outline-danger");
    btnFillExample.classList.remove("btn-outline-success");
    btnFillExample.classList.add(lastProfileWasHighRisk ? "btn-outline-success" : "btn-outline-danger");
}

function fillExample() {
    lastProfileWasHighRisk = !lastProfileWasHighRisk;
    const data = lastProfileWasHighRisk
        ? generateHighRiskExample()
        : generateLowRiskExample();
    updateButtonLabelAndStyle();
    setFormValues(data);
}

function formatBoolean(value) {
    return Number(value) === 1 ? "Sim" : "Não";
}

function getRiskLevel(probability) {
    if (probability < 30) return "Baixo risco";
    if (probability < 70) return "Risco moderado";
    return "Alto risco";
}

function getRiskColor(probability) {
    if (probability < 30) return "#198754";
    if (probability < 70) return "#ffc107";
    return "#dc3545";
}

function getRiskAlertClass(probability) {
    if (probability < 30) return "alert-success";
    if (probability < 70) return "alert-warning";
    return "alert-danger";
}

function getRiskDescription(probability) {
    if (probability < 30) {
        return "O modelo classificou este caso como de baixo risco em comparação aos padrões observados no treinamento.";
    }
    if (probability < 70) {
        return "O modelo identificou um risco intermediário. Esse resultado sugere atenção clínica e avaliação mais cuidadosa dos indicadores.";
    }
    return "O modelo classificou este caso como de alto risco, indicando maior criticidade entre os padrões aprendidos.";
}

function renderResult(payload, data) {
    const probability = Number(Number((data.probability * 100) ?? 0).toFixed(2));
    const riskLevel = getRiskLevel(probability);
    const riskColor = getRiskColor(probability);
    const alertClass = getRiskAlertClass(probability);
    const isHighRisk = Number(data.prediction) === 1;

    emptyState.classList.add("d-none");
    loadingState.classList.add("d-none");
    resultContainer.classList.remove("d-none");

    resultBadge.className = `badge fs-6 ${
        probability < 30
            ? "text-bg-success"
            : probability < 70
                ? "text-bg-warning"
                : "text-bg-danger"
    }`;

    resultBadge.textContent = isHighRisk ? "Predição concluída" : "Predição concluída";

    resultScore.textContent = `${probability}%`;
    resultScore.style.color = riskColor;

    resultLabel.textContent = riskLevel;
    resultProbability.textContent = `${probability}%`;

    riskBarFill.style.width = `${Math.max(0, Math.min(probability, 100))}%`;
    riskBarFill.style.backgroundColor = riskColor;

    resultAlert.className = `alert ${alertClass} mb-4`;
    resultAlert.textContent = getRiskDescription(probability);

    document.getElementById("summaryAge").textContent = payload.age;
    document.getElementById("summaryDiabetes").textContent = formatBoolean(payload.diabetes);
    document.getElementById("summaryHbp").textContent = formatBoolean(payload.high_blood_pressure);
    document.getElementById("summarySmoking").textContent = formatBoolean(payload.smoking);
    document.getElementById("summaryEjection").textContent = payload.ejection_fraction;
    document.getElementById("summaryCreatinine").textContent = payload.serum_creatinine;
    renderizarInfo(payload);
}

function renderizarInfo(payload) {
    const insights = generateInsights(payload);
    const insightsList = document.getElementById("insightsList");
    insightsList.innerHTML = "";
    if (insights.length === 0) {
        insightsList.innerHTML = "<li>Nenhum fator crítico identificado.</li>";
        return;
    }
    insights.forEach((item, index) => {
        insightsList.innerHTML += `
      <li>
        <span 
          data-bs-toggle="tooltip" 
          title="Fonte científica"
          style="cursor: help;"
        >
          ${item.text}
        </span>
        <a href="${item.link}" target="_blank" class="ms-1 small">
          🔗
        </a>
      </li>
    `;
    });
}

function generateInsights(payload) {
    const insights = [];
    const msgInformativas = [];

    if (payload.ejection_fraction < 30) {
        insights.push({
            text: "Fração de ejeção baixa indica comprometimento cardíaco.",
            link: "https://www.heart.org/en/health-topics/heart-failure/diagnosing-heart-failure/ejection-fraction-heart-failure-measurement"
        });
    }

    if (payload.serum_creatinine > 1.5) {
        insights.push({
            text: "Creatinina elevada pode indicar disfunção renal, sobrecarregam o coração e promovem inflamação vascular e aumento as chances de infarto.",
            link: "https://www.ncbi.nlm.nih.gov/books/NBK507821/"
        });
    }

    if (payload.serum_sodium < 135) {
        insights.push({
            text: "Sódio baixo está associado a pior prognóstico.",
            link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4470551/"
        });
    }

    if (payload.age > 65) {
        insights.push({
            text: "Idade avançada aumenta o risco cardiovascular.",
            link: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)"
        });
    }

    if (payload.time < 50) {
        insights.push("Tempo de acompanhamento curto pode indicar evolução mais crítica.");
    }

    return insights;
}

function clearForm() {
    form.reset();
    clearMessage();

    emptyState.classList.remove("d-none");
    loadingState.classList.add("d-none");
    resultContainer.classList.add("d-none");
    document.getElementById("insightsList").innerHTML = "";

}

function submitPrediction($e) {
    $e.preventDefault();
    clearMessage();
    if (!form.reportValidity()) {
        form.reportValidity();
        return;
    }
    const payload = getPayload();
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processando...";

        emptyState.classList.add("d-none");
        resultContainer.classList.add("d-none");
        loadingState.classList.remove("d-none");

        sendData(payload)
            .then(data => {
                renderResult(payload, data);
            })
            .catch(error => {
                console.error("Erro ao enviar dados:", error);
                showMessage("danger", "Ocorreu um erro ao enviar os dados. Por favor, tente novamente.");
            });
        showMessage("success", "Dados enviados com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        showMessage("danger", "Ocorreu um erro ao enviar os dados. Por favor, tente novamente.");
        loadingState.classList.add("d-none");
        emptyState.classList.remove("d-none");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar";
    }
}
clearForm();
form.addEventListener("submit", submitPrediction);
fillExampleBtn.addEventListener("click", fillExample);
clearFormBtn.addEventListener("click", clearForm);
updateButtonLabelAndStyle();


