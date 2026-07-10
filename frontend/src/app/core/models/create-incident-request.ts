import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus
} from './incident';

export interface CreateIncidentRequest {
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: IncidentCategory;
  location: string;
}