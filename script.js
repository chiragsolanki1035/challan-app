document.getElementById("takancountt").addEventListener("input", function () {
    let takaCount = parseInt(this.value); // Get the number of taka
    let takaContainer = document.getElementById("taka-container");

    // ✅ Clear previous textareas before generating new ones
    takaContainer.innerHTML = "";

    // Generate new textareas
    if (!isNaN(takaCount) && takaCount > 0) {
        for (let i = 0; i < takaCount; i++) {
            let input = document.createElement("input");
            input.type = "number"; // Ensures only numeric values
            input.classList.add("taka-entry"); // ✅ Assign correct class
            input.placeholder = `${i + 1}`;
            takaContainer.appendChild(input);
        }
    }
});

window.onload = function () {
    // Get today's date
    let today = new Date();

    // Format as DD-MM-YYYY
    let formattedDate = ("0" + today.getDate()).slice(-2) + "/" +
        ("0" + (today.getMonth() + 1)).slice(-2) + "/" +
        today.getFullYear();

    // Set the formatted date in the textarea
    let dateField = document.getElementById("date");
    dateField.value = formattedDate;
};
document.getElementById("submit-btn").addEventListener("click", generateChallan);

function generateChallan() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF("p", "mm", "a5");

    // Collect User Inputs
    let millName = document.getElementById("mill").value || "N/A";
    let challanNo = parseInt(document.getElementById("challanno").value) || 1; // ✅ Read starting challan number
    let challanDate = document.getElementById("date").value || "N/A";
    let brokerName = document.getElementById("brokerr").value || "N/A";
    let weaverName = document.getElementById("weavernamee").value || "N/A";
    let quality = document.getElementById("qualityy").value || "N/A";
    let groupSize = parseInt(document.getElementById("entryperchallan").value) || 12;

    let takaEntries = Array.from(document.querySelectorAll(".taka-entry"))
        .map(input => parseFloat(input.value) || 0)
        .filter(value => value > 0)
        .sort((a, b) => a - b); // ✅ Sorting in ascending order

    if (takaEntries.length === 0) {
        alert("Please enter valid Taka values.");
        return;
    }

    let totalSum = 0;
    let img = new Image();
    img.src = "design.png"; // ✅ Ensure this image is in the same folder

    img.onload = function () {
        let yPositions = [77, 86.3, 95.6, 104.9, 114.2, 123.5, 132.8, 142.1, 151.4, 160.7, 170, 179.3];

        for (let i = 0; i < takaEntries.length; i += groupSize) {
            if (i > 0) doc.addPage(); // ✅ Add a new page for each challan

            doc.addImage(img, "PNG", 0, 0, 148, 210); // ✅ Set background on every page

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);

            // ✅ Print Static Fields
            doc.text(millName, 36, 54.6);
            doc.text(challanNo.toString(), 120, 54.6); // ✅ Print current challan number
            doc.text(challanDate, 114.1, 61.4);
            doc.text(quality, 74, 81);
            doc.text(brokerName, 73, 117);
            doc.text(weaverName, 86, 129.8);

            let group = takaEntries.slice(i, i + groupSize);
            let groupTotal = group.reduce((acc, val) => acc + val, 0);
            totalSum += groupTotal;

            for (let j = 0; j < group.length; j++) {
                doc.text(`${group[j]}`, 30, yPositions[j]); // ✅ Print Meter Values
            }
            doc.text(groupTotal.toString(), 30, 188.6); // ✅ Print Total Meters for that page
            doc.text(groupSize.toString(), 80, 93.2);
            doc.text(groupTotal.toString(), 80, 105.2); // ✅ Print Total Meters for that page

            challanNo++; // ✅ INCREMENT CHALLAN NUMBER for next page
        }

        // ✅ Show Summary
        let totalMeterEntered = parseFloat(document.getElementById("totalmeter").value) || 0;
        let meterDifference = totalMeterEntered - totalSum;

        let summaryMessage = `📜 Challan Summary:\n`;
        summaryMessage += `📌 Start Challan No: ${parseInt(document.getElementById("challanno").value)}\n`;
        summaryMessage += `📌 End Challan No: ${challanNo - 1}\n`; // ✅ Show final challan number
        summaryMessage += `📌 Total Meter Entered: ${totalMeterEntered}\n`;
        summaryMessage += `📌 Total Meter Across All Challans: ${totalSum}\n`;
        summaryMessage += `📌 Difference: ${meterDifference}\n`;

        alert(summaryMessage); // ✅ Show summary popup

        // ✅ Generate PDF
        let pdfBlob = doc.output("blob");
        let pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, "_blank"); // ✅ Open in new tab
    };

    img.onerror = function () {
        alert("❌ Error: Image not found. Make sure 'design.png' is in the correct folder.");
    };
}
