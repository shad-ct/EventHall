export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface UserInterest {
  id: string;
  category: EventCategory;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  photoUrl?: string;
  role: 'STANDARD_USER' | 'EVENT_ADMIN' | 'ULTIMATE_ADMIN' | 'GUEST';
  isStudent: boolean | null;
  collegeName?: string | null;
  interests: UserInterest[];
}

export interface RegistrationFormQuestion {
  id: string;
  eventId: string;
  questionCategory: string;
  questionKey: string;
  questionText: string;
  questionType: 'text' | 'email' | 'dropdown' | 'textarea' | 'url' | 'yes/no' | 'multi-select';
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
  isCustom: boolean;
}

export interface RegistrationFormResponse {
  id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  questionId: string;
  answer: string;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  registrationType: 'EXTERNAL' | 'FORM';
  createdAt: string;
  formResponses?: RegistrationFormResponse[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  district: string;
  googleMapsLink?: string;
  primaryCategory: EventCategory;
  additionalCategories?: Array<{ category: EventCategory }>;
  brochureFiles?: Array<{ name: string; url: string }>;
  posterImages?: Array<{ name: string; url: string }>;
  socialLinks?: Array<{ url: string; label?: string }>;
  entryFee?: string;
  isFree: boolean;
  prizeDetails?: string;
  contactEmail: string;
  contactPhone: string;
  externalRegistrationLink?: string;
  howToRegisterLink?: string;
  registrationMethod?: 'EXTERNAL' | 'FORM';
  registrationFormQuestions?: RegistrationFormQuestion[];
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  bannerUrl?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  isFeatured?: boolean;
  featuredAt?: string;
  featuredBy?: string;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    likes: number;
    registrations: number;
  };
}

export interface AdminApplication {
  id: string;
  userId: string;
  motivationText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    photoUrl?: string;
    isStudent: boolean;
    collegeName?: string;
  };
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}
