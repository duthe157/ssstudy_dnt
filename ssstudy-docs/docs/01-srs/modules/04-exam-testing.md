# Exam / Testing — SRS mục tiêu

Mục tiêu: Thiết kế module thi/trắc nghiệm (Exam/Testing) hướng tới xây dựng lại từ đầu. Tài liệu trình bày các chức năng, API đề xuất, domain model, kiến trúc, UI, use cases và user stories. Legacy references đã được loại ra khỏi phần chính; tham chiếu legacy (nếu cần) nằm trong `docs/legacy-notes.md`.

## Phạm vi
- Public/practice exams listing
- Exam detail and start flow (session/submission)
- Answer submission and deterministic scoring
- Result history and explanations
- Question bank management and bulk import
- Admin reporting and exports

## Actors & Roles

| Actor | Role | Notes |
|---|---|---|
| Guest | Browse public exams | Can view public/practice exams |
| Student | Take exams, view results | Needs auth & membership for private exams |
| Teacher | Create/manage exams & questions | Scoped to owned courses/classrooms |
| Admin | Manage exam bank, reporting | Elevated permissions for export/reconciliation |

## Feature list

| Code | Feature | Actor | API proposal | Priority |
|---|---|---|---|---|
| EXM-01 | Exam listing (public/practice) | Guest/Student | `GET /api/exams` | Must |
| EXM-02 | Exam detail & start (session) | Student | `GET /api/exams/{id}`, `POST /api/exams/{id}/start` | Must |
| EXM-03 | Submit & scoring | Student | `POST /api/exams/{id}/submissions` | Must |
| EXM-04 | View result & explanation | Student | `GET /api/exams/{id}/submissions/{sid}` | Must |
| EXM-05 | Question bank CRUD & import | Admin/Teacher | `CRUD /api/admin/questions`, `POST /api/admin/questions/import` | Should |
| EXM-06 | Admin exam management & report | Admin | `CRUD /api/admin/exams`, `GET /api/admin/exams/{id}/report` | Should |

## API proposals (summary)

| API | Method | Endpoint | Purpose | Auth |
|---|---:|---|---|---:|
| API-EXM-001 | GET | `/api/exams` | List exams with filters | No/Optional |
| API-EXM-002 | GET | `/api/exams/{id}` | Exam metadata and permission to start | Optional/Yes |
| API-EXM-003 | POST | `/api/exams/{id}/start` | Create submission session | Yes |
| API-EXM-004 | POST | `/api/exams/{id}/submissions` | Submit answers and score | Yes |
| API-EXM-005 | GET | `/api/exams/{id}/submissions/{sid}` | Retrieve submission result & explanation | Yes |

## Domain model (high level)

Models: Exam, Question, Submission, ScoreHistory, QuestionBank, ExamReport.

Key constraints:
- Submissions immutable once finalized.
- Scoring rules versioned per exam.

## Architecture notes

- Scoring engine implemented as a domain service (testable, deterministic).
- Question import and report export as async jobs with job logs and retry policy.
- Authorization checks at service boundary; membership/enrollment required for private exams.

## UI requirements

Screens: exam listing, exam play (timer + question navigator), submission/result page, admin exam builder, admin reports.

## Use cases (examples)

UC-EXM-001: Student starts timed exam → verifies permissions → session created → submit → receive score.

UC-EXM-002: Admin imports question bank CSV/Excel → system validates → creates questions → report of errors.

## User stories (examples)

- As a student, I want to take practice exams and see explanations afterwards. (Must)
- As an admin, I want to import questions in bulk to build the question bank. (Should)

## Acceptance criteria / Tests

- Scoring correctness across question types (MCQ, TF, fill-in).
- Submission persistence and result retrieval.
- Permission enforcement for private exams.

## Migration & legacy notes

Keep legacy controller/service mapping in `docs/legacy-notes.md`. Do not include source-path evidence in main SRS.

