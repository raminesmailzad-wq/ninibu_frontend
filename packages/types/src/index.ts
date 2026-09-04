export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

export type Pagination = { page: number; limit: number; total: number; total_pages: number };

export type User = {
  id: number;
  mobile: string;
  first_name: string;
  last_name: string;
  status: boolean;
  role: string;
  has_password?: boolean;
  last_login_at?: string;
};

export type AuthSession = { authenticated: boolean; user?: User; onboardingCompleted?: boolean };

export type Country = { id: number; code: string; name: string; local_name?: string };
export type Province = { id: number; country_id: number; code?: string; name: string; local_name?: string };
export type City = { id: number; province_id: number; name: string; local_name?: string; latitude?: number; longitude?: number };

export type Profile = {
  user_id: number;
  mobile: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  gender?: string;
  country?: Country;
  province?: Province;
  city?: City;
  residence_address?: string;
  onboarding_step: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
};

export type ChildAccess = { role: string; is_owner: boolean };

export type Child = {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  blood_type?: string;
  birth_weight_grams?: number;
  birth_height_cm?: number;
  birth_head_circumference_cm?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  access?: ChildAccess;
};

export type ListChildrenResponse = { items: Child[]; pagination: Pagination };

export type GrowthMeasurement = {
  id: number;
  child_id: number;
  measured_at: string;
  weight_grams?: number;
  weight_kg?: number;
  height_millimeters?: number;
  height_cm?: number;
  head_circumference_millimeters?: number;
  head_circumference_cm?: number;
  notes?: string;
  source_type?: string;
  source_ref?: string;
  extraction_confidence?: number;
  confirmed_by_user_id?: number;
  created_at?: string;
  updated_at?: string;
};

export type DocumentImportPageType = "weight_for_age" | "height_for_age" | "head_circumference_for_age";
export type DocumentImportMetric = "weight_kg" | "height_cm" | "head_circumference_cm";
export type DocumentImportItem = {
  id: number;
  metric: DocumentImportMetric;
  age_months: number;
  suggested_measured_at: string;
  suggested_value: number;
  unit: string;
  confidence: number;
  x_normalized: number;
  y_normalized: number;
  warning?: string;
  status: "proposed" | "accepted" | "rejected" | string;
  confirmed_measured_at?: string;
  confirmed_value?: number;
  growth_measurement_id?: number;
};
export type DocumentImport = {
  id: number;
  child_id: number;
  kind: "growth_chart" | string;
  template_code: string;
  page_type: DocumentImportPageType | string;
  status: "processing" | "review" | "confirmed" | "failed" | "cancelled" | string;
  analyzer_version: string;
  overall_confidence: number;
  image_width: number;
  image_height: number;
  items: DocumentImportItem[];
  privacy_note?: string;
  created_at: string;
  confirmed_at?: string;
};
export type ConfirmDocumentImportResponse = { import: DocumentImport; growth_measurement_ids: number[] };

export type GrowthChartPoint = { measurement_id: number; measured_at: string; value: number };
export type GrowthAssessmentPoint = {
  measurement_id: number;
  measured_at: string;
  age_days: number;
  age_months: number;
  value: number;
  z_score: number;
  percentile: number;
  band: string;
};
export type GrowthReferencePoint = {
  age_days: number;
  age_months: number;
  minus_3_sd: number;
  minus_2_sd: number;
  median: number;
  plus_2_sd: number;
  plus_3_sd: number;
};
export type GrowthIndicator = {
  code: "weight_for_age" | "height_for_age" | "bmi_for_age" | "head_circumference_for_age" | string;
  unit: string;
  supported: boolean;
  reason?: string;
  min_age_months: number;
  max_age_months: number;
  points: GrowthAssessmentPoint[];
  reference: GrowthReferencePoint[];
  latest?: GrowthAssessmentPoint;
};
export type GrowthChart = {
  child_id: number;
  gender?: string;
  birth_date?: string;
  standard?: {
    name: string;
    version: string;
    child_growth_source_url?: string;
    school_age_source_url?: string;
    disclaimer?: string;
  };
  series: {
    weight_kg: GrowthChartPoint[];
    height_cm: GrowthChartPoint[];
    head_circumference_cm: GrowthChartPoint[];
  };
  indicators?: {
    weight_for_age: GrowthIndicator;
    height_for_age: GrowthIndicator;
    bmi_for_age: GrowthIndicator;
    head_circumference_for_age: GrowthIndicator;
  };
};
export type ListGrowthMeasurementsResponse = { items: GrowthMeasurement[]; pagination: Pagination };

