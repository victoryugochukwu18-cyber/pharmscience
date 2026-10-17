let selectedModule = "";

function openForm(module) {
    selectedModule = module;

    document.getElementById("formTitle").textContent =
        "Add Record: " + module;

    document.getElementById("recordForm").style.display =
        "block";

    document.getElementById("message").textContent = "";

    document.getElementById("recordForm").scrollIntoView({
        behavior: "smooth"
    });
}


async function viewRecords(module) {
    selectedModule = module;

    const response = await fetch("/api/records");
    const data = await response.json();

    const list = document.getElementById("recordList");

    list.innerHTML = "<h3>" + escapeHTML(module) + "</h3>";

    if (!data[module] || data[module].length === 0) {
        list.innerHTML += "<p>No records available yet.</p>";
        return;
    }

    data[module].forEach(record => {
        list.innerHTML += `
            <div class="record">
                <strong>${escapeHTML(record.title)}</strong>
                <p>${escapeHTML(record.description)}</p>
                <small>Status: ${escapeHTML(record.status)}</small>
            </div>
        `;
    });
}


function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


document.getElementById("newRecordForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        if (!selectedModule) {
            return;
        }

        const record = {
            title: document.getElementById("title").value,
            description:
                document.getElementById("description").value,
            status: document.getElementById("status").value
        };

        try {
            const response = await fetch(
                "/api/records/" +
                encodeURIComponent(selectedModule),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(record)
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(
                    result.error || "Unable to save record."
                );
            }

            document.getElementById("message").textContent =
                "Record saved successfully!";

            document.getElementById("newRecordForm").reset();

            const total = await fetch("/api/records");
            const records = await total.json();

            const count = Object.values(records)
                .reduce((sum, items) => sum + items.length, 0);

            document.getElementById("total").textContent = count;

            await viewRecords(selectedModule);

        } catch (error) {
            document.getElementById("message").textContent =
                "Error: " + error.message;
        }
    });