import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function exportToExcel(jsonData: unknown[], fileName: string = "data.xlsx") {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data to export.");
        return;
    }

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(jsonData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write workbook to a Blob
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Download the file
    saveAs(data, fileName);
}

export default exportToExcel;