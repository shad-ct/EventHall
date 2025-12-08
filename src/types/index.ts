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
  firebaseUid: string;
  email: string;
  fullName: string;
  photoUrl?: string;
  role: 'STANDARD_USER' | 'EVENT_ADMIN' | 'ULTIMATE_ADMIN' | 'GUEST';
  isStudent: boolean | null;
  collegeName?: string | null;
  interests: UserInterest[];
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
  entryFee?: string;
  isFree: boolean;
  prizeDetails?: string;
  contactEmail: string;
  contactPhone: string;
  externalRegistrationLink?: string;
  howToRegisterLink?: string;
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
