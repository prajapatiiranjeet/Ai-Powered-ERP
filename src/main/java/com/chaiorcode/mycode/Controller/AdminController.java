    package com.chaiorcode.mycode.Controller;

    import com.chaiorcode.mycode.DTO.*;
    import com.chaiorcode.mycode.Entity.Student;
    import com.chaiorcode.mycode.Service.*;
    import lombok.RequiredArgsConstructor;
    import org.springframework.ai.chat.client.ChatClient;
    import org.springframework.ai.document.Document;
    import org.springframework.ai.document.DocumentReader;
    import org.springframework.ai.embedding.EmbeddingModel;
    import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
    import org.springframework.ai.reader.tika.TikaDocumentReader;
    import org.springframework.ai.vectorstore.VectorStore;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.core.io.InputStreamResource;
    import org.springframework.core.io.Resource;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;
    import org.apache.poi.xwpf.usermodel.XWPFDocument;
    import org.apache.poi.xwpf.usermodel.XWPFTable;

    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    import java.util.stream.Collectors;


    @RestController
    @RequestMapping("/admin")
    @RequiredArgsConstructor
    public class AdminController {
        private final StudentService studentService;
        private final FacultyService facultyService;
        private  final AuthService authService;
        private final DepartmentService departmentService;
        private final CourseService courseService;

        @Autowired
        public ChunkingService chunkingService;

        @Autowired
        private VectorStore vectorStore;

        @Autowired
        private EmbeddingModel embeddingModel;

        private final ChatClient chatClient;

        private final RetrievalService retrievalService;


        @PostMapping("/ask-to-sherpal")
        public ResponseEntity<String> ask(@RequestBody String question) {
            // Retrieve relevant chunks
            List<Document> contextDocs = retrievalService.search(question);

            // Build context
            String context = contextDocs.stream()
                    .map(Document::getText)
                    .collect(Collectors.joining("\n\n---\n\n"));

            // Build prompt
            String prompt = """
                    You are a document QA assistant.
                    
                    Rules:
                    - Answer ONLY from the provided context.
                    - Do not explain, elaborate, or add extra information if not asked.
                    - Do not infer or guess.
                    - If the answer is not present in the context, reply exactly:
                    "This information is not in the uploaded document."
                    - Do not use any external knowledge.
                    
                    Context:
                    %s
                    
                    Question:
                    %s
                    
                    Answer:
                    """.formatted(context, question);

            String answer = chatClient.prompt()
                    .system("""
                            You are SHERPAL AI, an intelligent, helpful campus assistant for Noida International University.
                            
                            Instructions:
                            - Answer accurately and clearly using the provided document context (both text and tables).
                            - For questions requesting tabular data or comparisons (e.g., schedules, grade sheets, fee structures, rosters), format the response as a Markdown table (| Header 1 | Header 2 |...).
                            - For numerical questions (e.g. SUM, AVG, COUNT, MIN, MAX, highest/lowest salary, total sales), perform exact calculations directly from the provided table rows in context. Do NOT hallucinate uncalculated values.
                            - If the exact answer or required table data is not present in context, state: "This information is not in the uploaded document."
                            - Use Markdown formatting for readability.
                            """)
                    .user(prompt)
                    .call()
                    .content();

            return ResponseEntity.ok(answer);
        }


        @Autowired
        private com.chaiorcode.mycode.Service.rag.PdfIngestionService pdfIngestionService;

        @PostMapping("/upload-documents")
        public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
            try {
                if (file.isEmpty()) {
                    return ResponseEntity.badRequest().body("Uploaded file is empty.");
                }

                String result = pdfIngestionService.ingestPdf(file);
                return ResponseEntity.ok(result);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Failed to ingest PDF document: " + e.getMessage());
            }
        }

        private String convertCsvToMarkdownTable(String csvContent) {
            if (csvContent == null || csvContent.isBlank()) return "";
            String[] lines = csvContent.split("\r?\n");
            if (lines.length == 0) return "";

            StringBuilder sb = new StringBuilder("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                String[] cols = line.split(",");
                sb.append("| ");
                for (int c = 0; c < cols.length; c++) {
                    sb.append(cols[c].trim().replaceAll("^\"|\"$", "")).append(c < cols.length - 1 ? " | " : " ");
                }
                sb.append("|\n");
                if (i == 0) {
                    sb.append("| ");
                    for (int c = 0; c < cols.length; c++) {
                        sb.append("---").append(c < cols.length - 1 ? " | " : " ");
                    }
                    sb.append("|\n");
                }
            }
            return sb.toString();
        }

        private String extractDocxTables(MultipartFile file, String filename) throws Exception {
            if (filename == null || !filename.toLowerCase().endsWith(".docx")) {
                return "";
            }

            StringBuilder tables = new StringBuilder();
            try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
                int tableNumber = 1;
                for (XWPFTable table : document.getTables()) {
                    tables.append("\nTable ").append(tableNumber++).append(":\n");
                    List<XWPFTableRow> rows = table.getRows();
                    for (int i = 0; i < rows.size(); i++) {
                        XWPFTableRow row = rows.get(i);
                        String rowText = row.getTableCells().stream()
                                .map(cell -> cell.getText().replaceAll("\\s+", " ").trim())
                                .collect(Collectors.joining(" | "));
                        if (!rowText.isBlank()) {
                            tables.append("| ").append(rowText).append(" |\n");
                            if (i == 0) {
                                int colCount = row.getTableCells().size();
                                tables.append("| ");
                                for (int c = 0; c < colCount; c++) {
                                    tables.append("---").append(c < colCount - 1 ? " | " : " ");
                                }
                                tables.append("|\n");
                            }
                        }
                    }
                }
            }
            return tables.toString().trim();
        }



        // NOTE:
        // Abhi yaha @RestController/@RequestMapping nahi hai, isliye runtime pe koi endpoints expose nahi hote.
        // Future me agar admin specific APIs add karni ho to is class ko RestController bana ke mappings add ki ja sakti hai.
        @PostMapping("/register-admin")
        public ResponseEntity<RegisterDTO> registeradmin(@RequestBody CreateUserDto createUserDto){
            // Faculty register endpoint: role FACULTY set hoga.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerAdmin(createUserDto));
        }


        @PostMapping("/register-faculty")
        public ResponseEntity<RegisterDTO> registerfaculty(@RequestBody CreateUserDto createUserDto){
            // Faculty register endpoint: role FACULTY set hoga.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerFaculty(createUserDto));
        }



        @PostMapping("/register-student")
        public ResponseEntity<RegisterDTO> registerstudent(@RequestBody CreateUserDto createUserDto){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerStudent(createUserDto));
        }

        @PutMapping("/student-update")
        public ResponseEntity<Student> updateStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {

            String email = authentication.getName();
            return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudent(email , studentDTO));
        }

        @PutMapping("/change-password")
        public ResponseEntity<String> updateStudentpassword(@RequestBody CreateUserDto createUserDto) {


            return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
        }


        @GetMapping("/get-all-students")
        public List<String> getallStudent(){
            return studentService.Studentgetall();
        }

        @GetMapping("/get-faculty-count")
        public long getFacultyCount(){
            return facultyService.countFaculty();
        }

        @GetMapping("/get-departments")
        public List<DepartmentOptionDTO> getDepartments(){
            return departmentService.getDepartments().stream()
                    .map(department -> new DepartmentOptionDTO(department.getId(), department.getCode(), department.getName()))
                    .collect(Collectors.toList());
        }

                @GetMapping("/get-courses")
                public List<LookupOptionDTO> getCourses(@RequestParam Long departmentId){
                    return courseService.getCourses(departmentId).stream()
                        .map(course -> new LookupOptionDTO(course.getId(), course.getName()))
                        .collect(Collectors.toList());
                }

                @GetMapping("/get-branches")
                public List<LookupOptionDTO> getBranches(@RequestParam Long courseId){
                    return courseService.getBranches(courseId).stream()
                        .map(branch -> new LookupOptionDTO(branch.getId(), branch.getName()))
                        .collect(Collectors.toList());
                }

            @GetMapping("/get-course-count")
            public long getCourseCount(){
                return courseService.countCourses();
            }

        @DeleteMapping("/student-delete")
        public ResponseEntity<String> deleteStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {
            String email = studentDTO.getEmail();
            return ResponseEntity.status(HttpStatus.OK).body(studentService.deleteStudent(email));
        }

//        @GetMapping("/get-all-faculty")
//        public List<String> getallFaculty(){
//            return facultyService.Facultygetall();
//        }



        @PostMapping("/update_department")
        public ResponseEntity<String> registerstudent(@RequestBody DepartmentDTO dto){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(departmentService.setdepartment(dto));
        }

        @PostMapping("/insert-course")
        public ResponseEntity<String> insertcourse(@RequestBody CoursDTO coursDTO){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(courseService.insertcourse(coursDTO));
        }
    }











