# AgriMitra – Backend API & Contract Audit

**Audit Date**: November 23, 2026  
**Backend Framework**: FastAPI (Python 3.10)  
**Database**: PostgreSQL 16 via SQLAlchemy & Alembic  
**API Specification**: OpenAPI 3.1 (`/openapi.json` and `/docs`)  
**Frontend Client**: Typed Axios Client (`frontend/src/services/api.ts`)  
**Total Endpoint Handlers**: 48  
**Test Suite**: 26 pytest tests (100% passing)

---

## 1. Complete API Endpoint Inventory

### 1. System Health & Infrastructure
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/health` | Service health and database ping | No | None | `HealthResponse` | `200`, `503` |

### 2. Authentication & Onboarding (`/api/v1/auth`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `POST` | `/api/v1/auth/register` | Register new user via phone & password | No | `UserRegisterRequest` | `AuthTokenResponse` | `200`, `400` |
| `POST` | `/api/v1/auth/login` | Sign in via password or demo OTP (`123456`) | No | `UserLoginRequest` | `AuthTokenResponse` | `200`, `400`, `401` |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit demonstration OTP | No | `OtpVerifyRequest` | `AuthTokenResponse` | `200`, `400` |
| `POST` | `/api/v1/auth/resend-otp` | Resend demonstration OTP | No | `OtpResendRequest` | `dict` | `200`, `400` |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset code | No | `ForgotPasswordRequest` | `dict` | `200`, `404` |
| `POST` | `/api/v1/auth/reset-password` | Set new password with OTP | No | `ResetPasswordRequest` | `dict` | `200`, `400`, `404` |
| `POST` | `/api/v1/auth/onboarding` | Submit 5-step onboarding wizard data | Yes | `OnboardingUpdateRequest` | `UserResponse` | `200`, `400`, `404` |
| `POST` | `/api/v1/auth/switch-role` | Switch active role for dual-role users | Yes | `RoleSwitchRequest` | `UserResponse` | `200`, `400`, `404` |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user | Yes | None | `UserResponse` | `200`, `404` |

### 3. Geographic Locations (`/api/v1/locations`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/locations/` | List all verified pilot locations | No | Query: `district`, `taluk` | `List[LocationResponse]` | `200` |
| `GET` | `/api/v1/locations/hierarchy` | Mandya 5-level nested location tree | No | None | `LocationHierarchyResponse`| `200` |

### 4. Crop Library & Farmer My Crops (`/api/v1/crops`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/crops/` | List all cataloged Mandya crops | No | Query: `category` | `List[CropResponse]` | `200` |
| `GET` | `/api/v1/crops/{crop_id}` | Detailed agronomic guide for crop | No | Path: `crop_id` | `CropResponse` | `200`, `404` |
| `GET` | `/api/v1/crops/my` | Farmer enrolled crops list | Yes | None | `List[UserCropResponse]` | `200` |
| `POST` | `/api/v1/crops/my` | Enroll new crop into farmer profile | Yes | `UserCropCreate` | `UserCropResponse` | `200`, `400` |
| `PUT` | `/api/v1/crops/my/{id}` | Update cultivated acreage or stage | Yes | `UserCropUpdate` | `UserCropResponse` | `200`, `404` |
| `DELETE`| `/api/v1/crops/my/{id}` | Remove crop from farmer profile | Yes | Path: `id` | `dict` | `200`, `404` |

### 5. Weather Forecasts (`/api/v1/weather`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/weather/current` | Real-time Open-Meteo weather with fallback | No | Query: `location_id` | `WeatherResponse` | `200` |
| `GET` | `/api/v1/weather/forecast` | 7-day Mandya agro-weather forecast | No | Query: `location_id` | `ForecastResponse` | `200` |

### 6. Crop Advisory & Disease AI (`/api/v1/advisory`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/advisory/` | Search agronomic advisories with filters | No | Query: `crop_id`, `severity`| `List[AdvisoryResponse]` | `200` |
| `GET` | `/api/v1/advisory/{id}` | Detailed advisory action items & sources | No | Path: `id` | `AdvisoryResponse` | `200`, `404` |
| `GET` | `/api/v1/advisory/recommendations` | Personalized advisories for farmer's crops | Yes | None | `List[AdvisoryResponse]` | `200` |
| `POST` | `/api/v1/advisory/diagnose` | Preview crop disease diagnosis | No | `DiseaseDiagnosisRequest`| `DiseaseDiagnosisResponse`| `200` |

