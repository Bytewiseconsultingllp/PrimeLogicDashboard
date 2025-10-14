# API Endpoints Documentation

**Base URL:** `/api/v1`

This document contains all the API endpoints available in this backend project, organized by their respective modules.

---

## Table of Contents

1. [Health](#1-health)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Blog](#3-blog)
4. [Consultation](#4-consultation)
5. [Contact Us](#5-contact-us)
6. [Freelancer](#6-freelancer)
7. [Get Quote](#7-get-quote)
8. [Hire Us](#8-hire-us)
9. [Milestone](#9-milestone)
10. [Navigation Pages](#10-navigation-pages)
11. [Newsletter](#11-newsletter)
12. [Payment](#12-payment)
13. [Project Builder](#13-project-builder)
14. [Project Request](#14-project-request)
15. [Project](#15-project)
16. [Trash](#16-trash)
17. [Visitors](#17-visitors)

---

## 1. Health

### GET `/api/v1/health`
- **Description:** Health check endpoint for development
- **Authentication:** Not required
- **Controller:** `healthController.health`

---

## 2. Authentication & User Management

**Base Route:** `/api/v1/auth`

### POST `/api/v1/auth/register`
- **Description:** Register a new user
- **Authentication:** Not required
- **Validation:** `userRegistrationSchema`
- **Controller:** `authController.registerUser`

### POST `/api/v1/auth/verifyEmail`
- **Description:** Verify user email with OTP
- **Authentication:** Not required
- **Validation:** `verifyUserSchema`
- **Controller:** `authController.verifyUser`

### POST `/api/v1/auth/sendOTP`
- **Description:** Send OTP to user email
- **Authentication:** Not required
- **Validation:** `sendOTPSchema`
- **Controller:** `authController.sendOTP`

### POST `/api/v1/auth/login`
- **Description:** User login
- **Authentication:** Not required
- **Validation:** `userLoginSchema`
- **Controller:** `authController.loginUser`

### GET `/api/v1/auth/logoutUser`
- **Description:** Logout current user
- **Authentication:** Required (Token)
- **Controller:** `authController.logOut`

### POST `/api/v1/auth/logoutUserForceFully`
- **Description:** Force logout user from all devices
- **Authentication:** Required (Token)
- **Controller:** `authController.logOutUserForecfully`

### PATCH `/api/v1/auth/updateInfo`
- **Description:** Update user information
- **Authentication:** Required (Token)
- **Validation:** `userUpdateSchema`
- **Controller:** `userController.updateInfo`

### PATCH `/api/v1/auth/updateEmail`
- **Description:** Update user email
- **Authentication:** Required (Token)
- **Validation:** `userUpdateEmailSchema`
- **Controller:** `userController.updateEmail`

### PATCH `/api/v1/auth/updatePassword`
- **Description:** Update user password
- **Authentication:** Required (Token)
- **Validation:** `userUpdatePasswordSchema`
- **Controller:** `userController.updatePassword`

### PATCH `/api/v1/auth/updateRole`
- **Description:** Update user role
- **Authentication:** Required (Token)
- **Controller:** `userController.updateRole`

### GET `/api/v1/auth/getSingleUser`
- **Description:** Get single user details
- **Authentication:** Required (Token)
- **Validation:** `getSingleUserSChema`
- **Controller:** `userController.getSingleUser`

### GET `/api/v1/auth/getAllUsers`
- **Description:** Get all users
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `userController.getAllUsers`

### GET `/api/v1/auth/searchUsers`
- **Description:** Search users
- **Authentication:** Required (Token)
- **Controller:** `userController.searchUser`

### GET `/api/v1/auth/getCurrentUser`
- **Description:** Get current logged-in user details
- **Authentication:** Required (Token)
- **Controller:** `userController.getCurrentUser`

### DELETE `/api/v1/auth/deleteUser/:uid`
- **Description:** Delete a user permanently
- **Authentication:** Required (Admin only)
- **Controller:** `userController.deleteUser`

### PATCH `/api/v1/auth/trashTheUser`
- **Description:** Move user to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `userController.moveToTrash`

### PATCH `/api/v1/auth/unTrashTheUser`
- **Description:** Restore user from trash
- **Authentication:** Required (Admin only)
- **Controller:** `userController.unTrashUser`

### POST `/api/v1/auth/forgotPasswordRequestFromUser`
- **Description:** Request password reset
- **Authentication:** Not required
- **Validation:** `forgotPasswordRequestFromUserSchema`
- **Controller:** `userController.forgotPasswordRequestFromUser`

### POST `/api/v1/auth/verifyForgotPasswordRequest`
- **Description:** Verify forgot password OTP
- **Authentication:** Not required
- **Validation:** `verifyForgotPasswordRequestSchema`
- **Controller:** `userController.verifyForgotPasswordRequest`

### PATCH `/api/v1/auth/updateNewPasswordRequest`
- **Description:** Update new password after reset
- **Authentication:** Not required
- **Validation:** `updateForgotPasswordSchema`
- **Controller:** `userController.updateNewPasswordRequest`

### POST `/api/v1/auth/refreshAcessToken`
- **Description:** Refresh access token
- **Authentication:** Not required
- **Controller:** `authController.refreshAcessToken`

### GET `/api/v1/auth/getAllClients`
- **Description:** Get all client users
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `userController.getAllClients`

---

## 3. Blog

**Base Route:** `/api/v1/blog`

### POST `/api/v1/blog/createBlog`
- **Description:** Create a new blog post
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `blogPostSchema`
- **Controller:** `blogController.createBlog`

### GET `/api/v1/blog/getSingleBlog/:blogSlug`
- **Description:** Get a single blog by slug
- **Authentication:** Not required
- **Controller:** `blogController.getSingleBlog`

### GET `/api/v1/blog/getAllPublicBlogs`
- **Description:** Get all public blogs
- **Authentication:** Not required
- **Controller:** `blogController.getAllPublicBlog`

### GET `/api/v1/blog/getAllPrivateBlogs`
- **Description:** Get all private blogs
- **Authentication:** Required (Admin only)
- **Controller:** `blogController.getAllPrivateBlogs`

### PATCH `/api/v1/blog/updateBlog/:blogSlug`
- **Description:** Update a blog by slug
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `blogPostSchema`
- **Controller:** `blogController.updateBlog`

### PATCH `/api/v1/blog/makeBlogPublicOrPrivate/:blogSlug`
- **Description:** Toggle blog visibility (public/private)
- **Authentication:** Required (Admin only)
- **Controller:** `blogController.makeBlogPublicOrPrivate`

### DELETE `/api/v1/blog/deleteBlog/:blogSlug`
- **Description:** Delete a blog by slug
- **Authentication:** Required (Admin only)
- **Controller:** `blogController.deleteBlog`

---

## 4. Consultation

**Base Route:** `/api/v1/consultation`

### POST `/api/v1/consultation/requestAConsultation`
- **Description:** Request a consultation booking
- **Authentication:** Not required
- **Validation:** `consultationBookingSchema`
- **Rate Limit:** 10 requests per 8 hours
- **Controller:** `consultationController.createConsultation`

### POST `/api/v1/consultation/updateRequestedConsultation/:id`
- **Description:** Update a consultation request
- **Authentication:** Not required
- **Validation:** `consultationBookingSchema`
- **Rate Limit:** 10 requests per 8 hours
- **Controller:** `consultationController.updateConsultation`

### GET `/api/v1/consultation/getAllRequestedConsultations`
- **Description:** Get all consultation requests
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `consultationController.getAllRequestedConsultations`

### GET `/api/v1/consultation/getSingleRequestedConsultation/:id`
- **Description:** Get single consultation request
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `consultationController.getSingleRequestedConsultation`

### DELETE `/api/v1/consultation/deleteRequestedConsultation/:id`
- **Description:** Delete a consultation request
- **Authentication:** Required (Admin only)
- **Controller:** `consultationController.deleteRequestedConsultation`

### PATCH `/api/v1/consultation/acceptRequestedConsultation/:id`
- **Description:** Accept a consultation booking
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `consultationController.acceptConsultationBooking`

### PATCH `/api/v1/consultation/rejectRequestedConsultation/:id`
- **Description:** Reject a consultation booking
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `consultationController.rejectConsultationBooking`

### PATCH `/api/v1/consultation/trashRequestedConsultation/:id`
- **Description:** Move consultation to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `consultationController.trashConsultation`

### PATCH `/api/v1/consultation/untrashRequestedConsultation/:id`
- **Description:** Restore consultation from trash
- **Authentication:** Required (Admin only)
- **Controller:** `consultationController.untrashConsultation`

---

## 5. Contact Us

**Base Route:** `/api/v1/contactUs`

### POST `/api/v1/contactUs/createMessage`
- **Description:** Create a contact message
- **Authentication:** Not required
- **Validation:** `contactUsSchema`
- **Rate Limit:** 5 requests per minute
- **Controller:** `contactUsController.createMessage`

### GET `/api/v1/contactUs/getAllMessages`
- **Description:** Get all contact messages
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `contactUsController.getAllMessages`

### GET `/api/v1/contactUs/getSingleMessage/:id`
- **Description:** Get single contact message
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `contactUsController.getSingleMessage`

### DELETE `/api/v1/contactUs/deleteMessage/:id`
- **Description:** Delete a contact message
- **Authentication:** Required (Admin only)
- **Controller:** `contactUsController.deleteMessage`

### POST `/api/v1/contactUs/sendMessageToUser/:id`
- **Description:** Send reply message to user
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `contactUsController.sendMessageToUser`

### PATCH `/api/v1/contactUs/moveMessageToTrash`
- **Description:** Move message to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `contactUsController.trashMessage`

### PATCH `/api/v1/contactUs/unTrashMessage`
- **Description:** Restore message from trash
- **Authentication:** Required (Admin only)
- **Controller:** `contactUsController.unTrashMessage`

---

## 6. Freelancer

**Base Route:** `/api/v1/freelancer`

### POST `/api/v1/freelancer/getFreeLancerJoinUsRequest`
- **Description:** Submit freelancer join request (Version 1)
- **Authentication:** Not required
- **Validation:** `freeLancerSchema`
- **Rate Limit:** 10 requests per 5 minutes
- **Controller:** `freeLancerController.getFreeLancerJoinUsRequest`

### GET `/api/v1/freelancer/getAllFreeLancerRequest`
- **Description:** Get all freelancer join requests (Version 1)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.getAllFreeLancerRequest`

### GET `/api/v1/freelancer/getSingleFreeLancerRequest/:id`
- **Description:** Get single freelancer request (Version 1)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.getSingleFreeLancerRequest`

### GET `/api/v1/freelancer/deleteFreeLancerRequest/:id`
- **Description:** Delete freelancer request (Version 1)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.deleteFreeLancerRequest`

### PATCH `/api/v1/freelancer/trashFreeLancerRequest/:id`
- **Description:** Move freelancer request to trash (Version 1)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.trashFreeLancerRequest`

### PATCH `/api/v1/freelancer/untrashFreeLancerRequest/:id`
- **Description:** Restore freelancer request from trash (Version 1)
- **Authentication:** Required (Admin only)
- **Controller:** `freeLancerController.untrashFreeLancerRequest`

### POST `/api/v1/freelancer/getFreeLancerJoinUsRequestV2`
- **Description:** Submit freelancer join request (Version 2)
- **Authentication:** Not required
- **Controller:** `freeLancerControllerV2.getFreeLancerJoinUsRequest`

### GET `/api/v1/freelancer/getAllFreeLancerRequestV2`
- **Description:** Get all freelancer join requests (Version 2)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerControllerV2.getAllFreeLancerRequest`

### GET `/api/v1/freelancer/getSingleFreeLancerRequestV2/:id`
- **Description:** Get single freelancer request (Version 2)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerControllerV2.getSingleFreeLancerRequest`

### GET `/api/v1/freelancer/deleteFreeLancerRequestV2/:id`
- **Description:** Delete freelancer request (Version 2)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerControllerV2.deleteFreeLancerRequest`

### PATCH `/api/v1/freelancer/trashFreeLancerRequestV2/:id`
- **Description:** Move freelancer request to trash (Version 2)
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerControllerV2.trashFreeLancerRequest`

### PATCH `/api/v1/freelancer/untrashFreeLancerRequestV2/:id`
- **Description:** Restore freelancer request from trash (Version 2)
- **Authentication:** Required (Admin only)
- **Controller:** `freeLancerControllerV2.untrashFreeLancerRequest`

### POST `/api/v1/freelancer/createNicheListForFreelancer/`
- **Description:** Create a niche for freelancer
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.createNicheListForFreelancer`

### DELETE `/api/v1/freelancer/deleteNicheForFreelancer/:id`
- **Description:** Delete a niche
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.deleteNicheForFreelancer`

### GET `/api/v1/freelancer/listAllNichesForFreelancer`
- **Description:** List all freelancer niches
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.listAllNichesForFreelancer`

### GET `/api/v1/freelancer/listSingleNicheForFreelancer/:id`
- **Description:** Get single niche details
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.listSingleNicheForFreelancer`

### PUT `/api/v1/freelancer/updateNicheForFreelancer/:id`
- **Description:** Update a niche
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.updateNicheForFreelancer`

### PATCH `/api/v1/freelancer/acceptFreeLancerRequest/:id`
- **Description:** Accept freelancer request
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freeLancerController.acceptFreeLancerRequest`

### GET `/api/v1/freelancer/listAllFreelancers`
- **Description:** List all approved freelancers
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `freeLancerController.listAllTheFreelancers`

### GET `/api/v1/freelancer/listSingleFreelancer/:username`
- **Description:** Get single freelancer by username
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `freeLancerController.listSingleFreelancer`

### POST `/api/v1/freelancer/register`
- **Description:** New freelancer registration
- **Authentication:** Not required
- **Validation:** `freelancerRegistrationSchema`
- **Rate Limit:** 5 requests per 5 minutes
- **Controller:** `freelancerRegistrationController.registerFreelancer`

### GET `/api/v1/freelancer/registrations`
- **Description:** Get all freelancer registrations
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freelancerRegistrationController.getAllFreelancerRegistrations`

### GET `/api/v1/freelancer/registrations/:id`
- **Description:** Get single freelancer registration
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freelancerRegistrationController.getSingleFreelancerRegistration`

### PATCH `/api/v1/freelancer/registrations/:id/accept`
- **Description:** Accept freelancer registration
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freelancerRegistrationController.acceptFreelancerRegistration`

### DELETE `/api/v1/freelancer/registrations/:id/reject`
- **Description:** Reject freelancer registration
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freelancerRegistrationController.rejectFreelancerRegistration`

### PATCH `/api/v1/freelancer/registrations/:id/trash`
- **Description:** Move registration to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `freelancerRegistrationController.trashFreelancerRegistration`

### PATCH `/api/v1/freelancer/registrations/:id/untrash`
- **Description:** Restore registration from trash
- **Authentication:** Required (Admin only)
- **Controller:** `freelancerRegistrationController.untrashFreelancerRegistration`

---

## 7. Get Quote

**Base Route:** `/api/v1/getQuotes`

### POST `/api/v1/getQuotes/createQuote`
- **Description:** Create a quote request
- **Authentication:** Not required
- **Validation:** `getQuoteSchema`
- **Rate Limit:** 10 requests per minute
- **Controller:** `getQuoteController.createQuote`

### POST `/api/v1/getQuotes/createServicesForQuote`
- **Description:** Create services for quote
- **Authentication:** Not required
- **Controller:** `getQuoteController.createServicesForQuote`

### DELETE `/api/v1/getQuotes/deleteServicesForQuote/:id`
- **Description:** Delete services for quote
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `getQuoteController.deleteServicesForQuote`

### GET `/api/v1/getQuotes/getSingleQuote/:id`
- **Description:** Get single quote
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `getQuoteController.getSingleQuote`

### GET `/api/v1/getQuotes/getAllQuotes`
- **Description:** Get all quotes
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `getQuoteController.getAllQuote`

### PATCH `/api/v1/getQuotes/trashQuote/:id`
- **Description:** Move quote to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `getQuoteController.trashQuote`

### PATCH `/api/v1/getQuotes/unTrashQuote/:id`
- **Description:** Restore quote from trash
- **Authentication:** Required (Admin only)
- **Controller:** `getQuoteController.unTrashQuote`

### DELETE `/api/v1/getQuotes/deleteQuote/:id`
- **Description:** Delete a quote
- **Authentication:** Required (Admin only)
- **Controller:** `getQuoteController.deleteQuote`

---

## 8. Hire Us

**Base Route:** `/api/v1/hireUs`

### POST `/api/v1/hireUs/createHireUsRequest`
- **Description:** Create hire us request (with file upload)
- **Authentication:** Not required
- **Validation:** `hireUsSchema`
- **Rate Limit:** 10 requests per 8 hours
- **File Upload:** Supported via multer
- **Controller:** `hireUsController.createHireUsRequest`

### GET `/api/v1/hireUs/getAllHireUsRequests`
- **Description:** Get all hire us requests
- **Authentication:** Required (Admin only)
- **Controller:** `hireUsController.getAllHireUsRequests`

### GET `/api/v1/hireUs/getSingleHireUsRequest/:id`
- **Description:** Get single hire us request
- **Authentication:** Required (Admin only)
- **Controller:** `hireUsController.getSingleHireUsRequest`

### PATCH `/api/v1/hireUs/trashHireUsRequest/:id`
- **Description:** Move hire us request to trash
- **Authentication:** Required (Admin only)
- **Controller:** `hireUsController.trashHireUsRequest`

### PATCH `/api/v1/hireUs/untrashHireUsRequest/:id`
- **Description:** Restore hire us request from trash
- **Authentication:** Required (Admin only)
- **Controller:** `hireUsController.untrashHireUsRequest`

### DELETE `/api/v1/hireUs/permanentDeleteHireUsRequest/:id`
- **Description:** Permanently delete hire us request
- **Authentication:** Required (Admin only)
- **Controller:** `hireUsController.permanentDeleteHireUsRequest`

---

## 9. Milestone

**Base Route:** `/api/v1/milestone`

### POST `/api/v1/milestone/createMilestone/:projectId`
- **Description:** Create a single milestone for project
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `MilestoneSchema`
- **Controller:** `milestoneController.createSingleProjectMilestone`

### POST `/api/v1/milestone/createMultipleMilestones/:projectId`
- **Description:** Create multiple milestones for project
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `MultipleMilestoneSchema`
- **Controller:** `milestoneController.createMultipleMileStones`

### PATCH `/api/v1/milestone/updateMilestone/:milestoneId`
- **Description:** Update a milestone
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `MilestoneSchema`
- **Controller:** `milestoneController.updateMileStone`

### DELETE `/api/v1/milestone/deleteMilestone/:milestoneId`
- **Description:** Delete a milestone
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `milestoneController.deleteMileStone`

### PATCH `/api/v1/milestone/completeMilestone/:milestoneId`
- **Description:** Mark milestone as completed
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `milestoneController.completeMileStone`

### PATCH `/api/v1/milestone/updateMilestoneProgress/:milestoneId`
- **Description:** Update milestone progress
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Validation:** `MilestoneProgressSchema`
- **Controller:** `milestoneController.updateMilestoneProgress`

---

## 10. Navigation Pages

**Base Route:** `/api/v1/navigationPages`

### POST `/api/v1/navigationPages/createNavigationPage`
- **Description:** Create a navigation page
- **Authentication:** Not required (commented out)
- **Controller:** `navigationPagesController.createNavigationPage`

### GET `/api/v1/navigationPages/getSingleNavigationPage/:id`
- **Description:** Get single navigation page
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `navigationPagesController.getSingleNavigationPage`

### GET `/api/v1/navigationPages/getAllNavigationPages`
- **Description:** Get all navigation pages
- **Authentication:** Not required (commented out)
- **Controller:** `navigationPagesController.getAllNavigationPages`

### PUT `/api/v1/navigationPages/updateNavigationPage/:id`
- **Description:** Update a navigation page
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `navigationPagesController.updateNavigationPage`

### DELETE `/api/v1/navigationPages/deleteNavigationPage/:id`
- **Description:** Delete a navigation page
- **Authentication:** Not required (commented out)
- **Controller:** `navigationPagesController.deleteNavigationPage`

### PATCH `/api/v1/navigationPages/trashNavigationPage/:id`
- **Description:** Move navigation page to trash
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `navigationPagesController.trashNavigationPage`

### PATCH `/api/v1/navigationPages/untrashNavigationPage/:id`
- **Description:** Restore navigation page from trash
- **Authentication:** Required (Admin only)
- **Controller:** `navigationPagesController.untrashNavigationPage`

### PATCH `/api/v1/navigationPages/menuItems/:id/addChildrenToMenuItem`
- **Description:** Add children to menu item
- **Authentication:** Not required (commented out)
- **Controller:** `navigationPagesController.addChildrenToMenuItem`

---

## 11. Newsletter

**Base Route:** `/api/v1/newsletter`

### POST `/api/v1/newsletter/subscribeToNewsLetter`
- **Description:** Subscribe to newsletter
- **Authentication:** Required (Token)
- **Validation:** `SubscribeORunsubscribeToNewsLetterSchema`
- **Controller:** `newsLetterController.subscribeToTheNewsLetter`

### POST `/api/v1/newsletter/unSubscribeToNewsLetter`
- **Description:** Unsubscribe from newsletter
- **Authentication:** Required (Token)
- **Validation:** `SubscribeORunsubscribeToNewsLetterSchema`
- **Controller:** `newsLetterController.unsubscribedFromNewsLetter`

### POST `/api/v1/newsletter/sendNewsLetterToSingleSubscriber`
- **Description:** Send newsletter to single subscriber
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `sendNewsLetterToSingleUserSchema`
- **Rate Limit:** 1 request per minute
- **Controller:** `newsLetterController.sendNewsLetterToSingleSubscriber`

### POST `/api/v1/newsletter/sendNewsLetterToAllSubscribers`
- **Description:** Send newsletter to all subscribers
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `sendNewsLetterToAllUsersSchema`
- **Controller:** `newsLetterController.sendNewsLetterToAllSubscribers`

### GET `/api/v1/newsletter/listAllSubscribedMails`
- **Description:** List all subscribed emails
- **Authentication:** Required (Admin only)
- **Controller:** `newsLetterController.listAllSubscribedMails`

---

## 12. Payment

**Base Route:** `/api/v1/payment`

### POST `/api/v1/payment/create-payment-intent`
- **Description:** Create a payment intent (Stripe)
- **Authentication:** Required (Token)
- **Validation:** `createPaymentIntentSchema`
- **Controller:** `PaymentController.createPaymentIntent`

### GET `/api/v1/payment/payment-intent/:paymentIntentId/status`
- **Description:** Get payment intent status
- **Authentication:** Required (Token)
- **Controller:** `PaymentController.getPaymentIntentStatus`

### POST `/api/v1/payment/create-checkout-session`
- **Description:** Create a checkout session (Stripe)
- **Authentication:** Required (Token)
- **Validation:** `createCheckoutSessionSchema`
- **Controller:** `PaymentController.createCheckoutSession`

### GET `/api/v1/payment/checkout-session/:sessionId/status`
- **Description:** Get checkout session status
- **Authentication:** Required (Token)
- **Controller:** `PaymentController.getCheckoutSessionStatus`

### POST `/api/v1/payment/webhook`
- **Description:** Stripe webhook handler
- **Authentication:** Not required (webhook signature verification)
- **Controller:** `PaymentController.handleWebhook`

### POST `/api/v1/payment/create-refund`
- **Description:** Create a refund
- **Authentication:** Required (Token)
- **Validation:** `createRefundSchema`
- **Controller:** `PaymentController.createRefund`

### GET `/api/v1/payment/history`
- **Description:** Get payment history
- **Authentication:** Required (Token)
- **Controller:** `PaymentController.getPaymentHistory`

---

## 13. Project Builder

**Base Route:** `/api/v1/project-builder`

### POST `/api/v1/project-builder/`
- **Description:** Create a project builder
- **Authentication:** Required (Token)
- **Validation:** `projectBuilderSchema`
- **Controller:** `projectBuilderController.createProjectBuilder`

### GET `/api/v1/project-builder/`
- **Description:** Get all project builders
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.getAllProjectBuilders`

### GET `/api/v1/project-builder/:id`
- **Description:** Get single project builder
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.getSingleProjectBuilder`

### PUT `/api/v1/project-builder/:id`
- **Description:** Update project builder
- **Authentication:** Required (Token)
- **Validation:** `projectBuilderSchema`
- **Controller:** `projectBuilderController.updateProjectBuilder`

### DELETE `/api/v1/project-builder/:id`
- **Description:** Delete project builder (soft delete)
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.deleteProjectBuilder`

### GET `/api/v1/project-builder/:id/freelancers`
- **Description:** Get project builder with freelancers
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.getProjectBuilderWithFreelancers`

### POST `/api/v1/project-builder/:id/interested-freelancers`
- **Description:** Add interested freelancers
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.addInterestedFreelancers`

### DELETE `/api/v1/project-builder/:id/interested-freelancers`
- **Description:** Remove interested freelancer
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.removeInterestedFreelancer`

### POST `/api/v1/project-builder/:id/selected-freelancers`
- **Description:** Select freelancers for project
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.selectFreelancers`

### DELETE `/api/v1/project-builder/:id/selected-freelancers`
- **Description:** Remove selected freelancer
- **Authentication:** Required (Token)
- **Controller:** `projectBuilderController.removeSelectedFreelancer`

---

## 14. Project Request

**Base Route:** `/api/v1/projectRequest`

### POST `/api/v1/projectRequest/create`
- **Description:** Create a project request
- **Authentication:** Not required
- **Rate Limit:** 10 requests per 5 minutes
- **Controller:** `ProjectRequestController.create`

### GET `/api/v1/projectRequest/`
- **Description:** Get all project requests
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `ProjectRequestController.findAll`

### GET `/api/v1/projectRequest/:id`
- **Description:** Get single project request
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `ProjectRequestController.findById`

### DELETE `/api/v1/projectRequest/:id`
- **Description:** Delete a project request
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `ProjectRequestController.delete`

---

## 15. Project

**Base Route:** `/api/v1/project`

### POST `/api/v1/project/createProject`
- **Description:** Create a new project
- **Authentication:** Required (Admin or Moderator)
- **Validation:** `projectSchema`
- **Controller:** `projectController.createProject`

### GET `/api/v1/project/getSingleProject/:projectSlug`
- **Description:** Get single project by slug
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `projectController.getSingleProject`

### GET `/api/v1/project/getAllOutsourcedProjects`
- **Description:** Get all outsourced projects
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `getProjectController.getAllOutsourcedProjects`

### GET `/api/v1/project/getAllProjects`
- **Description:** Get all projects
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `getProjectController.getAllProjects`

### GET `/api/v1/project/getAllProjectsWithThierClient/:clientId`
- **Description:** Get all projects for a specific client
- **Authentication:** Required (Token)
- **Controller:** `getProjectController.getAllProjectsWithThierClient`

### DELETE `/api/v1/project/deleteProject/:id`
- **Description:** Delete a project
- **Authentication:** Required (Admin only)
- **Controller:** `projectController.deleteProject`

### GET `/api/v1/project/getProjectForSelectedFreelancers`
- **Description:** Get projects for selected freelancers
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `getProjectController.getProjectForSelectedFreelancers`

### PATCH `/api/v1/project/createInterestedFreelancers/:projectSlug`
- **Description:** Add interested freelancer to project
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `updateProjectController.createInterestedFreelancers`

### PATCH `/api/v1/project/removeFreelancerFromInterestedList/:projectSlug`
- **Description:** Remove freelancer from interested list
- **Authentication:** Required (Admin, Moderator, or Freelancer)
- **Controller:** `updateProjectController.removeFreelancerFromInterestedList`

### GET `/api/v1/project/listInterestedFreelancersInSingleProject/:projectSlug`
- **Description:** List interested freelancers in project
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `updateProjectController.listInterestedFreelancersInSingleProject`

### PATCH `/api/v1/project/selectFreelancerForProject/:projectSlug`
- **Description:** Select freelancer for project
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `updateProjectController.selectFreelancerForProject`

### PATCH `/api/v1/project/removeSelectedFreelancer/:projectSlug`
- **Description:** Remove selected freelancer from project
- **Authentication:** Required (Admin or Moderator)
- **Controller:** `updateProjectController.removeSelectedFreelancer`

### PATCH `/api/v1/project/updateProgressOfProject/:projectSlug`
- **Description:** Update project progress
- **Authentication:** Not required (commented out)
- **Controller:** `updateProjectController.updateProgressOfProject`

### PATCH `/api/v1/project/changeProjectStatus/:projectSlug`
- **Description:** Change project status
- **Authentication:** Not required (commented out)
- **Controller:** `updateProjectController.changeProjectStatus`

### PATCH `/api/v1/project/changeProjectType/:projectSlug`
- **Description:** Change project type
- **Authentication:** Not required (commented out)
- **Controller:** `updateProjectController.changeProjectType`

### PATCH `/api/v1/project/writeReviewAndGiveRating/:projectSlug`
- **Description:** Write review and give rating
- **Authentication:** Not required (commented out)
- **Controller:** `updateProjectController.writeReviewAndGiveRating`

### PATCH `/api/v1/project/updateProjectBySlug/:projectSlug`
- **Description:** Update project by slug
- **Authentication:** Not required (commented out)
- **Validation:** `projectSchema`
- **Controller:** `updateProjectController.updateProjectBySlug`

### PATCH `/api/v1/project/makeProjectOutsource/:projectSlug`
- **Description:** Make project outsourced
- **Authentication:** Not required (commented out)
- **Controller:** `updateProjectController.makeProjectOutsource`

---

## 16. Trash

**Base Route:** `/api/v1/trash`

### GET `/api/v1/trash/getTrashedUsers`
- **Description:** Get all trashed users
- **Authentication:** Required (Admin only)
- **Controller:** `trashUserController.getTrashedUsers`

### GET `/api/v1/trash/getTrashedMessages`
- **Description:** Get all trashed contact messages
- **Authentication:** Required (Admin only)
- **Controller:** `trashMessages.getAllTrashedMessages`

### GET `/api/v1/trash/getTrashedNavigationPages`
- **Description:** Get all trashed navigation pages
- **Authentication:** Required (Admin only)
- **Controller:** `trashNavigationPagesController.trashedNavigationPages`

### GET `/api/v1/trash/getTrashedQuotes`
- **Description:** Get all trashed quotes
- **Authentication:** Required (Admin only)
- **Controller:** `trashGetQuotes.getTrashedQuotes`

### GET `/api/v1/trash/getTrashedConsultations`
- **Description:** Get all trashed consultations
- **Authentication:** Required (Admin only)
- **Controller:** `trashConsultations.getAllTrashedConsultations`

### GET `/api/v1/trash/getTrashedHireUs`
- **Description:** Get all trashed hire us requests
- **Authentication:** Required (Admin only)
- **Controller:** `trashHireUsController.getAllTrashedHireUs`

### GET `/api/v1/trash/getTrashedContactUs`
- **Description:** Get all trashed contact us messages
- **Authentication:** Required (Admin only)
- **Controller:** `trashContactUs.getTrashedContactUs`

---

## 17. Visitors

**Base Route:** `/api/v1/visitors`

### POST `/api/v1/visitors/`
- **Description:** Create a visitor record
- **Authentication:** Not required
- **Validation:** `visitorsSchema`
- **Controller:** `visitorsController.createVisitor`

### POST `/api/v1/visitors/test`
- **Description:** Test endpoint for visitor validation
- **Authentication:** Not required
- **Validation:** `visitorsSchema`
- **Controller:** `visitorsController.createVisitor`

### GET `/api/v1/visitors/`
- **Description:** Get all visitors
- **Authentication:** Required (Token)
- **Controller:** `visitorsController.getAllVisitors`

### GET `/api/v1/visitors/:id`
- **Description:** Get single visitor
- **Authentication:** Required (Token)
- **Controller:** `visitorsController.getSingleVisitor`

### PUT `/api/v1/visitors/:id`
- **Description:** Update visitor
- **Authentication:** Required (Token)
- **Validation:** `visitorsSchema`
- **Controller:** `visitorsController.updateVisitor`

### DELETE `/api/v1/visitors/:id`
- **Description:** Delete visitor (soft delete)
- **Authentication:** Required (Token)
- **Controller:** `visitorsController.deleteVisitor`

---

## Authentication Roles

The API uses the following user roles:

- **Admin:** Full access to all endpoints
- **Moderator:** Limited administrative access
- **Freelancer:** Access to freelancer-specific features
- **Client:** Regular user access

## Rate Limiting

Several endpoints have rate limiting implemented:
- Contact Us: 5 requests per minute
- Consultation: 10 requests per 8 hours
- Hire Us: 10 requests per 8 hours
- Freelancer Join: 10 requests per 5 minutes
- Newsletter (single): 1 request per minute

## Notes

- All endpoints return JSON responses
- Some authentication middleware is commented out in certain routes (marked in descriptions)
- File upload is supported in Hire Us endpoint via Multer
- Payment endpoints integrate with Stripe
- Most DELETE operations are soft deletes (move to trash)

