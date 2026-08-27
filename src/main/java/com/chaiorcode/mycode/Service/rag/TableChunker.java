package com.chaiorcode.mycode.Service.rag;

import com.chaiorcode.mycode.DTO.TableData;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TableChunker {

    @Value("${unstructured.max-rows-per-chunk:10}")
    private int maxRowsPerChunk = 10;

    private final TableToDocumentConverter converter;

    public TableChunker(TableToDocumentConverter converter) {
        this.converter = converter;
    }

    public TableChunker(TableToDocumentConverter converter, int maxRowsPerChunk) {
        this.converter = converter;
        this.maxRowsPerChunk = maxRowsPerChunk;
    }

    /**
     * Splits large tables into row-group chunks while repeating headers and title context in each chunk.
     */
    public List<Document> chunkTable(TableData table) {
        List<Document> chunkDocuments = new ArrayList<>();
        List<List<String>> allRows = table.getRows();

        if (allRows == null || allRows.isEmpty()) {
            // Single document chunk if table has headers only or 0 data rows
            chunkDocuments.add(converter.convertToDocument(table, new ArrayList<>()));
            return chunkDocuments;
        }

        int totalRows = allRows.size();
        int chunkCount = 0;

        for (int i = 0; i < totalRows; i += maxRowsPerChunk) {
            chunkCount++;
            int endIndex = Math.min(i + maxRowsPerChunk, totalRows);
            List<List<String>> rowSublist = allRows.subList(i, endIndex);

            Document chunkDoc = converter.convertToDocument(table, rowSublist);
            
            // Add chunk sequence metadata
            chunkDoc.getMetadata().put("chunkIndex", chunkCount);
            chunkDoc.getMetadata().put("totalChunks", (int) Math.ceil((double) totalRows / maxRowsPerChunk));
            chunkDoc.getMetadata().put("rowCount", rowSublist.size());

            chunkDocuments.add(chunkDoc);
        }

        return chunkDocuments;
    }
}