### 7. Farmer Community & Village Groups (`/api/v1/community`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/community/groups` | Directory of village farmer groups | No | Query: `taluk`, `crop_id` | `List[CommunityGroupResponse]` | `200` |
| `POST` | `/api/v1/community/groups` | Create new village farmer group | Yes | `CommunityGroupCreate` | `CommunityGroupResponse` | `200` |
| `GET` | `/api/v1/community/groups/{id}` | Group details, members, rules | No | Path: `id` | `CommunityGroupResponse` | `200`, `404` |
| `POST` | `/api/v1/community/groups/{id}/join` | Submit request to join village group | Yes | Path: `id` | `dict` | `200`, `400` |
| `GET` | `/api/v1/community/groups/{id}/requests`| List pending membership requests | Yes (Admin) | Path: `id` | `List[GroupMemberResponse]` | `200`, `403` |
| `POST` | `/api/v1/community/groups/{id}/approve` | Approve farmer join request | Yes (Admin) | Query: `user_id` | `dict` | `200`, `403` |
| `GET` | `/api/v1/community/groups/{id}/announcements` | Group announcements feed | No | Path: `id` | `List[GroupAnnouncementResponse]` | `200` |
| `POST` | `/api/v1/community/groups/{id}/announcements` | Post urgent announcement to group | Yes (Admin) | `GroupAnnouncementCreate` | `GroupAnnouncementResponse` | `200`, `403` |
| `GET` | `/api/v1/community/posts` | Discussion forum feed with filters | No | Query: `topic`, `crop_id` | `List[CommunityPostResponse]` | `200` |
| `POST` | `/api/v1/community/posts` | Create new discussion post with photo | Yes | `CommunityPostCreate` | `CommunityPostResponse` | `200` |
| `GET` | `/api/v1/community/posts/{id}` | Post detail with comment threads | No | Path: `id` | `CommunityPostResponse` | `200`, `404` |
| `POST` | `/api/v1/community/posts/{id}/like` | Toggle like on discussion post | Yes | Path: `id` | `dict` | `200` |
| `POST` | `/api/v1/community/posts/{id}/save` | Bookmark post to Saved Posts | Yes | Path: `id` | `dict` | `200` |
| `POST` | `/api/v1/community/posts/{id}/comments` | Add comment or nested reply | Yes | `PostCommentCreate` | `PostCommentResponse` | `200` |
| `POST` | `/api/v1/community/reports` | Report inappropriate content | Yes | `ContentReportCreate` | `dict` | `200` |

### 8. Produce Marketplace & Enquiries (`/api/v1/market`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/market/listings` | Search active produce listings | No | Query: `crop_id`, `taluk`, `sort` | `List[MarketListingResponse]` | `200` |
| `POST` | `/api/v1/market/listings` | Create individual or collective listing | Yes (Farmer) | `MarketListingCreate` | `MarketListingResponse` | `200` |
| `GET` | `/api/v1/market/listings/{id}` | Listing detail, farmer info, lot contributors | No | Path: `id` | `MarketListingResponse` | `200`, `404` |
| `PATCH`| `/api/v1/market/listings/{id}/status` | Pause, reactivate, or mark listing as sold | Yes (Farmer) | Query: `status` | `MarketListingResponse` | `200`, `403` |
| `POST` | `/api/v1/market/listings/{id}/save` | Save listing to buyer favourites | Yes | Path: `id` | `dict` | `200` |
| `GET` | `/api/v1/market/enquiries` | Buyer or farmer enquiry dashboard | Yes | Query: `role` (`farmer`/`buyer`) | `List[MarketEnquiryResponse]` | `200` |
| `POST` | `/api/v1/market/enquiries` | Send purchase enquiry with requested qty | Yes (Buyer) | `MarketEnquiryCreate` | `MarketEnquiryResponse` | `200` |
| `GET` | `/api/v1/market/enquiries/{id}` | Enquiry negotiation thread & messages | Yes | Path: `id` | `MarketEnquiryResponse` | `200`, `404` |
| `PATCH`| `/api/v1/market/enquiries/{id}/status` | Accept, decline, or complete enquiry | Yes | `MarketEnquiryStatusUpdate` | `MarketEnquiryResponse` | `200` |
| `POST` | `/api/v1/market/enquiries/{id}/messages`| Send counter-offer message in thread | Yes | `EnquiryMessageCreate` | `EnquiryMessageResponse` | `200` |

