package com.chaiorcode.mycode.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SherpalService {

    private static final int MAX_QUESTION_LENGTH = 1000;
    private static final Set<String> NAME_QUESTIONS = Set.of(
            "what is my name", "what's my name", "what is my full name", "tell me my name",
            "tell me my full name", "who am i"
    );
    private static final Set<String> ASSISTANT_IDENTITY_QUESTIONS = Set.of(
            "what is your name", "what's your name", "who are you", "what do i call you",
            "what is your name please"
    );
    private static final Set<String> MY_INFORMATION_QUESTIONS = Set.of(
            "give me my information", "give me my info", "giveme my information", "giveme my info",
            "show me my information", "show me my info", "show my information", "show my info",
            "tell me my information", "tell me my info", "give me my details", "show me my details",
            "show my profile", "show me my profile", "my profile", "what do you know about me",
            "tell me about myself", "tell me about me"
    );
    private static final Set<String> THANK_YOU_MESSAGES = Set.of(
            "thanks", "thank you", "thanks a lot", "thank you so much", "many thanks",
            "much appreciated", "appreciate it", "thx", "ty"
    );
    private static final Set<String> GREETING_MESSAGES = Set.of(
            "hi", "hello", "hey", "hi sherpal", "hello sherpal", "hey sherpal",
            "good morning", "good afternoon", "good evening"
    );
    private static final Set<String> WELL_WISH_MESSAGES = Set.of(
            "all the best", "good luck", "best of luck"
    );
    private static final Set<String> GOODBYE_MESSAGES = Set.of(
            "bye", "goodbye", "see you", "good night"
    );
    private static final Set<String> SAFE_PROFILE_FIELDS = Set.of(
            "department", "course", "branch", "section", "designation", "specialization",
            "highest qualification", "joining date", "overall attendance"
    );

    private final RetrievalService retrievalService;
    private final ChatClient chatClient;

    public String ask(String question, String role, String profileContext, String authenticatedUserName) {
        String safeQuestion = normalizeQuestion(question);
        String normalizedQuestion = normalizeNameQuestion(safeQuestion);

        String courtesy = courtesyResponse(safeQuestion);
        if (courtesy != null) {
            return courtesy;
        }
        if (ASSISTANT_IDENTITY_QUESTIONS.contains(normalizedQuestion)) {
            return "I'm SHERPAL, your university assistant.";
        }
        if (NAME_QUESTIONS.contains(normalizedQuestion)) {
            String name = authenticatedUserName == null ? "" : authenticatedUserName.trim();
            return name.isEmpty() ? SherpalPromptTemplate.FALLBACK_RESPONSE : name;
        }
        if (MY_INFORMATION_QUESTIONS.contains(normalizedQuestion)) {
            return formatMyInformation(profileContext, role, authenticatedUserName);
        }

        String documentContext = retrievalService.search(safeQuestion).stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        return chatClient.prompt()
                .system(SherpalPromptTemplate.systemMessage())
                .user(SherpalPromptTemplate.userMessage(role, profileContext, documentContext, safeQuestion))
                .call()
                .content();
    }

    private String formatMyInformation(String profileContext, String role, String authenticatedUserName) {
        Map<String, String> fields = new LinkedHashMap<>();
        if (authenticatedUserName != null && !authenticatedUserName.isBlank()) {
            fields.put("Full name", authenticatedUserName.trim());
        }

        if (profileContext != null) {
            for (String line : profileContext.split("\\R")) {
                int separator = line.indexOf(':');
                if (separator < 1) {
                    continue;
                }
                String label = line.substring(0, separator).trim();
                String value = line.substring(separator + 1).trim();
                String normalizedLabel = label.toLowerCase(Locale.ROOT);
                if (normalizedLabel.equals("subject-wise attendance")
                        || normalizedLabel.equals("current semester subjects")) {
                    break;
                }
                if (SAFE_PROFILE_FIELDS.contains(normalizedLabel) && !value.isEmpty()) {
                    fields.putIfAbsent(label, value);
                }
            }
        }

        if (role != null && !role.isBlank()) {
            fields.put("Portal role", role.substring(0, 1).toUpperCase(Locale.ROOT) + role.substring(1).toLowerCase(Locale.ROOT));
        }
        if (fields.isEmpty()) {
            return SherpalPromptTemplate.FALLBACK_RESPONSE;
        }

        StringBuilder response = new StringBuilder("### Your information\n\n| Field | Details |\n| --- | --- |\n");
        fields.forEach((label, value) -> response.append("| ").append(markdownCell(label))
                .append(" | ").append(markdownCell(value)).append(" |\n"));
        return response.toString().trim();
    }

    private String markdownCell(String value) {
        return value.replace("|", "\\|").replaceAll("[\\r\\n]+", " ").trim();
    }

    private String courtesyResponse(String question) {
        String normalized = normalizeNameQuestion(question).replaceAll("\\s+", " ");
        if (THANK_YOU_MESSAGES.contains(normalized)) {
            return "You're welcome! Let me know if you need help with anything else.";
        }
        if (GREETING_MESSAGES.contains(normalized)) {
            if (normalized.startsWith("good ")) {
                String greeting = normalized.substring(0, 1).toUpperCase(Locale.ROOT) + normalized.substring(1);
                return greeting + "! How can I help you with university information today?";
            }
            return "Hello! How can I help you with university information today?";
        }
        if (WELL_WISH_MESSAGES.contains(normalized)) {
            return "Thank you! All the best to you too.";
        }
        if (GOODBYE_MESSAGES.contains(normalized)) {
            return normalized.equals("good night") ? "Good night! Take care." : "Goodbye! Have a good day.";
        }
        return null;
    }

    private String normalizeQuestion(String question) {
        String normalized = question == null ? "" : question.trim();
        return normalized.length() > MAX_QUESTION_LENGTH
                ? normalized.substring(0, MAX_QUESTION_LENGTH)
                : normalized;
    }

    private String normalizeNameQuestion(String question) {
        return question.toLowerCase(Locale.ROOT).replaceAll("^[\\p{Punct}\\s]+|[\\p{Punct}\\s]+$", "").trim();
    }
}
