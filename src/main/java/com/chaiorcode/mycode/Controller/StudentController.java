package com.chaiorcode.mycode.Controller;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.DTO.StudentProfileDTO;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Service.AuthService;
import com.chaiorcode.mycode.Service.CustomUserDetailsService;
import com.chaiorcode.mycode.Service.RetrievalService;
import com.chaiorcode.mycode.Service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private  final AuthService authService;
    private final RetrievalService retrievalService;
    private final ChatClient chatClient;



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
- Do not explain, elaborate, or add extra information if he/she is not asking.
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

            Instructions:
            - Answer accurately and clearly.
            - If the user asks for a point-to-point answer, respond with concise bullet points only.
            - If the user asks for a brief explanation, provide a short, well-structured response with headings and bullet points where appropriate.
            - If the user asks for a detailed explanation, provide a comprehensive answer with clear sections, examples, and step-by-step explanations when helpful.
            - Adapt the response length and style to the user's request.
            - Avoid unnecessary repetition.
            - Use Markdown formatting for readability.
            """)
                .user(prompt)
                .call()
                .content();

        return ResponseEntity.ok(answer);
    }




    @PutMapping("/update")
    public ResponseEntity<Student> updateStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudent(email , studentDTO));
    }


    @PutMapping("/student-change-password")
    public ResponseEntity<String> updateStudentstudent(@RequestBody CreateUserDto createUserDto) {


        return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
    }

    @GetMapping("/view-profile")
    public ResponseEntity<StudentProfileDTO> viewprofile(Authentication authentication){
        String email = authentication.getName();
        StudentProfileDTO dto = studentService.viewprofilebyEmail(email);
        return ResponseEntity.ok(dto);
    }
}
