package com.chaiorcode.mycode.Controller;


import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.FacultyProfileDTO;
import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Service.AuthService;
import com.chaiorcode.mycode.Service.FacultyService;
import com.chaiorcode.mycode.Service.RetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
public class FacultyController {


       private  final AuthService authService;
    // NOTE:
    // Abhi is controller me endpoints implement nahi kiye gaye.
    // SecurityConfig me /faculty/** route ko ADMIN + FACULTY roles ke liye allowed rakha hai,
    // so future me jo bhi APIs yaha add hongi wo JWT + role checks se secure rahengi.
    private final FacultyService facultyService;

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

    @GetMapping("/view-profile")
    public ResponseEntity<FacultyProfileDTO> viewProfile(Authentication authentication) {
        return ResponseEntity.ok(facultyService.viewProfile(authentication.getName()));
    }

    @PutMapping("/faculty-update")
    public ResponseEntity<Faculty> updatefaculty(@RequestBody FacultyRequestDTO facultyDTO, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.OK).body(facultyService.updatefaculty(email , facultyDTO));
    }

    @PutMapping("/faculty-change-password")
    public ResponseEntity<String> updateFacultypassword(@RequestBody CreateUserDto createUserDto) {


        return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
    }
}