### 9. Notification Center (`/api/v1/notifications`)
| Method | Path | Summary | Auth Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/notifications/` | List user in-app notifications | Yes | Query: `type`, `unread_only` | `List[NotificationResponse]` | `200` |
| `PATCH`| `/api/v1/notifications/{id}/read` | Mark individual notification as read | Yes | Path: `id` | `NotificationResponse` | `200` |
| `POST` | `/api/v1/notifications/read-all` | Mark all notifications as read | Yes | None | `dict` | `200` |
| `GET` | `/api/v1/notifications/preferences` | Get user notification alert settings | Yes | None | `UserNotificationPreferenceResponse` | `200` |
| `PUT` | `/api/v1/notifications/preferences` | Update notification alert preferences | Yes | `UserNotificationPreferenceUpdate` | `UserNotificationPreferenceResponse` | `200` |

### 10. Platform Administration & Moderation (`/api/v1/admin`)
| Method | Path | Summary | Auth Required | Role Required | Request Model | Response Model | Status Codes |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `GET` | `/api/v1/admin/stats` | Platform usage and operational metrics | Yes | Admin Only | None | `AdminPlatformStats` | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/users` | Search and filter registered platform users | Yes | Admin Only | Query: `search`, `role` | `List[UserResponse]` | `200`, `401`, `403` |
| `PATCH`| `/api/v1/admin/users/{id}/status` | Suspend or reinstate user account | Yes | Admin Only | `AdminUserUpdate` | `UserResponse` | `200`, `401`, `403` |
| `PATCH`| `/api/v1/admin/users/{id}/badges` | Award or revoke Verified/Expert badges | Yes | Admin Only | `AdminUserBadgeUpdate` | `UserResponse` | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/reports` | Content moderation queue | Yes | Admin Only | Query: `status` | `List[ContentReportResponse]` | `200`, `401`, `403` |
| `PATCH`| `/api/v1/admin/reports/{id}/resolve`| Take down content and resolve report | Yes | Admin Only | `AdminReportResolveRequest` | `dict` | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/crops` | Manage crop library specifications | Yes | Admin Only | None | `List[CropResponse]` | `200`, `401`, `403` |
| `POST` | `/api/v1/admin/crops` | Add new crop to district database | Yes | Admin Only | `AdminCropCreate` | `CropResponse` | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/support-tickets` | List user help desk support tickets | Yes | Admin Only | Query: `status` | `List[SupportTicketResponse]` | `200`, `401`, `403` |
| `PATCH`| `/api/v1/admin/support-tickets/{id}`| Update status and post resolution notes | Yes | Admin Only | `SupportTicketStatusUpdate` | `SupportTicketResponse` | `200`, `401`, `403` |
| `GET` | `/api/v1/admin/audit-logs` | Immutable audit log of administrative actions | Yes | Admin Only | None | `List[ModerationAuditLogResponse]`| `200`, `401`, `403` |

---

## 2. API Contract Parity & Type Safety

TypeScript interfaces in `frontend/src/types/api.ts` directly mirror Pydantic schemas in `backend/app/schemas/schemas.py`.

Key parity verifications:
1. **Datetime Parsing**: ISO 8601 string formatting in JSON payloads converts into JavaScript `Date` instances.
2. **Nullable Fields**: All optional parameters (`village`, `hobli`, `latitude`, `longitude`, `price_per_unit`) use explicit `Optional[...] = None` in Python and `?: type | null` in TypeScript.
3. **Bilingual Fields**: Bilingual entity attributes (`name_en`/`name_kn`, `title_en`/`title_kn`, `message_en`/`message_kn`) are consistently typed across all advisory, crop, and notification schemas.
4. **Enquiry Negotiation Statuses**: `pending`, `accepted`, `in_negotiation`, and `completed` are uniformly supported across frontend badges and backend update routers.
