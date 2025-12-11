# Registration System Flow Guide

## Overview
The event registration system supports two methods: **External Links** and **Internal Forms**.

---

## 🔴 External Link Registration (No Profile Tracking)

### When Host Creates Event:
1. Host selects **"External Link"** as registration method
2. Provides external URL (Google Forms, Typeform, etc.)
3. No internal form questions configured

### When User Views Event:
```
Event Detail Page
├── Shows: "Register Now" button with ExternalLink icon
├── Registration Info: "This event uses external registration"
└── On Click:
    ├── Opens external link in new tab
    ├── Shows alert: "Opening external registration link"
    └── ❌ NO registration tracking in user profile
```

### User Profile Impact:
- ❌ Event NOT shown in "Applied" / "Registered" tab
- User must manually complete registration on external platform
- No form responses stored

---

## 🟢 Internal Form Registration (With Profile Tracking)

### When Host Creates Event:
1. Host selects **"Our Platform"** as registration method
2. Selects from 45+ preset questions OR adds custom questions
3. Form template saved in database
   - `registration_form_questions` table

### When User Views Event:
```
Event Detail Page
├── Shows: "Fill Registration Form" button
├── Registration Info: "This event uses our built-in registration form"
└── On Click:
    ├── Fetches form questions from DB
    ├── Opens RegistrationFormModal
    ├── Shows all questions to user
    │   ├── Text fields
    │   ├── Email validators
    │   ├── Dropdowns
    │   ├── Multi-select
    │   ├── Yes/No radios
    │   └── Text areas
    └── On Submit:
        ├── Validates all required fields
        ├── Sends form responses to backend
        ├── Creates registration record
        │   └── registration_type: 'FORM'
        ├── Stores form responses
        │   └── `registration_form_responses` table
        └── ✅ Shows in user profile
```

### User Profile Impact:
- ✅ Event shown in "Applied" / "Registered" tab
- ✅ Form responses stored securely
- ✅ Host can view all responses in dashboard

---

## 📋 Question Categories Available

### 1. Basic Participant Information (9 questions)
- Full name
- Email address
- Phone number
- Institution/College
- Department/Field
- Year/Semester (dropdown)
- Role (Student/Scholar/Faculty/Professional)
- Gender (dropdown)
- District/City

### 2. Experience & Skill-Level (6 questions)
- Proficiency level (Beginner/Intermediate/Advanced)
- Prior domain experience (textarea)
- GitHub profile link
- LinkedIn profile link
- Programming languages/technologies
- Previous similar event participation

### 3. Event Logistics & Requirements (5 questions)
- Accommodation needed (yes/no)
- Food preference (Veg/Non-Veg/Vegan)
- Transportation needed (yes/no)
- Participation certificate needed (yes/no)
- Printed materials needed (yes/no)

### 4. Workshop / Hands-On Events (4 questions)
- Will bring laptop (yes/no)
- Required software installed (yes/no)
- Operating system (Windows/macOS/Linux)
- Prior tool/technology experience (yes/no)

### 5. Custom Questions (Host-defined)
- Any question type
- Any number of questions
- Full customization

---

## 🎯 Database Structure

### event_registrations Table
```sql
CREATE TABLE event_registrations (
  id VARCHAR(255) PRIMARY KEY,           -- user_id_event_id
  user_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  registration_type ENUM('EXTERNAL', 'FORM'),  -- NEW FIELD
  created_at TIMESTAMP,
  UNIQUE KEY unique_user_event_registration (user_id, event_id)
);
```

**Key Rule:**
- External link registrations: **NOT inserted** into this table
- Form-based registrations: **Inserted** with `registration_type = 'FORM'`

