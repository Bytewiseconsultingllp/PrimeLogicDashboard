# Database Quick Reference Guide

A quick lookup guide for all database tables and their primary use cases.

---

## 📋 Quick Table Index

### 👥 User & Authentication (3 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `User` | uid (string) | Main user accounts (clients, admins, moderators, freelancers) |
| `Newsletter` | id (string) | Newsletter subscriptions |
| `RateLimiterFlexible` | key (string) | Rate limiting storage |

### 💼 Project Management (3 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `Project` | id (int) | Main project table with status tracking |
| `Milestone` | id (int) | Project milestones and progress tracking |
| `ProjectBuilder` | id (string) | Project builder/planner tool |

### 📝 Business Requests (6 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `ProjectRequest` | id (string) | Complete project request with pricing |
| `Service` | id (string) | Services selected in project request |
| `Industry` | id (string) | Industries targeted in project request |
| `Technology` | id (string) | Technologies requested |
| `Feature` | id (string) | Features requested |
| `Visitors` | id (string) | Website visitor tracking |

### 💬 Communication (4 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `ContactUs` | id (int) | Contact form submissions |
| `GetQuote` | id (int) | Quote requests |
| `ConsultationBooking` | id (int) | Consultation booking requests |
| `HireUs` | id (int) | Direct hire requests with documents |

### 👨‍💻 Freelancer System (14 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `FreeLancersRequest` | id (int) | Initial freelancer join requests |
| `NichesForFreelancers` | id (int) | Available specialization niches |
| `Profile` | id (string) | Main freelancer profile hub |
| `WhoYouAre` | id (string) | Personal information |
| `CoreRole` | id (string) | Primary domain/role |
| `EliteSkillCards` | id (string) | Elite skills selection |
| `ToolstackProficiency` | id (string) | Tools and technologies |
| `DomainExperience` | id (string) | Domain experience |
| `IndustryExperience` | id (string) | Industry experience |
| `AvailabilityWorkflow` | id (string) | Availability and workflow |
| `SoftSkills` | id (string) | Soft skills and communication |
| `Certifications` | id (string) | Certifications |
| `ProjectQuoting` | id (string) | Pricing information |
| `LegalAgreements` | id (string) | Legal agreements |

### 🔒 Legal & Verification (2 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `IdentityVerification` | id (string) | Identity verification details |
| `WorkAuthorization` | id (string) | Work authorization status |

### 💳 Payment (1 table)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `Payment` | id (string) | Payment transactions (Stripe integration) |

### 📰 Content (2 tables)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `BlogPost` | blogId (int) | Blog posts |
| `MenuItem` | id (int) | Navigation menu items (hierarchical) |

### 🗑️ Supporting (1 table)
| Table | Primary Key | Description |
|-------|-------------|-------------|
| `CreateServicesForQuote` | id (int) | Available services for quotes |

**Total: 33 tables**

---

## 🔍 Find a Table by Use Case

### When a new client visits
1. `Visitors` - Track visitor
2. `ContactUs` - General inquiry
3. `GetQuote` - Request quote
4. `ConsultationBooking` - Book consultation
5. `HireUs` - Direct hire
6. `ProjectRequest` - Full project request

### When managing projects
1. `Project` - Main project
2. `Milestone` - Track milestones
3. `ProjectBuilder` - Plan project

### When managing freelancers
1. `FreeLancersRequest` - Initial request
2. `Profile` + 11 sub-tables - Complete profile
3. `User` (role: FREELANCER) - Active freelancer

### When processing payments
1. `Payment` - Payment transactions
2. `ProjectRequest.paymentIntentId` - Link to request

### When managing users
1. `User` - Main user table
2. `Newsletter` - Newsletter subscriptions

### When managing content
1. `BlogPost` - Blog content
2. `MenuItem` - Navigation menus

---

## 🔐 Tables by Access Level

### Public Access (No Auth Required)
- `ContactUs` - Contact form
- `GetQuote` - Quote requests
- `ConsultationBooking` - Booking requests
- `HireUs` - Hire requests
- `FreeLancersRequest` - Freelancer applications
- `ProjectRequest` - Project submissions
- `Visitors` - Visitor tracking
- `BlogPost` (public only)
- `MenuItem` (public pages)
- `CreateServicesForQuote` - Service list

