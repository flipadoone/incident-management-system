import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response';
import { IncidentStats } from '../models/incident-stats';

@Injectable({
  providedIn: 'root'
})
export class IncidentStatsService {
  private readonly apiUrl =
    'http://localhost:8080/api/v1/stats/incidents';

  constructor(
    private readonly http: HttpClient
  ) {}

  getStats(): Observable<ApiResponse<IncidentStats>> {
    return this.http.get<ApiResponse<IncidentStats>>(
      this.apiUrl
    );
  }
}