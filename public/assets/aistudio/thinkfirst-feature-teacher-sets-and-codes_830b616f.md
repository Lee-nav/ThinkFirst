# ThinkFirst Feature Brief: Teacher Question Sets and Student Access Codes

This feature must be implemented. Give this file to the AI builder together with thinkfirst-product-brief.md. This file extends that brief. Where the two files disagree, this file wins for the topics it covers. Focus detection rules stay as written in section 10 of the main brief.

## 1. Purpose

Teachers need a way to give students a question, set a time limit, and know when each student really answered. Today a teacher cannot tell if a student answered on time or hours later. A teacher also cannot tell if the student left the page to get help.

This feature adds two sides:
- The teacher creates question sets and shares a code
- The student enters the code, identifies themselves, answers, and gets a time record

The goal is transparency. Everyone sees the same times. Nobody has to guess.

## 2. Roles

Teacher (owner of the question):
- Has an account and signs in
- Creates and manages question sets
- Gets notified when a student is flagged for possible outside help
- Reviews results

Student (respondent):
- Needs no account
- Enters a code
- Gives name, section, time, and date
- Answers and submits

## 3. Teacher side

### 3.1 Question sets

A teacher can create their own sets. Each set has one type:
- Report
- Reflection
- Question

Fields for every set:
- Title
- Type
- One or more prompts. Report and Reflection usually have one. Question can have several
- Instructions for the student (optional)
- Time limit in minutes (optional)
- Open date and time, and close date and time (optional)
- Sections allowed (optional list, for example 11-A, 11-B). If empty, students type their own section
- Focus monitoring switch, on by default (see section 6)
- What happens when time is up: mark as Over time (default) or auto-submit what is written
- Coach switch. On: the ThinkFirst coach flow runs. Off: students only see the prompt and a text box

How types behave:
- Report and Reflection use the full ThinkFirst flow: Outline, Coach, Draft, Review, Summary
- Question shows each prompt with its own answer box. The coach only asks one follow-up question per prompt when the coach switch is on

The teacher can save a set as a draft, publish it, duplicate it, edit it before anyone starts, close it, and reopen it. After students have started, edits to prompts and time limit are blocked. The teacher may close and duplicate instead.

### 3.2 Access code

- Publishing a set creates a code
- Six characters, letters and numbers, not case sensitive
- Leave out characters that look alike: 0, O, 1, I, L
- Unique across the whole system
- Teacher can copy the code, show it as a QR code, or copy a link with the code filled in
- Teacher can regenerate the code. The old code stops working for new students. Students already answering are not kicked out
- Closing the set makes the code say the set is closed

### 3.3 Teacher dashboard

List of the teacher's sets with title, type, code, status (Draft, Open, Closed), and number of submissions.

Inside a set, a results table:

| Column | Meaning |
| --- | --- |
| Name | Full name the student entered |
| Section | Section the student entered |
| Declared start | Date and time the student typed |
| Recorded start | Time the server saw the student start |
| Finished | Time the server saw the submit |
| Duration | Finished minus recorded start |
| Status | Not started, In progress, Submitted, Over time |
| Words written | Percent of words written by the student, from section 9 of the main brief |
| Focus | Flag chip: Clear, Notice, or Flagged |

Rules for the table:
- Show a Time mismatch note when declared start and recorded start differ by more than 10 minutes. The teacher can change this number
- Sort by any column and filter by section
- Tap a row to open the student's result, answers, and Focus timeline
- Export the table as CSV, including times in the teacher's time zone

### 3.4 Flag notifications

When a student becomes Flagged for possible outside help, the teacher is notified. The notice says:
- Student full name and section
- Set title
- How many times the student left the app
- Total time the student was away from the app
- Whether text was added or pasted after returning
- Time of the latest leave

Two numbers matter most and must always appear together:
- Times left: the number of leaves
- Time away: the total seconds away from the app, shown as minutes and seconds

Delivery:
- In-app notice with a badge on the Teacher tab
- Web push notification if the teacher allowed it
- Optional email digest

The notice never includes the student's answer text. Send at most one push per student per set every 10 minutes. Later events update the same notice. The detection rules, thresholds, and wording come from section 10 of the main brief. Use the words possible outside help. Never say cheating is confirmed.

The teacher opens the Focus timeline to see each leave with time and length. The teacher marks it Reviewed OK or Concern. A flag never changes a grade by itself.

## 4. Student side

### 4.1 Flow

Home, then Enter code, then Assignment notice, then Your details, then Answer, then Submit, then Receipt.

### 4.2 Enter code

- Home shows a clear button: Enter a code
- Opening a link with a code fills the field and goes straight to the next step
- One field, large, uppercase display, auto-focus
- Accept lowercase and spaces. Trim and convert
- Wrong or closed code: show a short message, for example This code does not work. Check it with your teacher. Do not say whether the code ever existed
- Outside the open window: show when it opens or closed
- Limit wrong tries to 5 per minute per device, then ask the student to wait

