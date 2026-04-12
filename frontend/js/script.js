document.addEventListener("DOMContentLoaded", () => {
    console.log("Hello World!");
    loadKPIs();
    loadChartPrincipal();
    loadTableResume();
    loadRiskDistributionChart();

    function setActiveNav() {
        const currentPage = window.location.pathname.split("/").pop();

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");

            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            }
        });
    }

    document.getElementById("refreshDashboardBtn")?.addEventListener("click", () => {
        loadKPIs();
        loadChartPrincipal();
        loadTableResume();
        loadRiskDistributionChart()
    });
    document.addEventListener("DOMContentLoaded", setActiveNav);

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