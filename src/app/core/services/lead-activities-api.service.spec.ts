import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { LeadActivitiesApiService } from './lead-activities-api.service';

describe('LeadActivitiesApiService',()=>{
  let http:HttpTestingController;let api:LeadActivitiesApiService;
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});http=TestBed.inject(HttpTestingController);api=TestBed.inject(LeadActivitiesApiService);});
  afterEach(()=>http.verify());
  it('posts activity details to the selected lead route and unwraps the envelope',()=>{
    const request={activityTypeCode:'CALL',subject:'Intro',description:null,outcomeCode:'INTERESTED',activityAt:'2026-11-05T10:00:00.000Z',followUpAt:null};
    let result:unknown;api.add(17,request).subscribe(value=>result=value);
    const call=http.expectOne(environment.apiBaseUrl+'/business-leads/17/activities');
    expect(call.request.method).toBe('POST');expect(call.request.body).toEqual(request);
    call.flush({success:true,message:'ok',data:{id:4,...request,businessLeadId:17}});
    expect(result).toMatchObject({id:4,businessLeadId:17,activityTypeCode:'CALL'});
  });
  it('requests a filtered follow-up page',()=>{
    api.followUps('OVERDUE',2,10).subscribe();
    const request=http.expectOne(r=>r.url===environment.apiBaseUrl+'/lead-activities/follow-ups');
    expect(request.request.params.get('followUpStatus')).toBe('OVERDUE');expect(request.request.params.get('pageNumber')).toBe('2');
    request.flush({success:true,message:'ok',data:{items:[],pageNumber:2,pageSize:10,totalCount:0,totalPages:0}});
  });
});
