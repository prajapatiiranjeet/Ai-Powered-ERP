package com.chaiorcode.mycode.Service.rag;

import com.chaiorcode.mycode.DTO.TableData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class TableExtractionService {

    private static final Logger log = LoggerFactory.getLogger(TableExtractionService.class);

    @Value("${unstructured.api.url:http://localhost:8000/general/v1/process}")
    private String unstructuredApiUrl;

    @Value("${unstructured.api.strategy:hi_res}")
    private String extractionStrategy;

    @Value("${unstructured.enabled:true}")
    private boolean unstructuredEnabled;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TableExtractionService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public TableExtractionService(String unstructuredApiUrl, String extractionStrategy, boolean unstructuredEnabled) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.unstructuredApiUrl = unstructuredApiUrl;
        this.extractionStrategy = extractionStrategy;
        this.unstructuredEnabled = unstructuredEnabled;
    }

    /**
     * Extracts tables from PDF using Unstructured Service
     */
    public List<TableData> extractTables(MultipartFile file) {
        List<TableData> extractedTables = new ArrayList<>();
        if (!unstructuredEnabled) {
            log.info("Unstructured table extraction is disabled in configuration.");
            return extractedTables;
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        log.info("Starting Unstructured table extraction for file: {} using strategy: {}", filename, extractionStrategy);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource contentsAsResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("files", contentsAsResource);
            body.add("strategy", extractionStrategy);
            body.add("pdf_infer_table_structure", "true");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    unstructuredApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                int tableCount = 0;

                if (rootNode.isArray()) {
                    for (JsonNode element : rootNode) {
                        String type = element.path("type").asText("");
                        if ("Table".equalsIgnoreCase(type)) {
                            tableCount++;
                            String tableId = "table_" + tableCount;
                            int pageNumber = element.path("metadata").path("page_number").asInt(1);
                            String text = element.path("text").asText("");
                            String htmlText = element.path("metadata").path("text_as_html").asText("");

                            TableData tableData = parseTableElement(filename, tableId, pageNumber, text, htmlText);
                            if (tableData != null && (!tableData.getHeaders().isEmpty() || !tableData.getRows().isEmpty())) {
                                extractedTables.add(tableData);
                            }
                        }
                    }
                }
                log.info("Extracted {} tables from PDF: {}", extractedTables.size(), filename);
            }
        } catch (Exception e) {
            log.warn("Unstructured service unavailable or extraction failed for {}: {}. Falling back to standard pipeline.", filename, e.getMessage());
        }

        return extractedTables;
    }

    /**
     * Parses raw table text/HTML from Unstructured into structured TableData
     */
    public TableData parseTableElement(String filename, String tableId, int pageNumber, String rawText, String htmlText) {
        List<String> headers = new ArrayList<>();
        List<List<String>> rows = new ArrayList<>();
        String tableName = "Table " + tableId + " (Page " + pageNumber + ")";

        if (htmlText != null && !htmlText.isBlank()) {
            // Parse HTML table structure if present
            try {
                String cleanHtml = htmlText.replaceAll("(?i)<script.*?>.*?</script>", "");
                String[] trs = cleanHtml.split("(?i)<tr.*?>");
                for (String tr : trs) {
                    if (tr.contains("</td>") || tr.contains("</th>")) {
                        List<String> rowCells = new ArrayList<>();
                        String[] cells = tr.split("(?i)<t[dh].*?>");
                        for (String cell : cells) {
                            String cleanCell = cell.replaceAll("(?i)</t[dh]>.*", "").replaceAll("<.*?>", "").trim();
                            if (!cleanCell.isEmpty() || !cell.isEmpty()) {
                                rowCells.add(cleanCell);
                            }
                        }
                        if (!rowCells.isEmpty()) {
                            if (headers.isEmpty() && tr.toLowerCase().contains("<th")) {
                                headers.addAll(rowCells);
                            } else {
                                rows.add(rowCells);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("HTML parsing fallback to raw text line parsing: {}", e.getMessage());
            }
        }

        // Fallback to text parsing if HTML parse produced no headers/rows
        if (headers.isEmpty() && rows.isEmpty() && rawText != null && !rawText.isBlank()) {
            String[] lines = rawText.split("\r?\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                String[] parts = line.split("\\s{2,}|\\||,");
                List<String> cells = new ArrayList<>();
                for (String p : parts) {
                    if (!p.trim().isEmpty()) cells.add(p.trim());
                }

                if (!cells.isEmpty()) {
                    if (i == 0) {
                        headers.addAll(cells);
                    } else {
                        rows.add(cells);
                    }
                }
            }
        }

        // If no explicit header row was identified, generate generic headers
        if (headers.isEmpty() && !rows.isEmpty()) {
            int maxCols = rows.stream().mapToInt(List::size).max().orElse(1);
            for (int col = 1; col <= maxCols; col++) {
                headers.add("Column " + col);
            }
        }

        return TableData.builder()
                .tableId(tableId)
                .tableName(tableName)
                .pageNumber(pageNumber)
                .sourceFilename(filename)
                .headers(headers)
                .rows(rows)
                .build();
    }
}
