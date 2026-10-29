# Attendance Issue Analysis

## Scope

This analysis covers the current attendance-related backend model, subject/offering lookup path, security ownership, frontend consumers, and available verification hooks. The repository currently contains an `Attendance` entity and status enum, but no complete attendance API or frontend attendance workflow.

## Actual Problem

Attendance cannot work end to end because the project has only a partial persistence model. There is no supported flow to:

- load a faculty member's subject offerings reliably;
- load the students belonging to an offering's section;
- create or update attendance for a student, offering, and date;
- read student attendance records or calculate attendance percentages;
- expose attendance data to the frontend.

The current subject/offering code also prevents the partial faculty offering flow from compiling or returning correct data.

## Evidence and Root Causes

### 1. `CourseSemesterBranchSubject` is malformed

`src/main/java/com/chaiorcode/mycode/Entity/CourseSemesterBranchSubject.java` currently:

- imports `sun.security.pkcs10.PKCS10`, which is unrelated to the application entity;
- declares the `subject` field twice;
- does not need a Java security type for the application subject relationship.

The duplicate field is a direct compilation error. The `PKCS10` import is also an invalid internal JDK dependency for this domain model.

### 2. Subject property names do not match the mapping code

`Subject` defines Lombok properties `code` and `name`. Therefore Lombok generates `getCode()` and `getName()`, not `getSubjectCode()` and `getSubjectName()`.

Both `SubjectOfferingService` and the private mapping method in `FacultyService` call:

```java
offering.getCsbs().getSubject().getSubjectCode()
offering.getCsbs().getSubject().getSubjectName()
```

Those methods do not exist. The correct mapping is to `getCode()` and `getName()` (or an explicit DTO projection if the model later changes).

### 3. The proposed repository method is not a valid solution

`SubjectOfferingRepository` currently contains:

```java
String findSubjectCodeByCsbs(CourseSemesterBranchSubject csbs);
```

This is a derived-query method on a `SubjectOffering` repository. It does not describe a valid scalar property path or a valid projection from `Subject` to `String`. It also adds an unnecessary query when the subject is already reachable through `offering.getCsbs().getSubject()`.

The repository should instead load the complete offering graph needed for mapping, using a targeted `join fetch` query. This avoids lazy-loading failures outside a transaction and avoids an N+1 lookup per offering.

### 4. Faculty offering endpoint mishandles a list

`FacultyController.getMyOfferings()` obtains `List<SubjectOffering>` but casts the entire list to one `SubjectOffering` and wraps one mapped object in `Collections.singletonList(...)`. This is incorrect and can fail at runtime. The endpoint should map every offering and return the complete list.

### 5. Attendance persistence has no constraints or repository

`Attendance` has student, subject offering, date, and status, but currently has no:

- repository;
- unique constraint preventing duplicate records for the same student/offering/date;
- validation rules for required fields;
- service or controller;
- relationship-safe query methods;
- DTO contract.

Without a uniqueness rule, repeated marking for one date can create contradictory duplicate rows and make percentage calculations ambiguous.

### 6. No attendance APIs exist

Search of `src/main/java` found no attendance controller, service, or repository. The only attendance-related Java files are:

- `Entity/Attendance.java`;
- `Enum/AttendanceStatus.java`.

The existing security configuration protects `/faculty/**` and `/students/**`, so attendance endpoints can be placed under those paths and inherit JWT role checks.

### 7. Frontend has no attendance state or API consumer

Search of `frontend/src` found no attendance service, page, component, route, hook, or state. The faculty dashboard only loads the faculty profile, and the student dashboard only loads the student profile. Therefore backend-only attendance changes would not make attendance usable from the current application UI.

### 8. Existing domain relationships provide the required ownership data

The current model already supplies the relationships needed for a first complete flow:

- `SubjectOffering.csbs -> CourseSemesterBranchSubject.subject` identifies the subject;
- `SubjectOffering.section` identifies the student cohort;
- `SubjectOffering.faculty` identifies the faculty owner;
- `Student.section` identifies students eligible for the offering;
- `Student.user` and `Faculty.user` link authenticated email identities;
- `Attendance.student` and `Attendance.subjectOffering` identify each attendance record.

