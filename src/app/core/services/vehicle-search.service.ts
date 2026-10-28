import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/paged-result.model';
import { AvailabilityDto, VehicleSearchRequest, VehicleSearchResultDto } from '../models/vehicle-search.models';
import { toHttpParams } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class VehicleSearchService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vehicles`;

  search(request: VehicleSearchRequest) {
    return this.http.get<PagedResult<VehicleSearchResultDto>>(`${this.base}/search`, {
      params: toHttpParams(request)
    });
  }

  // from / to: UTC ISO strings
  checkAvailability(vehicleId: number, from: string, to: string) {
    return this.http.get<AvailabilityDto>(`${this.base}/${vehicleId}/availability`, {
      params: toHttpParams({ from, to })
    });
  }
}