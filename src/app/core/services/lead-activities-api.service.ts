import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityCode, FollowUpPage, LeadActivity, LeadActivityPage, LeadActivityWrite, RecentActivity, StatusHistory } from '../models/lead-activity.model';

interface ApiResponse<T>{success:boolean;message:string;data:T;}
interface ActivityOptions {activityTypes:ActivityCode[];outcomes:ActivityCode[];}
@Injectable({providedIn:'root'})
export class LeadActivitiesApiService {
  private readonly http=inject(HttpClient);
  private readonly base=environment.apiBaseUrl.replace(/\/$/,'');
  options():Observable<ActivityOptions>{return this.get(`${this.base}/lead-activities/options`);}
  timeline(leadId:number,pageNumber=1,pageSize=20):Observable<LeadActivityPage>{return this.get(`${this.base}/business-leads/${leadId}/activities`,new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize));}
  history(leadId:number,pageNumber=1,pageSize=20):Observable<{items:StatusHistory[];pageNumber:number;pageSize:number;totalCount:number;totalPages:number}>{return this.get(`${this.base}/business-leads/${leadId}/status-history`,new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize));}
  add(leadId:number,request:LeadActivityWrite):Observable<LeadActivity>{return this.http.post<ApiResponse<LeadActivity>>(`${this.base}/business-leads/${leadId}/activities`,request).pipe(map(r=>this.unwrap(r)));}
  update(id:number,request:LeadActivityWrite):Observable<LeadActivity>{return this.http.put<ApiResponse<LeadActivity>>(`${this.base}/lead-activities/${id}`,request).pipe(map(r=>this.unwrap(r)));}
  delete(id:number):Observable<unknown>{return this.http.delete<ApiResponse<unknown>>(`${this.base}/lead-activities/${id}`).pipe(map(r=>this.unwrap(r)));}
  complete(id:number):Observable<unknown>{return this.http.patch<ApiResponse<unknown>>(`${this.base}/lead-activities/${id}/complete`,{}).pipe(map(r=>this.unwrap(r)));}
  followUps(status?:string,pageNumber=1,pageSize=20):Observable<FollowUpPage>{let p=new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);if(status)p=p.set('followUpStatus',status);return this.get(`${this.base}/lead-activities/follow-ups`,p);}
  recent(pageNumber=1,pageSize=10):Observable<{items:RecentActivity[];pageNumber:number;pageSize:number;totalCount:number;totalPages:number}>{return this.get(`${this.base}/lead-activities/recent`,new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize));}
  message(error:unknown):string{if(error instanceof HttpErrorResponse){const body=error.error as {message?:string;data?:Record<string,string[]>}|null;return body?.data?Object.values(body.data).flat().join(' '):body?.message??(error.status===0?'Lead activity API is unavailable at http://localhost:5080.':`Activity request failed (HTTP ${error.status}).`);}return error instanceof Error?error.message:'Activity request failed.';}
  private get<T>(url:string,params?:HttpParams):Observable<T>{return this.http.get<ApiResponse<T>>(url,{params}).pipe(map(r=>this.unwrap(r)));}
  private unwrap<T>(response:ApiResponse<T>):T{if(!response.success)throw new Error(response.message||'Activity request failed.');return response.data;}
}
