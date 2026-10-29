    package com.chaiorcode.mycode.Controller;

    import com.chaiorcode.mycode.DTO.*;
    import com.chaiorcode.mycode.Entity.*;
    import com.chaiorcode.mycode.Repo.CourseSemesterBranchSubjectRepository;
    import com.chaiorcode.mycode.Repo.FacultyRepo;
    import com.chaiorcode.mycode.Repo.SectionRepository;
    import com.chaiorcode.mycode.Repo.SubjectOfferingRepository;
    import com.chaiorcode.mycode.Service.*;
    import lombok.RequiredArgsConstructor;
    import org.apache.poi.xwpf.usermodel.XWPFTableRow;
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
    import java.util.Locale;
    import java.util.Map;
    import java.util.stream.Collectors;
    import jakarta.validation.Valid;


    @RestController
    @RequestMapping("/admin")
    @RequiredArgsConstructor
    public class AdminController {
        private final StudentService studentService;
        private final FacultyService facultyService;
        private  final AuthService authService;
        private final DepartmentService departmentService;
        private final CourseService courseService;
        private final SubjectAssignmentService subjectAssignmentService;
        private final SubjectOfferingService subjectOfferingService;

        @Autowired
        public ChunkingService chunkingService;

        @Autowired
        private VectorStore vectorStore;
        
        private SectionRepository sectionRepository;

        @Autowired
        private EmbeddingModel embeddingModel;

        private final SherpalService sherpalService;

        @Autowired
        private CourseSemesterBranchSubjectRepository courseSemesterBranchSubjectRepository;
        @Autowired
        private FacultyRepo facultyRepo;
        @Autowired
        private SubjectOfferingRepository subjectOfferingRepository;


        @PostMapping("/assign-subject-to-faculty")
        public ResponseEntity<SubjectOfferingDTO> assignSubjectToFaculty(
            @Valid @RequestBody AssignSubjectRequest request) {
            SubjectOffering offering = subjectAssignmentService.assign(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectOfferingService.mapToDTO(offering));
        }





        @PostMapping("/ask-to-sherpal")
        public ResponseEntity<String> ask(@RequestBody String question, Authentication authentication) {
            String email = authentication.getName();
            String userName = authService.findNameByEmail(email);
            String userContext = """
                    Full Name: %s
                    Role: ADMIN
                    """.formatted(userName);
            String answer = sherpalService.ask(question, "ADMIN", userContext, userName);
            return ResponseEntity.ok(answer);
        }

        @PostMapping("/upload-documents")
        public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
            try {
                DocumentReader reader;
                String filename = file.getOriginalFilename();
                Resource resource = new InputStreamResource(file.getInputStream());
                String extension = filename == null ? "" : filename.toLowerCase(Locale.ROOT);

                if (extension.endsWith(".pdf")) {
                    reader = new PagePdfDocumentReader(resource);
                } else if (extension.endsWith(".docx") || extension.endsWith(".doc") || extension.endsWith(".txt")) {
                    reader = new TikaDocumentReader(resource);
                } else {
                    return ResponseEntity.badRequest().body("Only PDF, DOC, DOCX, and TXT files are allowed");
                }

                List<Document> documents = reader.read();
                List<Document> preparedDocuments = documents.stream()
                        .map(doc -> {
                            Map<String, Object> metadata = new HashMap<>(doc.getMetadata());
                            metadata.entrySet().removeIf(entry -> entry.getValue() == null);
                            return new Document(doc.getText(), metadata);
                        })
                        .toList();

                List<Document> chunks = chunkingService.split(preparedDocuments);
                if (chunks.isEmpty()) {
                    return ResponseEntity.badRequest().body("No readable text was found in the uploaded file");
                }
                vectorStore.add(chunks);

                return ResponseEntity.ok("Indexed " + chunks.size() + " document chunks");

            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Failed: " + e.getMessage());
            }
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
            return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudentByEmail(studentDTO.getEmail(), studentDTO));
        }

        @PutMapping("/change-password")
        public ResponseEntity<String> updateStudentpassword(@RequestBody CreateUserDto createUserDto) {


            return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
        }


        @GetMapping("/get-all-students")
        public List<String> getallStudent(){
            return studentService.Studentgetall();
        }

        @GetMapping("/get-student-records")
        public List<StudentDTO> getStudentRecords() {
            return studentService.getAdminStudentRecords();
        }

        @GetMapping("/user-options")
        public List<AdminUserOptionDTO> getUserOptions(
                @RequestParam(required = false) String role,
                @RequestParam(required = false) Long departmentId,
                @RequestParam(required = false) Long courseId,
                @RequestParam(required = false) Long branchId,
                @RequestParam(required = false) Long batchId,
                @RequestParam(required = false) Long sectionId) {
            com.chaiorcode.mycode.Enum.Role parsedRole = role == null || role.isBlank()
                    ? null : com.chaiorcode.mycode.Enum.Role.valueOf(role);
            return authService.getAdminUserOptions(parsedRole, departmentId, courseId, branchId, batchId, sectionId);
        }

        @PutMapping("/faculty-update")
        public ResponseEntity<Faculty> updateFaculty(@RequestBody AdminProfileUpdateRequest request) {
            return ResponseEntity.ok(facultyService.updateAdminFaculty(request));
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

        @GetMapping("/subject-assignment/faculty")
        public List<LookupOptionDTO> getAssignmentFaculty(
                @RequestParam(required = false) Long departmentId,
                @RequestParam(required = false) Long courseId,
                @RequestParam(required = false) Long branchId,
                @RequestParam(required = false) Long batchId) {
            return subjectAssignmentService.getFacultyOptions(departmentId, courseId, branchId, batchId);
        }

        @GetMapping("/subject-assignment/subjects")
        public List<SubjectAssignmentOptionDTO> getAssignmentSubjects(
                @RequestParam(required = false) Long courseId,
                @RequestParam(required = false) Long branchId) {
            return subjectAssignmentService.getSubjectOptions(courseId, branchId);
        }

        @GetMapping("/subject-assignment/sections")
        public List<LookupOptionDTO> getAssignmentSections(@RequestParam(required = false) Long batchId) {
            return subjectAssignmentService.getSectionOptions(batchId);
        }

        @GetMapping("/subject-assignment/batches")
        public List<LookupOptionDTO> getAssignmentBatches(
                @RequestParam(required = false) Long departmentId,
                @RequestParam(required = false) Long courseId,
                @RequestParam(required = false) Long branchId) {
            return subjectAssignmentService.getBatchOptions(departmentId, courseId, branchId);
        }

        @PostMapping("/subject-assignment")
        public ResponseEntity<SubjectOfferingDTO> assignSubject(
                @Valid @RequestBody AssignSubjectRequest request) {
            SubjectOffering offering = subjectAssignmentService.assign(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(subjectOfferingService.mapToDTO(offering));
        }

        @DeleteMapping("/student-delete")
        public ResponseEntity<String> deleteStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {
            String email = studentDTO.getEmail();
            return ResponseEntity.status(HttpStatus.OK).body(studentService.deleteStudent(studentDTO.getEmail()));
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










