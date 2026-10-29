package com.chaiorcode.mycode.Service;

import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChunkingService {

    private final TokenTextSplitter splitter;

    public ChunkingService() {
        this.splitter = TokenTextSplitter.builder()
                .withChunkSize(500)
                .withMinChunkSizeChars(10)
                .withMinChunkLengthToEmbed(50)
                .withMaxNumChunks(10000)
                .build();
    }


    public List<Document> split(List<Document> documents) {
        return splitter.split(documents);
    }
}
