package com.chaiorcode.mycode.Service.rag;

import com.chaiorcode.mycode.DTO.TableData;
import com.chaiorcode.mycode.Service.ChunkingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class PdfIngestionService {

    private static final Logger log = LoggerFactory.getLogger(PdfIngestionService.class);

    private final TextExtractionService textExtractionService;
    private final TableExtractionService tableExtractionService;
    private final TableChunker tableChunker;
    private final ChunkingService chunkingService;
    private final VectorStore vectorStore;

    public PdfIngestionService(
            TextExtractionService textExtractionService,
            TableExtractionService tableExtractionService,
            TableChunker tableChunker,
            ChunkingService chunkingService,
            VectorStore vectorStore) {
        this.textExtractionService = textExtractionService;
        this.tableExtractionService = tableExtractionService;
        this.tableChunker = tableChunker;
        this.chunkingService = chunkingService;
        this.vectorStore = vectorStore;
    }

    /**
     * Ingests a PDF file into VectorStore processing both normal text and tabular structures.
     */
    public String ingestPdf(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        log.info("Starting complete PDF ingestion for: {}", filename);

        List<Document> allChunksToStore = new ArrayList<>();

        // 1. Text Pipeline: Extract and chunk normal text
        List<Document> rawTextDocs = textExtractionService.extractTextDocuments(file);
        if (!rawTextDocs.isEmpty()) {
            List<Document> textChunks = chunkingService.split(rawTextDocs);
            // Ensure type: text metadata is preserved
            textChunks.forEach(chunk -> chunk.getMetadata().putIfAbsent("type", "text"));
            allChunksToStore.addAll(textChunks);
            log.info("Produced {} text chunks for embedding.", textChunks.size());
        }

        // 2. Table Pipeline: Extract tables with Unstructured and chunk with header repetition
        List<TableData> extractedTables = tableExtractionService.extractTables(file);
        for (TableData table : extractedTables) {
            List<Document> tableChunks = tableChunker.chunkTable(table);
            allChunksToStore.addAll(tableChunks);
            log.info("Produced {} table chunks for table: {}", tableChunks.size(), table.getTableId());
        }

        // 3. Store in Vector Database (PGVector)
        if (!allChunksToStore.isEmpty()) {
            vectorStore.add(allChunksToStore);
            log.info("Successfully indexed {} total chunks (text + table) into VectorStore for file: {}", allChunksToStore.size(), filename);
            return "Ingested " + filename + " successfully. Total Chunks Indexed: " + allChunksToStore.size()
                    + " (Text: " + rawTextDocs.size() + ", Tables: " + extractedTables.size() + ")";
        } else {
            log.warn("No content or tables extracted from file: {}", filename);
            return "Ingestion completed, but 0 chunks were stored.";
        }
    }
}
