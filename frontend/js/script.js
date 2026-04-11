document.addEventListener("DOMContentLoaded", () => {
    console.log("Hello World!");
    loadChartPrincipal();
    loadTableResume();

    const timelineDaysSelect = document.getElementById("timelineDays");

    timelineDaysSelect.addEventListener("change", ($e) => {
        const days = Number($e.target.value);
        loadChartPrincipal(days);
    });
    const refreshButton = document.getElementById("refreshTableBtn");

    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            loadTableResume();
        });
    }

    function _formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR");
    }

    /*
    * {
    "id": 11,
    "age": 46,
    "anaemia": 0,
    "creatinine_phosphokinase": 55,
    "diabetes": 1,
    "ejection_fraction": 37,
    "high_blood_pressure": 1,
    "platelets": 223684,
    "serum_creatinine": 3.78,
    "serum_sodium": 127,
    "sex": 1,
    "smoking": 0,
    "time": 35,
    "prediction": 1,
    "probability": 76.88,
    "created_at": "2026-04-10T22:47:59.676425",
    "label": "alto risco"
  },
    * */
    function _renderRiskBadge(item) {
        const isHighRisk = item.prediction === 1;
        return `
            <span class="badge ${isHighRisk ? "text-bg-danger" : "text-bg-success"}">
                ${item.label}
            </span>
        `;
    }

    async function loadTableResume() {
        const data = await getPredictions();
        if (!data) return;
        const tableBody = document.getElementById("recentPatientsTableBody");
        try {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">Carregando dados...</td>
                </tr>
            `;
            if (!data.length) {
                tableBody.innerHTML = `
                    <tr>
                      <td colspan="5" class="text-center text-muted">Nenhum registro encontrado.</td>
                    </tr>
                  `;
                return;
            }
            tableBody.innerHTML = "";

            data.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>Paciente nº ${item.id}</td>
                    <td>${item.age}</td>
                    <td>${_renderRiskBadge(item)}</td>
                    <td>${item.probability != null ? item.probability + "%" : "-"}</td>
                    <td>${_formatDate(item.created_at)}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Erro ao carregar a tabela:", error);
            tableBody.innerHTML = `
                <tr>
                  <td colspan="5" class="text-center text-danger">Erro ao carregar os dados.</td>
                </tr>
              `;
        }

    }
});