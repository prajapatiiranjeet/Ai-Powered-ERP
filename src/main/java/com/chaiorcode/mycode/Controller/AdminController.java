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

// Generate answer
            String answer = chatClient.prompt()
                    .system("""
                            You are a helpful and knowledgeable AI assistant. 
                            Your Name is Sherpal.
                            
                            Instructions:
                            - Answer accurately and clearly.
                            - If the user asks for a point-to-point answer, respond with concise bullet points only.
                            - If the user asks for a brief explanation, provide a short, well-structured response with headings and bullet points where appropriate.
                            - If the user asks for a detailed explanation, provide a comprehensive answer with clear sections, examples, and step-by-step explanations when helpful.
                            - Adapt the response length and style to the user's request.
                            - Avoid unnecessary repetition.
                            - Use Markdown formatting for readability.
                            - Never add information outside the provided context.
                            - If the answer is not in the context, reply only with:
                            "This information is not in the uploaded document."
                            """)
                    .user(prompt)
                    .call()
                    .content();

            return ResponseEntity.ok(answer);
        }


            @PostMapping("/upload-documents")
        public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
            try {
                // Extract content
                DocumentReader reader;
                String filename = file.getOriginalFilename();


                Resource resource = new InputStreamResource(file.getInputStream());

                if (filename != null && filename.endsWith(".pdf")) {
                    reader = new PagePdfDocumentReader(resource);
                } else if (filename != null &&
                        (filename.endsWith(".docx") || filename.endsWith(".doc"))) {
                    reader = new TikaDocumentReader(resource);
                } else {
                    return ResponseEntity.badRequest().body("Only PDF and DOCX allowed");
                }

                List<Document> documents = reader.read();
                String tableText = extractDocxTables(file, filename);

                List<Document> cleanedDocuments = documents.stream()
                    .map(doc -> {
                        Map<String, Object> metadata = new HashMap<>(doc.getMetadata());
                        metadata.entrySet().removeIf(entry -> entry.getValue() == null);
                            String content = tableText.isBlank() ? doc.getText() : doc.getText() + "\n\n" + tableText;
                            return new Document(content, metadata);
                    })
                    .toList();



//            String content = documents.stream()
//                    .map(Document::getText)
//                    .collect(Collectors.joining("\n"));

                List<Document> chunks = chunkingService.split(cleanedDocuments);
//            System.out.println("Chunks to store: " + chunks.size());
//            System.out.println("First chunk content: " + chunks.get(0).getText().substring(0, 100));

                vectorStore.add(chunks);

//            EmbeddingResponse response =
//                    embeddingModel.embedForResponse(chunks);
//            System.out.println(response);



//


                // Now you have the text. Feed it to your VectorStore.
                // vectorStore.add(documents); // Split and store as needed



                return ResponseEntity.ok("Content extracted. Length: " );

            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Failed: " + e.getMessage());
            }
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
                    table.getRows().forEach(row -> {
                        String rowText = row.getTableCells().stream()
                                .map(cell -> cell.getText().replaceAll("\\s+", " ").trim())
                                .collect(Collectors.joining(" | "));
                        if (!rowText.isBlank()) {
                            tables.append(rowText).append("\n");
                        }
                    });
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











