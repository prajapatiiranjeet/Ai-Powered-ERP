package com.chaiorcode.mycode.Service.rag;

import com.chaiorcode.mycode.DTO.TableData;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TableToDocumentConverter {

    /**
     * Converts a TableData object into a RAG/LLM-friendly text payload with complete metadata.
     */
    public String convertToRgbPayload(TableData table, List<List<String>> rowSubset) {
        StringBuilder sb = new StringBuilder();

        // 1. Table Context Header
        sb.append("Table: ").append(table.getTableName()).append("\n");
        sb.append("Source: ").append(table.getSourceFilename()).append(" (Page ").append(table.getPageNumber()).append(")\n");

        if (table.getHeaders() != null && !table.getHeaders().isEmpty()) {
            sb.append("Columns: ").append(String.join(", ", table.getHeaders())).append("\n\n");
        } else {
            sb.append("\n");
        }

        // 2. Structured Key-Value Row Representation (Preserves Column-to-Value Relationships)
        sb.append("--- Structured Row Details ---\n");
        List<String> headers = table.getHeaders();
        for (List<String> row : rowSubset) {
            StringBuilder rowSb = new StringBuilder();
            for (int colIdx = 0; colIdx < row.size(); colIdx++) {
                String headerName = (headers != null && colIdx < headers.size()) ? headers.get(colIdx) : ("Column_" + (colIdx + 1));
                String cellValue = row.get(colIdx);
                if (rowSb.length() > 0) rowSb.append(" | ");
                rowSb.append(headerName).append(": ").append(cellValue);
            }
            if (rowSb.length() > 0) {
                sb.append(rowSb).append("\n");
            }
        }

        // 3. Clean Markdown Table Format
        sb.append("\n--- Markdown Table Representation ---\n");
        if (headers != null && !headers.isEmpty()) {
            sb.append("| ").append(String.join(" | ", headers)).append(" |\n");
            sb.append("| ");
            for (int i = 0; i < headers.size(); i++) {
                sb.append("---").append(i < headers.size() - 1 ? " | " : " ");
            }
            sb.append("|\n");
        }

        for (List<String> row : rowSubset) {
            sb.append("| ").append(String.join(" | ", row)).append(" |\n");
        }

        return sb.toString();
    }

    /**
     * Converts TableData and metadata into a Spring AI Document instance.
     */
    public Document convertToDocument(TableData table, List<List<String>> rowSubset) {
        String payload = convertToRgbPayload(table, rowSubset);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("source", table.getSourceFilename());
        metadata.put("page", table.getPageNumber());
        metadata.put("type", "table");
        metadata.put("tableId", table.getTableId());

        return new Document(payload, metadata);
    }
}
