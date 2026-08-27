package com.chaiorcode.mycode.rag;

import com.chaiorcode.mycode.DTO.TableData;
import com.chaiorcode.mycode.Service.rag.TableChunker;
import com.chaiorcode.mycode.Service.rag.TableExtractionService;
import com.chaiorcode.mycode.Service.rag.TableToDocumentConverter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TableRagPipelineTest {

    private TableExtractionService tableExtractionService;
    private TableToDocumentConverter converter;
    private TableChunker tableChunker;

    @BeforeEach
    void setUp() {
        tableExtractionService = new TableExtractionService("http://localhost:8000/general/v1/process", "hi_res", false);
        converter = new TableToDocumentConverter();
        tableChunker = new TableChunker(converter, 3); // Max 3 rows per chunk for test
    }

    @Test
    @DisplayName("Test 1: Parsing PDF table HTML with headers and rows")
    void testParseTableElementFromHtml() {
        String htmlText = "<table><tr><th>Employee Name</th><th>Department</th><th>Salary</th></tr>" +
                "<tr><td>Rahul</td><td>Engineering</td><td>85000</td></tr>" +
                "<tr><td>Amit</td><td>Sales</td><td>72000</td></tr></table>";

        TableData tableData = tableExtractionService.parseTableElement("employees.pdf", "table_1", 5, "", htmlText);

        assertNotNull(tableData);
        assertEquals("table_1", tableData.getTableId());
        assertEquals(5, tableData.getPageNumber());
        assertEquals(3, tableData.getHeaders().size());
        assertEquals("Employee Name", tableData.getHeaders().get(0));
        assertEquals(2, tableData.getRows().size());
        assertEquals("Rahul", tableData.getRows().get(0).get(0));
    }

    @Test
    @DisplayName("Test 2: Document Converter generates Markdown + KeyValue & attached metadata")
    void testTableToDocumentConversion() {
        TableData tableData = TableData.builder()
                .tableId("table_1")
                .tableName("Salary Table")
                .pageNumber(5)
                .sourceFilename("employees.pdf")
                .headers(List.of("Employee Name", "Department", "Salary"))
                .rows(List.of(
                        List.of("Rahul", "Engineering", "85000"),
                        List.of("Amit", "Sales", "72000")
                ))
                .build();

        Document doc = converter.convertToDocument(tableData, tableData.getRows());

        assertNotNull(doc);
        assertEquals("employees.pdf", doc.getMetadata().get("source"));
        assertEquals(5, doc.getMetadata().get("page"));
        assertEquals("table", doc.getMetadata().get("type"));
        assertEquals("table_1", doc.getMetadata().get("tableId"));

        String text = doc.getText();
        assertTrue(text.contains("Table: Salary Table"));
        assertTrue(text.contains("Employee Name: Rahul"));
        assertTrue(text.contains("| Employee Name | Department | Salary |"));
    }

    @Test
    @DisplayName("Test 3: Large tables split into logical chunks repeating headers in every chunk")
    void testLargeTableChunkingWithHeaderRepetition() {
        List<List<String>> largeRows = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            largeRows.add(List.of("Emp_" + i, "Dept_" + i, String.valueOf(50000 + i * 1000)));
        }

        TableData tableData = TableData.builder()
                .tableId("table_large")
                .tableName("Large Salary Table")
                .pageNumber(3)
                .sourceFilename("large_emp.pdf")
                .headers(List.of("Employee Name", "Department", "Salary"))
                .rows(largeRows)
                .build();

        List<Document> chunks = tableChunker.chunkTable(tableData);

        // 8 rows / 3 rows per chunk = 3 chunks (3 + 3 + 2)
        assertEquals(3, chunks.size());

        for (int c = 0; c < chunks.size(); c++) {
            Document chunk = chunks.get(c);
            assertEquals("table", chunk.getMetadata().get("type"));
            assertEquals("large_emp.pdf", chunk.getMetadata().get("source"));
            assertEquals(3, chunk.getMetadata().get("page"));

            String chunkText = chunk.getText();
            // Verify table title and headers repeat in every single chunk
            assertTrue(chunkText.contains("Table: Large Salary Table"));
            assertTrue(chunkText.contains("Columns: Employee Name, Department, Salary"));
            assertTrue(chunkText.contains("| Employee Name | Department | Salary |"));
        }
    }

    @Test
    @DisplayName("Test 4: Table with missing or null cell values")
    void testTableWithMissingCells() {
        List<List<String>> rows = List.of(
                List.of("Rahul", "", "85000"),
                List.of("Amit", "Sales", "")
        );

        TableData tableData = TableData.builder()
                .tableId("table_missing")
                .tableName("Incomplete Data Table")
                .pageNumber(1)
                .sourceFilename("missing.pdf")
                .headers(List.of("Name", "Dept", "Salary"))
                .rows(rows)
                .build();

        Document doc = converter.convertToDocument(tableData, rows);
        assertNotNull(doc);
        assertTrue(doc.getText().contains("Name: Rahul"));
    }
}
