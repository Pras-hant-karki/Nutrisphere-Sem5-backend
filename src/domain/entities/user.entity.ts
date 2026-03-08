export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profilePicture?: string | null;
  image?: string | null;
  phone?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  bio: BioEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BioEntry {
  type: 'text' | 'image';
  content: string;
  createdAt: Date;
}