### Authenticated Users
- `User` - Own profile
- `Newsletter` - Own subscription
- `Payment` - Own payments
- `Project` - Based on role

### Freelancers
- `Project` - View available, express interest
- `Milestone` - Update progress
- `Profile` - Own profile

### Moderators
- Most tables (read/update)
- Cannot permanently delete

### Admin Only
- All tables (full access)
- Permanent delete operations
- User role management
- All trash endpoints

---

## 📊 Commonly Joined Tables

### User + Projects
```sql
User.uid = Project.clientWhoPostedThisProjectForeignId
User ←→ Project (InterestedFreelancers - M2M)
User ←→ Project (SelectedFreelancers - M2M)
```

### Project + Milestones
```sql
Project.id = Milestone.projectId
```

### ProjectRequest + Related
```sql
ProjectRequest.id = Service.submissionId
ProjectRequest.id = Industry.submissionId
ProjectRequest.id = Technology.submissionId
ProjectRequest.id = Feature.submissionId
ProjectRequest.userId = User.uid
```

### User + Payments
```sql
User.uid = Payment.userId
```

### Profile + Sub-tables (11 one-to-one joins)
```sql
Profile.whoYouAreId = WhoYouAre.id
Profile.coreRoleId = CoreRole.id
... (9 more)
```

---

## 🗂️ Tables with Soft Delete

All these tables have `trashedBy` and `trashedAt` fields:

✅ User  
✅ Project  
✅ ContactUs  
✅ GetQuote  
✅ ConsultationBooking  
✅ HireUs  
✅ FreeLancersRequest  
✅ MenuItem  
✅ ProjectBuilder  
✅ Visitors  
✅ Payment  
✅ Profile  

**Total: 18 tables with soft delete**

---

## 📈 Tables with Status/State

| Table | Status Field | Possible Values |
|-------|--------------|-----------------|
| `User` | role | CLIENT, ADMIN, MODERATOR, FREELANCER |
| `User` | kpiRank | BRONZE, SILVER, GOLD, PLATINIUM, DIAMOND, CROWN, ACE, CONQUERER |
| `Project` | projectStatus | CANCELLED, PENDING, ONGOING, COMPLETED |
| `Project` | difficultyLevel | EASY, MEDIUM, HARD |
| `Project` | projectType | INHOUSE, OUTSOURCE |
| `ConsultationBooking` | status | PENDING, ACCEPTED, REJECTED |
| `Payment` | status | PENDING, SUCCEEDED, FAILED, CANCELED, REFUNDED |
| `Payment` | paymentMethod | CARD, BANK_TRANSFER, WALLET |
| `Newsletter` | subscriptionStatus | true, false |
| `BlogPost` | isPublished | true, false |
| `Milestone` | isMilestoneCompleted | true, false |
| `FreeLancersRequest` | isAccepted | true, false |
| `Profile` | isAccepted | true, false |
| `ProjectRequest` | estimateAccepted | true, false |
| `ProjectRequest` | agreementAccepted | true, false |
| `ProjectRequest` | completed | true, false |

---

## 🔢 Primary Key Types

### Integer Auto-increment
- User (uses cuid though)
- Project
- Milestone
- ContactUs
- GetQuote
- ConsultationBooking
- HireUs
- FreeLancersRequest
- NichesForFreelancers
- BlogPost
- MenuItem
- CreateServicesForQuote

### UUID (String)
- ProjectRequest
- Service
- Industry
- Technology
- Feature
- ProjectBuilder
- Visitors
- Payment
- Profile
- WhoYouAre
- CoreRole
- EliteSkillCards
- ToolstackProficiency
- DomainExperience
- IndustryExperience
- AvailabilityWorkflow
- SoftSkills
- Certifications
- ProjectQuoting
- LegalAgreements
- IdentityVerification
- WorkAuthorization

### CUID (String)
- User
- Newsletter

### String (Custom)
- RateLimiterFlexible (IP address or identifier)