### 4.3 Assignment notice

Shows before anything is recorded:
- Set title, type, and teacher name
- Time limit, if any
- Plain statement that leaving the page is recorded when focus monitoring is on, as in section 10 of the main brief
- Button: Continue

### 4.4 Your details

The student fills in:
- Full name (first and last, required)
- Section (required. A dropdown if the teacher listed sections, otherwise a text field)
- Time (hour and minute with AM or PM, required)
- Date (date picker, required)

Rules:
- Time uses the 12-hour clock with an AM and PM toggle
- Accept messy input. 2:05pm, 2:05 PM, and 02:05 p.m. all work
- Do not allow a date more than one day in the future
- Short helper text under the time and date: Enter the exact time you are starting. Your teacher sees this and the time recorded by the system
- Do not prefill the time and date. The student types them
- A mismatch with the system time never blocks the student. It only shows to the teacher

Primary button: Start. When the student taps Start:
- The system saves the recorded start time. The time limit counts from here
- The countdown appears in the top bar, like the timer in the main brief
- Focus monitoring begins

Same name and section already has an active session for this set:
- Show a notice: This name already started. Ask your teacher to reopen it
- The teacher can reopen or allow a retake from the dashboard

### 4.5 Answering

- Report and Reflection follow the full ThinkFirst flow
- Question shows the prompts in order
- Autosave on every change, on the device and on the server
- If the connection drops, keep working. Save locally and send later
- When the time limit ends, follow the teacher's setting. Over time is marked automatically

### 4.6 Submit and finish time

- Primary button: Submit
- On submit, the system saves the finish time automatically. The student cannot type or edit it
- Save the server time as the main record. Also save the device time. If the device was offline, mark the record Late sync
- Submit is final unless the teacher reopens it

### 4.7 Receipt

After submit show a receipt the student can screenshot:
- Name and section
- Set title and code
- Start time and finish time
- Duration, and whether it was within the limit
- Focus summary: times left and total time away
- A message if a flag was sent to the teacher

## 5. Data

Question set:
- id, teacher id, title, type, prompts, instructions
- time limit, open at, close at, sections allowed
- focus monitoring on or off, time-up rule, coach on or off
- status, code, created at

Student session:
- id, set id, full name, section
- declared date and time, as typed, plus the device time zone
- recorded start at (server), finished at (server), device finish time
- duration, over time flag, late sync flag, time mismatch flag
- answers, outline, chat, draft, words written, suggestion words, pasted words
- status

Focus data:
- Events, status, and review state exactly as in section 11 of the main brief
- Two summary numbers per session: times left, and total seconds away

Rules:
- Store all times in UTC. Show times in the teacher's time zone
- Teachers can only read sessions of their own sets
- Students can only read their own receipt

## 6. Focus monitoring in this feature

- Monitoring runs only when the set has the switch on
- The teacher sees times left and total time away for every student in the results table and in each notification
- Detection, thresholds, student banners, and limits stay as written in section 10 of the main brief

## 7. Privacy and safety

- Collect the minimum: name, section, times, answers, focus events
- Students may be minors. Follow local data privacy law. In the Philippines this is the Data Privacy Act of 2012
- Tell the student why their name, section, and time are collected: so the teacher can confirm when they answered
- Teachers see only their own classes
- Codes are not guessable. Use rate limits and log failed attempts without storing guesses
- Delete sessions and focus events after the retention period the school sets. The default is 180 days after the set closes
- Do not use student answers to train any model

## 8. Platforms

Same as the main brief. One responsive website that installs as an app. It must work on iOS Safari, Android Chrome, and Mac and Windows browsers. Students often open the link from a chat app, so the code link must work from in-app browsers and show a hint to open in the main browser when focus monitoring needs it.

Teacher dashboard works on phones and uses a wide table layout on computers.

## 9. Out of scope for this feature

- Student accounts and passwords
- Grading and scores
- Plagiarism checking
- Live proctoring or camera
- Group answers

## 10. Acceptance checklist

- A teacher creates one Report, one Reflection, and one Question set, and each gets a working code
- The code works with lowercase letters and spaces
- A wrong code, a closed set, and a set outside its open window each show the right message
- Five wrong codes in a minute pause the field
- A student cannot start without full name, section, time with AM or PM, and date
- The inputs 2:05pm and 02:05 PM are both accepted
- Declared start and recorded start both appear in the teacher table, and a gap over 10 minutes shows Time mismatch
- Pressing Submit saves the finish time without the student typing it
- The receipt shows start, finish, duration, and focus summary
- A student who finishes after the limit is marked Over time
- Offline submissions arrive later and are marked Late sync
- A second person using the same name and section is stopped with a notice
- Leaving the page enough times flags the student and the teacher gets a notice with times left and total time away within 10 seconds
- The teacher notice contains no answer text
- Regenerating a code stops new entries and does not remove active students
- CSV export contains every column in section 3.3
- Everything works on iPhone, Android, Mac, and Windows, and is usable by keyboard only