The implementation should validate that a faculty member owns the offering before allowing marking, and that a student belongs to the offering section before accepting an attendance record.

## Current Behavior

 - The application cannot be verified with Maven in the current shell because `JAVA_HOME` is not configured.
 - Even after Java is configured, the current subject entity/mapping changes contain compile errors.
 - There is no attendance endpoint to call from Postman.
 - There is no frontend attendance workflow.
 - The existing `Attendance` entity can theoretically create rows through direct persistence only, but no application path does so.

## Expected Behavior

1. A faculty JWT user can retrieve only their own subject offerings.
2. Each offering response includes offering ID, subject code, subject name, and section name.
3. A faculty user can retrieve the students in one owned offering.
4. A faculty user can mark or replace attendance for a selected date using `PRESENT`, `ABSENT`, or `LEAVE`.
5. The API rejects unknown students, students from another section, offerings owned by another faculty member, invalid dates, duplicate payload entries, and invalid statuses.
6. Repeating a mark for the same student/offering/date updates the existing row rather than creating a duplicate.
7. A student can retrieve their attendance records and a percentage summary. The percentage denominator is `PRESENT + ABSENT + LEAVE`; the percentage is `PRESENT / denominator * 100`, and is `0` when there are no records.
8. The frontend exposes the faculty marking workflow and the student summary using the existing `apiRequest` token handling.

## Planned Implementation

### Backend

1. Repair `CourseSemesterBranchSubject` so it has one application `Subject` relationship and no JDK-internal import.
2. Align subject mapping with the existing `Subject.code` and `Subject.name` properties.
3. Replace the invalid derived repository method with a `join fetch` offering query and correct list mapping.
4. Add attendance DTOs for student rows, mark requests, record responses, and student summaries.
5. Add `AttendanceRepository` with an existing-record lookup and student/offering/date queries.
6. Add a database-level unique constraint on `(student_id, subject_offering_id, date)`.
7. Add an `AttendanceService` that performs ownership, section-membership, payload, upsert, and summary calculations inside transaction boundaries.
8. Add faculty endpoints for offerings, roster loading, and attendance upsert.
9. Add student endpoint for attendance summary/details.
10. Keep authorization under `/faculty/**` and `/students/**`; do not weaken security rules.

### Frontend

1. Add attendance methods to `facultyService` and `studentService`.
2. Add a focused faculty attendance panel to load offerings, load the selected section roster, choose a date/status per student, and submit the batch.
3. Add a student attendance panel to show per-subject present/absent/leave counts and percentage.
4. Keep loading, empty, error, and submit states explicit and use the existing `apiRequest` wrapper so JWT headers and 401 handling remain centralized.

## Edge Cases and Compatibility Risks

- Existing databases may contain duplicate attendance rows. The unique constraint can fail during schema update if duplicates already exist; duplicates must be cleaned before deployment in that case.
- Existing `Subject` rows use the current `code`/`name` fields, so DTO labels will remain `subjectCode`/`subjectName` without changing the database schema.
- An offering with no section or a student with no section must not be silently accepted for marking.
- Attendance dates are calendar dates, not timestamps; request parsing must use ISO `yyyy-MM-dd`.
- `LEAVE` is included in the denominator as an attended-day outcome for transparent reporting. This rule is documented and should be changed explicitly if institutional policy treats leave differently.
- The repository currently contains unrelated uncommitted changes. They will be preserved.

## Verification Plan

- Run backend compilation and tests with `JAVA_HOME` configured.
- Run focused backend tests for subject mapping, offering ownership, attendance upsert, invalid membership, duplicate payloads, and summary percentage calculation.
- Run the frontend production build.
- Review the complete faculty-to-attendance and student-to-summary request flow after edits.
- Exercise the documented endpoints with Postman if a running PostgreSQL instance and test data are available.

## Final Status

Implemented.

### What was fixed

