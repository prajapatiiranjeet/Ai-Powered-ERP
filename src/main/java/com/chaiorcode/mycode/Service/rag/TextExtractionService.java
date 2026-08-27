package com.chaiorcode.mycode.Service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TextExtractionService {

    private static final Logger log = LoggerFactory.getLogger(TextExtractionService.class);

    public List<Document> extractTextDocuments(MultipartFile file) {
        List<Document> textDocs = new ArrayList<>();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";

        try {
            Resource resource = new InputStreamResource(file.getInputStream());
            List<Document> rawDocs;

            if (filename.toLowerCase().endsWith(".pdf")) {
                PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
                rawDocs = pdfReader.read();
            } else {
                TikaDocumentReader tikaReader = new TikaDocumentReader(resource);
                rawDocs = tikaReader.read();
            }

            for (int i = 0; i < rawDocs.size(); i++) {
                Document doc = rawDocs.get(i);
                Map<String, Object> metadata = new HashMap<>(doc.getMetadata());
                metadata.entrySet().removeIf(entry -> entry.getValue() == null);
                
                metadata.put("source", filename);
                metadata.put("type", "text");
                if (!metadata.containsKey("page")) {
                    metadata.put("page", i + 1);
                }

                textDocs.add(new Document(doc.getText(), metadata));
            }
            log.info("Extracted {} text documents from file: {}", textDocs.size(), filename);
        } catch (Exception e) {
            log.error("Error extracting text documents from {}: {}", filename, e.getMessage());
        }

        return textDocs;
    }
}