---

## 📧 Tables with Email Fields

| Table | Email Field | Unique? |
|-------|-------------|---------|
| `User` | email | ✅ Yes |
| `Newsletter` | email | ✅ Yes |
| `ContactUs` | email | ❌ No |
| `GetQuote` | email | ❌ No |
| `ConsultationBooking` | email | ❌ No |
| `HireUs` | email | ❌ No |
| `FreeLancersRequest` | email | ✅ Yes |
| `WhoYouAre` | email | ✅ Yes |
| `ProjectRequest` | businessEmail | ❌ No |
| `ProjectBuilder` | clientEmail | ❌ No |
| `Payment` | clientEmail | ❌ No |
| `Visitors` | businessEmail | ✅ Yes |

---

## 🔗 External Integrations

### Stripe (Payment Table)
- `stripePaymentIntentId` - Payment intent
- `stripeSessionId` - Checkout session
- `stripeCustomerId` - Customer ID

### File Storage (HireUs Table)
- `docs` - JSON array of uploaded documents

---

## 📱 Tables with Phone Fields

- User.phone (unique)
- FreeLancersRequest.phone (unique)
- WhoYouAre.phone
- ProjectRequest.phoneNumber
- ProjectBuilder.clientPhone
- Payment.clientPhone
- Visitors.phoneNumber
- GetQuote.phone
- ConsultationBooking.phone
- HireUs.phone

---

## 🎯 Most Important Relationships

### Critical Path: Client → Project
```
Visitor → ProjectRequest → Payment → Project → Milestone
```

### Critical Path: Freelancer Onboarding
```
FreeLancersRequest → Profile (with 11 sub-tables) → User (FREELANCER)
```

### Critical Path: Project Assignment
```
Project ← User (creates)
Project ↔ User (interested)
Project ↔ User (selected)
Project → Milestone
```

---

## 🏷️ Tables by Category Size

### Large Tables (High Volume Expected)
- User
- Project
- Payment
- ContactUs
- Visitors
- BlogPost

### Medium Tables (Moderate Volume)
- ProjectRequest
- FreeLancersRequest
- GetQuote
- ConsultationBooking
- HireUs
- Milestone

### Small Tables (Low Volume)
- Profile system (11 tables)
- NichesForFreelancers
- CreateServicesForQuote
- MenuItem
- Newsletter

### System Tables (Technical)
- RateLimiterFlexible

---

## 🔍 Quick Search Guide

**Need to find user info?** → `User` table  
**Need to find project details?** → `Project` table  
**Need to find project progress?** → `Milestone` table  
**Need to find payment info?** → `Payment` table  
**Need to find freelancer profile?** → `Profile` + related tables  
**Need to find client requests?** → `ProjectRequest` or `GetQuote` or `ContactUs`  
**Need to find deleted items?** → Query tables with `trashedAt IS NOT NULL`  
**Need to find blog content?** → `BlogPost` table  
**Need to find navigation?** → `MenuItem` table  

---

## 💡 Pro Tips

1. **Always check trashedAt** when querying tables with soft delete
2. **Use indexes** - Most email, id, and date fields are indexed
3. **JSON fields** - kpi, tools, skills, etc. use JSON for flexibility
4. **Cascade deletes** - Only Milestone cascades with Project
5. **Many-to-many** - Prisma creates implicit junction tables for User↔Project relationships
6. **Role-based access** - Always check user.role before operations
7. **OTP verification** - Use otpPassword and otpPasswordExpiry in User table
8. **Token invalidation** - Increment tokenVersion to invalidate all JWTs
9. **KPI system** - Track freelancer performance with kpi, kpiHistory, kpiRank
10. **Stripe integration** - Payment table links to Stripe via paymentIntentId

---

## 📚 Related Documentation

- **Full Schema Details**: `DATABASE_SCHEMA_DOCUMENTATION.md`
- **Visual ER Diagram**: `ER_DIAGRAM.md`
- **API Endpoints**: `API_ENDPOINTS_DOCUMENTATION.md`
- **Prisma Schema**: `prisma/schema.prisma`


