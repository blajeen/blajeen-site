export const PROJECT_TYPES = ['ECOMMERCE', 'BARBERSHOP', 'PERSONAL_TRAINER', 'BEAUTY_STUDIO'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const ONBOARDING_STATUSES = [
  'WAITING_FOR_CUSTOMER',
  'IN_PROGRESS',
  'SUBMITTED',
  'CHANGES_REQUESTED',
  'APPROVED',
  'IMPLEMENTING',
  'PUBLISHED',
  'ARCHIVED',
] as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type AnswerMap = Record<string, JsonValue>;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'cpfCnpj'
  | 'cep'
  | 'url'
  | 'domain'
  | 'color'
  | 'select'
  | 'toggle'
  | 'checklist'
  | 'hours'
  | 'repeater'
  | 'file'
  | 'files';

export type FieldCondition = { field: string; equals?: JsonValue; includes?: string };

export type OnboardingField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: readonly string[];
  accept?: 'image' | 'logo' | 'document' | 'image-or-document';
  maxFiles?: number;
  minItems?: number;
  fields?: readonly OnboardingField[];
  condition?: FieldCondition;
};

export type OnboardingSection = {
  key: string;
  title: string;
  description: string;
  fields: readonly OnboardingField[];
};

export type OnboardingSchema = {
  version: number;
  projectType: ProjectType;
  title: string;
  description: string;
  sections: readonly OnboardingSection[];
};

export type OnboardingProject = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  projectType: ProjectType;
  status: OnboardingStatus;
  tokenHash: string;
  tokenEncrypted: string;
  tokenExpiresAt: string;
  tokenRevokedAt: string | null;
  progress: number;
  currentStep: number;
  assignedTo: string | null;
  sourceOrderId: string | null;
  sourceOrderItemId: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  schemaVersion: number;
};

export type OnboardingAsset = {
  id: string;
  projectId: string;
  slot: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
  sortOrder: number;
  consentConfirmed: boolean;
  createdAt: string;
};

export type ReviewStatus = 'OPEN' | 'RESOLVED';
export type OnboardingReview = {
  id: string;
  projectId: string;
  section: string;
  field: string | null;
  message: string;
  status: ReviewStatus;
  author: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type OnboardingEvent = {
  id: string;
  projectId: string;
  type: string;
  actor: string;
  metadata: Record<string, JsonValue>;
  createdAt: string;
};

export type OnboardingBundle = {
  project: OnboardingProject;
  answers: AnswerMap;
  assets: OnboardingAsset[];
  reviews: OnboardingReview[];
  events: OnboardingEvent[];
};

export type CreateOnboardingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  projectType: ProjectType;
  assignedTo?: string | null;
  tokenExpiresAt?: string;
  sourceOrderId?: string | null;
  sourceOrderItemId?: string | null;
};

