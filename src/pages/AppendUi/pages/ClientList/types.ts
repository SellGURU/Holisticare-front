export type Urgency = 'immediate' | 'monitor' | 'stable';
export type PlanStatus = 'active' | 'draft' | 'none';

export interface ClientEnrollment {
  program: string;
  startDate: string;
  week: number;
  totalWeeks: number;
}

export interface Client {
  id: string;
  memberId: number;
  name: string;
  picture?: string;
  gender: 'M' | 'F';
  age: number;
  urgency: Urgency;
  enrollment: ClientEnrollment;
  connectedApps: string[];
  category: string;
  planStatus: PlanStatus;
  lastCheckIn: number;
  assigned: string;
}

export interface ClientListResponse {
  items: Client[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}

export interface NewClientForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sex: string;
  ethnicity: string;
  practitioner: string;
  category: string;
  activeWeeks: string;
  unlimited: boolean;
}

export const EMPTY_NEW_CLIENT: NewClientForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  sex: '',
  ethnicity: '',
  practitioner: '',
  category: '',
  activeWeeks: '',
  unlimited: false,
};

export type SortCol = 'name' | 'urgency' | 'lastCheckIn' | 'category';
export type SortDir = 'asc' | 'desc';