export type HealthRecordMetadata = {
  source_type?: string;
  verification_status?: string;
  created_by_user_id?: number;
  updated_by_user_id?: number;
};

export type Vaccination = {
  id: number;
  child_id: number;
  vaccine_id?: number;
  vaccine_code?: string;
  vaccine_name: string;
  dose_number: number;
  administered_at: string;
  next_dose_due_at?: string;
  batch_number?: string;
  manufacturer?: string;
  metadata?: HealthRecordMetadata;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
export type ListVaccinationsResponse = { items: Vaccination[]; pagination: Pagination };

export type Allergy = {
  id: number;
  child_id: number;
  allergy_type: string;
  allergen_name: string;
  severity: string;
  reaction?: string;
  identified_at?: string;
  status: string;
  metadata?: HealthRecordMetadata;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
export type ListAllergiesResponse = { items: Allergy[]; pagination: Pagination };

export type MedicalVisit = {
  id: number;
  child_id: number;
  visited_at: string;
  visit_type: string;
  chief_complaint?: string;
  symptoms?: string;
  examination_notes?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  follow_up_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
export type ListMedicalVisitsResponse = { items: MedicalVisit[]; pagination: Pagination };

export type ChildMedication = {
  id: number;
  child_id: number;
  medication_name: string;
  form?: string;
  started_at: string;
  ended_at?: string;
  dose_value?: number;
  dose_unit?: string;
  route?: string;
  frequency?: string;
  status: string;
  stop_reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
export type ListChildMedicationsResponse = { items: ChildMedication[]; pagination: Pagination };

export type HealthTimelineEvent = {
  type: string;
  entity_id: number;
  occurred_at: string;
  title: string;
  summary?: string;
  source_type?: string;
  verification_status?: string;
  data?: Record<string, unknown>;
};
export type HealthTimelineResponse = { child_id: number; items: HealthTimelineEvent[]; pagination: Pagination };

export type Recommendation = {
  id: number;
  child_id?: number;
  type: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  reason_code: string;
  score: number;
  status: string;
  medical_notice?: string;
  available_at: string;
  expires_at?: string;
};
export type RecommendationListResponse = { items: Recommendation[]; pagination: Pagination };
export type NotificationUnreadCount = { count: number };

export type CommunityCategory = {
  id: number;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
};

export type CommunityProfile = {
  id: number;
  user_id: number;
  display_name: string;
  bio?: string;
  avatar_attachment_id?: number;
  is_anonymous_by_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CommunityMembershipStatus = "pending" | "active" | "muted" | "banned" | "left" | "";
export type CommunityMembershipRole = "owner" | "moderator" | "member" | "";
export type CommunityGroupVisibility = "public" | "private" | "hidden";
export type CommunityMembershipPolicy = "open" | "approval_required" | "invitation_only";
export type CommunityPostType = "question" | "experience" | "discussion" | "tip" | "poll" | "announcement";
export type CommunityPrivacyMode = "identified" | "anonymous";
export type CommunityReactionType = "like" | "helpful" | "support" | "thanks";
export type CommunityReportReason = "medical_misinformation" | "dangerous_advice" | "harassment" | "spam" | "advertising" | "privacy_violation" | "inappropriate_content" | "other";

export type CommunityGroup = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  group_type: "topic" | "child_age" | "location" | "experience" | "support" | "official";
  visibility: CommunityGroupVisibility;
  membership_policy: CommunityMembershipPolicy;
  category: CommunityCategory;
  owner_user_id?: number;
  is_official: boolean;
  is_active: boolean;
  membership_status?: CommunityMembershipStatus;
  membership_role?: CommunityMembershipRole;
  member_count: number;
  created_at: string;
  updated_at: string;
};
export type CommunityGroupListResponse = { items: CommunityGroup[]; pagination: Pagination };

export type CommunityAuthor = {
  user_id?: number;
  display_name: string;
  author_type: "parent" | "verified_clinician" | string;
  is_anonymous: boolean;
  is_mine: boolean;
};

export type CommunityReactionSummary = {
  reaction_type: CommunityReactionType;
  count: number;
  reacted_by_me: boolean;
};

export type CommunityPost = {
  id: number;
  group_id: number;
  group_name?: string;
  post_type: CommunityPostType;
  title?: string;
  body: string;
  privacy_mode: CommunityPrivacyMode;
  status: "published" | "hidden" | "pending_review" | string;
  is_pinned: boolean;
  is_locked: boolean;
  requires_review: boolean;
  review_reason?: string;
  comment_count: number;
  reaction_count: number;
  author: CommunityAuthor;
  reactions?: CommunityReactionSummary[];
  medical_disclaimer?: string;
  published_at: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
};
export type CommunityPostListResponse = { items: CommunityPost[]; pagination: Pagination };

export type CommunityComment = {
  id: number;
  post_id: number;
  parent_comment_id?: number;
  depth: number;
  body: string;
  privacy_mode: CommunityPrivacyMode;
  status: "published" | "hidden" | "pending_review" | string;
  requires_review: boolean;
  reaction_count: number;
  author: CommunityAuthor;
  reactions?: CommunityReactionSummary[];
  edited_at?: string;
  created_at: string;
  updated_at: string;
};
export type CommunityCommentListResponse = { items: CommunityComment[]; pagination: Pagination };

export type CommunityReport = {
  id: number;
  reporter_user_id?: number;
  entity_type: "community_post" | "community_comment";
  entity_id: number;
  reason: CommunityReportReason;
  description?: string;
  status: string;
  reviewed_by_user_id?: number;
  reviewed_at?: string;
  resolution?: string;
  is_system_generated: boolean;
  created_at: string;
};

// Consultation, services, booking and payment contracts — Backend v0.22.2.
export type ConsultationPrivacy = "private" | "anonymous_public" | "public";
export type ConsultationStatus = "draft" | "open" | "assigned" | "answered" | "waiting_for_parent" | "closed" | "cancelled" | string;

export type ConsultationCategory = {
  id: number;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
};

export type ConsultationAnswer = {
  id: number;
  question_id: number;
  author_user_id: number;
  author_type: string;
  body: string;
  is_accepted: boolean;
  is_official: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsultationSuggestion = {
  id: number;
  suggestion_type: string;
  reference_type?: string;
  reference_id?: number;
  title: string;
  explanation: string;
  confidence: number;
  generated_by: string;
};

export type ConsultationAttachment = {
  id: number;
  file_name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  visibility: string;
  created_at: string;
};

export type ConsultationQuestion = {
  id: number;
  user_id?: number;
  child_id?: number;
  category: ConsultationCategory;
  title: string;
  body: string;
  privacy: ConsultationPrivacy;
  status: ConsultationStatus;
  priority: string;
  assigned_clinician_user_id?: number;
  answers?: ConsultationAnswer[];
  suggestions?: ConsultationSuggestion[];
  attachments?: ConsultationAttachment[];
  closed_at?: string;
  created_at: string;
  updated_at: string;
};

export type ConsultationQuestionListResponse = { items: ConsultationQuestion[]; pagination: Pagination };

export type CommerceCategory = {
  id: number;
  parent_id?: number;
  code: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
};

export type ProductVariant = {
  id: number;
  product_id?: number;
  sku?: string;
  title?: string;
  attributes?: Record<string, string | number | boolean>;
  price_amount: number;
  compare_at_price_amount?: number;
  currency: string;
  stock?: number;
  status?: string;
};

export type CommerceProduct = {
  id: number;
  seller_id: number;
  seller_name?: string;
  category_id?: number;
  category_name?: string;
  brand?: string;
  name: string;
  slug?: string;
  description?: string;
  status: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  variants: ProductVariant[];
};

export type ProductListResponse = { items: CommerceProduct[]; pagination: Pagination };

export type CommerceCartItem = {
  id: number;
  seller_id?: number;
  item_type: "product_variant" | "service" | string;
  reference_id: number;
  quantity: number;
  title_snapshot?: string;
  sku_snapshot?: string;
  unit_price_snapshot: number;
  line_total: number;
  currency?: string;
};

export type CommerceCart = {
  id: number;
  status: string;
  currency?: string;
  items: CommerceCartItem[];
  items_subtotal: number;
  discount_amount?: number;
  shipping_amount?: number;
  payable_amount?: number;
  expires_at?: string;
};

export type CheckoutPreview = {
  cart_id: number;
  currency: string;
  items_subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  payable_amount: number;
  payment_ready: boolean;
  notice?: string;
};

export type CommerceOrderItem = {
  id?: number;
  item_type?: string;
  reference_id?: number;
  title_snapshot?: string;
  sku_snapshot?: string;
  quantity: number;
  unit_price_snapshot: number;
  line_total: number;
};

export type CommerceOrder = {
  id: number;
  order_number?: string;
  status: string;
  currency: string;
  items_subtotal?: number;
  discount_amount?: number;
  shipping_amount?: number;
  payable_amount?: number;
  payment_ready?: boolean;
  items?: CommerceOrderItem[];
  created_at?: string;
  updated_at?: string;
  cancelled_at?: string;
  expires_at?: string;
};

export type CommerceOrderListResponse = { items: CommerceOrder[]; pagination: Pagination };

export type AdvertisingPreferences = {
  personalized_ads_enabled: boolean;
  location_based_ads_enabled: boolean;
  interest_based_ads_enabled: boolean;
  updated_at?: string;
};

export type AdvertisingCreative = {
  id: number;
  type?: "banner" | "native_card" | "text" | "image" | "announcement" | string;
  creative_type?: "banner" | "native_card" | "text" | "image" | "announcement" | string;
  title?: string;
  body?: string;
  image_url?: string;
  call_to_action?: string;
  destination_type?: string;
  destination_value?: string;
  destination_url?: string;
  internal_path?: string;
};

export type AdvertisingDeliveryItem = {
  campaign_id?: number;
  placement_id?: number;
  content_kind: "sponsored" | string;
  sponsored: boolean;
  creative: AdvertisingCreative;
};

export type AdvertisingDeliveryResponse = {
  request_id: string;
  items: AdvertisingDeliveryItem[];
};

export type AdvertisingEvent = {
  id: number;
  request_id: string;
  campaign_id?: number;
  creative_id: number;
  placement_id?: number;
  event_type: "impression" | "click" | "dismiss" | "conversion" | string;
  occurred_at: string;
};

export type ServiceOffering = {
  id: number;
  seller_id: number;
  seller_name?: string;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  delivery_type: string;
  duration_minutes?: number;
  price_amount: number;
  currency: string;
  care_location_id?: number;
  status: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
};

export type ServiceListResponse = { items: ServiceOffering[]; pagination: Pagination };

export type BookingSlot = {
  starts_at: string;
  ends_at: string;
  available: boolean;
};

export type BookingDay = { date: string; slots: BookingSlot[] };
export type ServiceAvailability = {
  service_offering_id: number;
  timezone: string;
  from: string;
  to: string;
  days: BookingDay[];
};

export type BookingMeeting = {
  provider: string;
  meeting_url: string;
  meeting_reference?: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

export type Booking = {
  id: number;
  booking_number: string;
  user_id: number;
  child_id?: number;
  service_offering_id: number;
  service_name?: string;
  seller_id: number;
  seller_name?: string;
  provider_user_id?: number;
  care_location_id?: number;
  order_id?: number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: string;
  price_amount_snapshot: number;
  currency: string;
  notes?: string;
  cancellation_reason?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  payment_required: boolean;
  hold_expires_at?: string;
  refund_may_be_required: boolean;
  meeting?: BookingMeeting;
  created_at: string;
  updated_at: string;
};

export type BookingListResponse = { items: Booking[]; pagination: Pagination };

export type Payment = {
  id: number;
  order_id: number;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  authority?: string;
  transaction_reference?: string;
  redirect_url?: string;
  idempotency_key: string;
  requested_at: string;
  paid_at?: string;
  failed_at?: string;
  failure_code?: string;
  failure_message?: string;
  created_at: string;
  updated_at: string;
};

// Knowledge, search and discovery contracts — Backend v0.22.2.
export type KnowledgeCategory = {
  id: number;
  parent_id?: number;
  code: string;
  slug: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
};

export type KnowledgeTag = {
  id: number;
  code: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type KnowledgeContent = {
  id: number;
  content_type: "article" | "guide" | "faq" | "educational" | "checklist" | "reference" | "announcement" | string;
  slug: string;
  title: string;
  summary?: string;
  status: string;
  language: string;
  medical_review_required: boolean;
  featured_image_attachment_id?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
};
export type KnowledgeContentListResponse = { items: KnowledgeContent[]; pagination: Pagination };

export type KnowledgeRevision = {
  id: number;
  content_id: number;
  revision_number: number;
  title: string;
  summary?: string;
  body: string;
  review_status: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
};

export type KnowledgeSource = {
  id: number;
  title: string;
  publisher?: string;
  url?: string;
  publication_date?: string;
  accessed_at?: string;
  source_type: string;
};

export type KnowledgeFAQ = { id: number; question: string; answer: string; sort_order: number };
export type KnowledgeDisclaimer = { id: number; code: string; text: string };
export type KnowledgeMediaAsset = {
  id: number;
  content_id?: number;
  media_type: "image" | "video" | "audio" | "infographic" | string;
  title: string;
  alt_text?: string;
  asset_url?: string;
  thumbnail_url?: string;
  source_name?: string;
  source_url?: string;
  author?: string;
  license_code?: string;
  license_url?: string;
  attribution_text?: string;
  commercial_use_allowed: boolean;
  derivative_allowed: boolean;
  review_status: string;
  verified_at?: string;
  metadata?: Record<string, unknown>;
};
export type KnowledgeDetail = {
  content: KnowledgeContent;
  revision: KnowledgeRevision;
  categories: KnowledgeCategory[];
  tags: KnowledgeTag[];
  sources: KnowledgeSource[];
  faqs: KnowledgeFAQ[];
  disclaimers: KnowledgeDisclaimer[];
  media: KnowledgeMediaAsset[];
  audience?: { id?: number; content_id?: number; min_child_age_days?: number; max_child_age_days?: number; audience_type?: string } | null;
};

export type SearchEntityType = "knowledge_content" | "community_post" | "community_group" | "clinician" | "service" | "product" | "seller" | "care_location" | string;
export type SearchItem = {
  type: SearchEntityType;
  id: number;
  title: string;
  summary?: string;
  language: string;
  categories?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  score: number;
  published_at?: string;
};
export type SearchResponse = {
  query: string;
  normalized_query: string;
  page: number;
  limit: number;
  total: number;
  results: SearchItem[];
  facets: { entity_type: Record<string, number>; categories: Record<string, number> };
};
export type SearchSuggestionsResponse = { query: string; suggestions: string[] };
export type SearchHistory = { id: number; query: string; normalized_query: string; result_count: number; created_at: string; updated_at: string };
export type SearchTrend = { id: number; query: string; search_count: number; unique_users_approx: number; window_start: string; window_end: string; created_at: string; updated_at: string };

export type CareLocation = {
  id: number;
  name: string;
  type: "health_center" | "doctor_office" | "clinic" | "hospital" | "laboratory" | "pharmacy" | "imaging_center" | "dental_clinic" | "rehabilitation_center" | "mental_health_center" | "maternity_hospital" | "home" | "other" | string;
  country_id?: number;
  province_id?: number;
  city_id?: number;
  province?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  address?: string;
  postal_code?: string;
  phone?: string;
  website?: string;
  email?: string;
  specialties?: string[];
  services?: string[];
  search_aliases?: string[];
  emergency?: boolean;
  accepts_children?: boolean;
  min_child_age_days?: number;
  max_child_age_days?: number;
  notes?: string;
  source_name?: string;
  source_external_id?: string;
  source_url?: string;
  source_license?: string;
  last_verified_at?: string;
  directory_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type CareLocationListResponse = { items: CareLocation[]; pagination: Pagination };

export type PersonalizationFeedItem = {
  recommendation_id: number;
  entity_type: string;
  entity_id: number;
  title: string;
  summary?: string;
  score: number;
  reason_code: string;
  reason?: Record<string, unknown>;
  source_kind: string;
  metadata?: Record<string, unknown>;
};
export type PersonalizationFeedResponse = { items: PersonalizationFeedItem[]; experiment_variant?: string };

export type NotificationItem = {
  id: number;
  category: string;
  type: string;
  title: string;
  body: string;
  priority: string;
  channel: string;
  reference_type?: string;
  reference_id?: number;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  read_at?: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  pagination: Pagination;
};

export type NotificationPreference = {
  category: string;
  in_app_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  updated_at?: string;
};

export type UpdateNotificationPreferenceItem = {
  category: string;
  in_app_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
};

export type UpdateNotificationPreferencesRequest = {
  items: UpdateNotificationPreferenceItem[];
};


// Maternal health and clinician-approved child nutrition — Backend v0.25.0.
export type MaternalLifeStage = "menstrual" | "preconception" | "pregnancy" | "postpartum" | "breastfeeding" | "perimenopause" | "menopause";
export type MaternalProfile = {
  id: number; user_id: number; life_stage: MaternalLifeStage; first_period_date?: string; last_period_date?: string; last_delivery_date?: string; breastfeeding: boolean; notes?: string; created_at?: string; updated_at?: string;
};
export type MaternalCycle = { id: number; user_id: number; started_at: string; ended_at?: string; flow?: string; pain_level?: number; notes?: string; created_at?: string; updated_at?: string; };
export type BreastfeedingLog = { id: number; user_id: number; child_id?: number; started_at: string; duration_minutes?: number; side?: string; feeding_method: "breast" | "pumped_milk" | "mixed" | string; notes?: string; created_at?: string; };
export type MaternalCheckIn = { id: number; user_id: number; recorded_at: string; mood?: string; sleep_quality?: string; energy_level?: number; symptoms?: string[]; notes?: string; created_at?: string; };
export type MaternalGuidanceItem = { code: string; title: string; summary: string; actions: string[]; source_kind: string; safety_level: string; };
export type MaternalGuidanceResponse = { life_stage: MaternalLifeStage; generated_at: string; items: MaternalGuidanceItem[]; disclaimer: string; };
export type ChildNutritionRecommendation = {
  id: number; child_id: number; clinician_user_id: number; clinician_name: string; clinician_specialty?: string; recommendation_type: "food" | "vitamin" | "combined"; title: string; guidance: string; rationale?: string; follow_up_at?: string; status: "active" | "revoked" | string; child_snapshot?: Record<string, unknown>; source_type: "clinician" | string; verification_status: string; revoked_at?: string; revoke_reason?: string; created_at: string; updated_at: string;
};
export type ChildNutritionRecommendationListResponse = { items: ChildNutritionRecommendation[] };


export type AdminDashboard = {
  counts: Record<string, number>;
  privacy_note?: string;
};

export type AdminUser = {
  id: number; mobile: string; first_name: string; last_name: string; role: string; active: boolean; environment_managed: boolean;
  created_at: string; last_login_at?: string;
};
export type AdminUserList = { items: AdminUser[]; pagination: { page: number; limit: number; total: number } };

export type AdminProvider = {
  provider_type: "clinician" | "seller"; provider_id: number; user_id: number; name: string; mobile: string;
  category: string; verification_status: string; operational_status: string; city?: string; created_at: string;
};
export type AdminProviderList = { items: AdminProvider[]; pagination: { page: number; limit: number; total: number } };

export type AdminFinanceCurrency = {
  currency: string; paid_gross_amount: number; commission_amount: number; seller_receivable_amount: number;
  refunded_amount: number; pending_seller_balance: number; available_seller_balance: number;
};
export type AdminFinanceSummary = {
  currencies: AdminFinanceCurrency[]; paid_orders: number; total_orders: number; confirmed_bookings: number;
  completed_bookings: number; pending_refunds: number;
};

export type AdminKnowledgeContent = {
  id: number; content_type: string; slug: string; title: string; summary?: string; status: string; language: string;
  author_user_id: number; current_revision_id?: number; published_revision_id?: number; medical_review_required: boolean;
  published_at?: string; archived_at?: string; created_at: string; updated_at: string;
};
export type AdminKnowledgeList = { items: AdminKnowledgeContent[]; pagination: { page: number; limit: number; total: number } };

export type AdminKnowledgeCategory = KnowledgeCategory;
export type AdminKnowledgeTag = KnowledgeTag;
export type AdminMediaAsset = {
  id: number; content_id?: number; media_type: string; title: string; alt_text?: string; asset_url?: string; thumbnail_url?: string;
  storage_key?: string; original_file_name?: string; mime_type?: string; size_bytes?: number; uploaded_by_user_id?: number;
  source_name?: string; source_url?: string; author?: string; license_code?: string; license_url?: string; attribution_text?: string;
  commercial_use_allowed: boolean; derivative_allowed: boolean; review_status: string; verified_at?: string; metadata?: Record<string, unknown>;
  created_at: string; updated_at: string;
};
export type AdminMediaList = { items: AdminMediaAsset[]; pagination: Pagination };
export type AdminCareLocation = CareLocation;
export type AdminCareLocationList = CareLocationListResponse;

export type AdminAdvertiser = {
  id: number; name: string; legal_name?: string; contact_name: string; contact_mobile: string; contact_email?: string;
  website_url?: string; status: string; notes?: string; created_at: string; updated_at: string;
};
export type AdminAdCampaign = {
  id: number; advertiser_id: number; advertiser_name: string; name: string; objective: string; status: string;
  starts_at: string; ends_at: string; priority: number; frequency_cap_per_user: number; rejection_reason?: string;
  created_at: string; updated_at: string;
};
export type AdminList<T> = { items: T[]; pagination: Pagination };
export type AdminAdReport = { campaign_id: number; campaign_name: string; impressions: number; unique_impressions: number; clicks: number; unique_clicks: number; dismissals: number; conversions: number; ctr: number; average_frequency: number };

export type AdminCommunityReport = {
  id: number; reporter_user_id?: number; entity_type: string; entity_id: number; reason: string; description?: string; status: string;
  reviewed_by_user_id?: number; reviewed_at?: string; resolution?: string; is_system_generated: boolean; created_at: string;
};
export type AdminCommunityReportList = { items: AdminCommunityReport[]; pagination: Pagination };

export type AdminFeatureFlag = { id: number; code: string; name: string; description?: string; enabled: boolean; rollout_percent: number; updated_by_user_id?: number; updated_at: string };
export type AdminSystemSetting = { id: number; key: string; value: string; value_type: string; description?: string; is_public: boolean; updated_by_user_id?: number; updated_at: string };
export type AdminAuditEvent = { id: number; actor_user_id: number; action: string; entity_type?: string; entity_id?: string; metadata?: Record<string, unknown>; created_at: string };
