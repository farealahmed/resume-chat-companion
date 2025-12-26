/**
 * This controller is responsible for handling the HTTP endpoint for resume file uploads.
 *
 * Why it's needed:
 * - It provides a simple RESTful endpoint for the frontend to send the resume file to the server.
 * - It bridges the stateless nature of HTTP with the stateful WebSocket conversation by using the HTTP session.
 *
 * What this file is doing:
 * - The `@RestController` annotation designates this as a Spring MVC controller suitable for REST APIs.
 * - It defines a single endpoint, `/upload`, that accepts HTTP POST requests.
 *
 * How it's working:
 * - `@PostMapping("/upload")`: This maps POST requests on the `/upload` URL to the `handleFileUpload` method.
 * - `@RequestParam("file") MultipartFile file`: This annotation binds the uploaded file from the request (expected as a part of a multipart/form-data request with the key "file") to a `MultipartFile` object.
 * - `jakarta.servlet.http.HttpSession session`: Spring injects the current HTTP session into the method.
 * - `new String(file.getBytes())`: The raw bytes of the uploaded file are read and converted into a single String.
 * - `session.setAttribute("resume", content)`: The resume's string content is stored in the user's HTTP session. This is the key step that makes the resume available to the subsequent WebSocket connection from the same user.
 * - `ResponseEntity.ok(...)`: It returns a standard HTTP 200 OK response to the client to confirm a successful upload.
 *
 * What else we can do here:
 * - File Validation: We could add checks to ensure the uploaded file is of a specific type (e.g., .txt, .pdf) and size.
 * - Advanced Content Parsing: Instead of treating the file as plain text, we could integrate libraries like Apache Tika or PDFBox to parse different file formats (like .pdf or .docx) and extract their text content more reliably.
 * - Persistent Storage: For a more robust application, instead of storing the resume in the session (which is temporary), we could save it to a database or a file system and associate it with a user account.
 */
package com.resume_chat_companion.controller;

import jakarta.servlet.http.HttpSession;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class ResumeController {

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file, HttpSession session) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            session.setAttribute("resume", text);
            return ResponseEntity.ok("File uploaded and parsed successfully: " + file.getOriginalFilename());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to read or parse PDF file.");
        }
    }
}