- Removed the duplicate `Subject` field and invalid `sun.security.pkcs10.PKCS10` import from `CourseSemesterBranchSubject`.
- Replaced invalid `getSubjectCode()`/`getSubjectName()` calls with the existing `Subject.code`/`Subject.name` properties.
- Replaced the invalid `findSubjectCodeByCsbs` repository method with ownership-scoped `join fetch` offering queries.
- Fixed the faculty offering endpoint to return all offerings instead of casting a list to one offering.
- Added attendance persistence constraints and repository methods, including one record per student/offering/date.
- Added faculty roster and attendance upsert APIs:
	- `GET /faculty/my-subjects`
	- `GET /faculty/attendance/roster?offeringId={id}&date=yyyy-MM-dd`
	- `POST /faculty/attendance`
- Added student summary API:
	- `GET /students/attendance`
- Added validation for future dates, duplicate students in one request, missing students, offering ownership, and section membership.
- Added faculty and student frontend attendance panels and service methods using the existing JWT-aware API wrapper.
- Added an admin subject-assignment flow so faculty offerings are created from the UI instead of manual database edits.
- Assignment validates that the selected subject and section belong to the same course and branch.

### Request example

```json
{
	"offeringId": 12,
	"date": "2026-09-13",
	"records": [
		{ "studentId": 101, "status": "PRESENT" },
		{ "studentId": 102, "status": "ABSENT" },
		{ "studentId": 103, "status": "LEAVE" }
	]
}
```

### Files changed by this implementation

- `ATTENDANCE_ISSUE_ANALYSIS.md`
- `src/main/java/com/chaiorcode/mycode/Entity/CourseSemesterBranchSubject.java`
- `src/main/java/com/chaiorcode/mycode/Entity/Attendance.java`
- `src/main/java/com/chaiorcode/mycode/Repo/SubjectOfferingRepository.java`
- `src/main/java/com/chaiorcode/mycode/Repo/AttendanceRepository.java`
- `src/main/java/com/chaiorcode/mycode/Repo/FacultyRepo.java`
- `src/main/java/com/chaiorcode/mycode/Repo/StudentRepository.java`
- `src/main/java/com/chaiorcode/mycode/Service/SubjectOfferingService.java`
- `src/main/java/com/chaiorcode/mycode/Service/FacultyService.java`
- `src/main/java/com/chaiorcode/mycode/Service/AttendanceService.java`
- `src/main/java/com/chaiorcode/mycode/Controller/FacultyController.java`
- `src/main/java/com/chaiorcode/mycode/Controller/StudentController.java`
- Attendance DTOs under `src/main/java/com/chaiorcode/mycode/DTO/`
- `frontend/src/services/facultyService.js`
- `frontend/src/services/studentService.js`
- `frontend/src/components/faculty/FacultyAttendancePanel.jsx`
- `frontend/src/components/student/StudentAttendancePanel.jsx`
- `frontend/src/pages/faculty/FacultyDashboard.jsx`
- `frontend/src/pages/student/StudentDashboard.jsx`
- `src/main/java/com/chaiorcode/mycode/Service/SubjectAssignmentService.java`
- `src/main/java/com/chaiorcode/mycode/Repo/CourseSemesterBranchSubjectRepository.java`
- `src/main/java/com/chaiorcode/mycode/DTO/AssignSubjectRequest.java`
- `src/main/java/com/chaiorcode/mycode/DTO/SubjectAssignmentOptionDTO.java`
- `frontend/src/components/admin/SubjectAssignmentPanel.jsx`

### Checks run

- VS Code Java diagnostics: no errors in touched backend files.
- VS Code JavaScript/JSX diagnostics: no errors in touched frontend files.
- Frontend production build: passed with Vite, exit code `0`.
- Maven compile/test: not runnable in this environment because Java/JAVA_HOME is not available on PATH.

### Known limitations / remaining action

- Configure JDK 21 and `./mvnw.cmd test` from the repository root.
- If the existing database already contains duplicate attendance rows, clean those rows before Hibernate applies the new unique constraint on `(student_id, subject_offering_id, date)`.
- The frontend requires real subject offerings, sections, students, and faculty records in PostgreSQL to exercise the workflow.
