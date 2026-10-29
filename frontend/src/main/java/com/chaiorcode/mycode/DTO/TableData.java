package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableData {
    private String tableId;
    private String tableName;
    private int pageNumber;
    private String sourceFilename;
    @Builder.Default
    private List<String> headers = new ArrayList<>();
    @Builder.Default
    private List<List<String>> rows = new ArrayList<>();
}