### registration_form_questions Table
```sql
CREATE TABLE registration_form_questions (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  question_category VARCHAR(100),
  question_key VARCHAR(255),
  question_text VARCHAR(500),
  question_type ENUM('text', 'email', 'dropdown', ...),
  options JSON,
  is_required BOOLEAN,
  display_order INT,
  is_custom BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

### registration_form_responses Table
```sql
CREATE TABLE registration_form_responses (
  id VARCHAR(255) PRIMARY KEY,
  registration_id VARCHAR(255) NOT NULL,  -- Links to event_registrations
  event_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  question_id VARCHAR(255) NOT NULL,
  answer LONGTEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES event_registrations(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### For Users

**Register with Form:**
```
POST /api/events/:id/register-with-form
Headers: x-user-id: {userId}
Body: {
  formResponses: [
    { questionId: "q1", answer: "John Doe" },
    { questionId: "q2", answer: "john@example.com" },
    ...
  ]
}
```

**Get Form Template:**
```
GET /api/events/:id/registration-form
Response: {
  questions: [RegistrationFormQuestion]
}
```

**Get Registered Events (Profile):**
```
GET /api/events/user/registered
Returns only events with registration_type = 'FORM'
```

### For Hosts

**Create/Update Form:**
```
POST /api/events/:id/registration-form
Headers: x-user-id: {hostUserId}
Body: {
  questions: [FormQuestion]
}
```

**View All Registrations:**
```
GET /api/host/events/:id/registrations
Headers: x-user-id: {hostUserId}
Response: {
  registrations: [
    {
      id, userId, eventId, registrationType,
      userName, userEmail, createdAt,
      formResponses: [{ questionId, answer }]
    }
  ]
}
```

**Export as CSV:**
- Via Host Dashboard → Registrations tab
- Generates CSV with participant data + answers

---

## 🎨 User Interface Flow

### Event Creation (Host)
```
Event Form Page
└── Registration Method Section
    ├── External Link Button ← Selected
    │   └── Shows: External URL input
    └── Our Platform Button ← Selected
        └── Shows: RegistrationFormBuilder
            ├── Preset question categories
            ├── Checklist to add questions
            ├── Custom question form
            └── Display order controls
```

### Event Viewing (User)
```
Event Detail Page
├── Event Info (title, description, date, location, etc.)
├── Registration Info Box
│   ├── External: "Opens external registration"
│   └── Form: "Answer event-specific questions"
├── Register Button
│   ├── External: Opens link in new tab
│   └── Form: Shows RegistrationFormModal
└── Registration Form Modal (if Form type)
    ├── Question 1 (with validation)
    ├── Question 2
    ├── ...
    ├── Cancel button
    └── Submit Registration button
```

### User Profile (User)
```
Profile Page
├── Applied / Registered Tab
│   ├── Shows only form-based registrations
│   ├── Event cards with "Applied" badge
│   └── Click to view event details
└── Liked Tab
    ├── Shows liked events
```

### Host Dashboard (Host)
```
Host Dashboard
└── Registrations Tab
    ├── Select event from dropdown
    ├── View registrations list
    │   ├── Participant name + email
    │   ├── Registration type badge (Form/External)
    │   ├── Registration date
    │   └── Expandable: Show form responses
    ├── Export to CSV
    └── Search by name/email
```

---

## ✅ Key Implementation Details

### Security & Validation
- ✅ Email addresses validated with regex
- ✅ URLs validated with URL constructor
- ✅ Required fields enforced client & server-side
- ✅ Authentication headers required for all operations
- ✅ User ID verification on registration
- ✅ Form responses encrypted at rest (recommended)

### Form Responses
- ✅ Multi-select answers stored as comma-separated
- ✅ Long text preserved in textarea fields
- ✅ File uploads: Not included (recommend adding later)
- ✅ Timestamps tracked for each response
- ✅ One response per question per registration

### CSV Export
- ✅ Headers: Name, Email, Date, Question 1, Question 2, ...
- ✅ Handles special characters & commas in answers
- ✅ Downloads with filename: `{event-title}-registrations.csv`
- ✅ Only available for form-based registrations

### Unregistration
- ✅ Only form-based registrations can be unregistered
- ✅ Clicking "Unregister" removes from profile
- ✅ Form responses kept for historical purposes (optional)
- ✅ Can re-register anytime

---

## 🚀 Testing Checklist

- [ ] Create event with external link → User views event → Clicks Register → Opens link, not tracked
- [ ] Create event with form → Select preset questions → Verify questions appear
- [ ] Create event with custom questions → Verify custom questions saved & displayed
- [ ] User fills form → All validations work → Submission succeeds
- [ ] User profile shows form-based registration
- [ ] User profile does NOT show external-link registrations
- [ ] Host views registrations → All form responses displayed
- [ ] Host exports to CSV → File contains all data
- [ ] User unregisters → Removed from profile
- [ ] User re-registers → Can register again

---

## 📝 Summary

| Feature | External Link | Internal Form |
|---------|--------------|---------------|
| User tracked in profile | ❌ No | ✅ Yes |
| Registration stored in DB | ❌ No | ✅ Yes |
| Form responses collected | ❌ No | ✅ Yes |
| Host can view registrations | ❌ No | ✅ Yes |
| CSV export available | ❌ No | ✅ Yes |
| Can unregister | ❌ No | ✅ Yes |
| Shows in user profile | ❌ No | ✅ Yes |
| Customizable questions | ❌ No | ✅ Yes (45+ presets + custom) |

