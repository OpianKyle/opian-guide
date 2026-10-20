import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminAdvisor, AdminAdvisorInput, AdminAdvisorUpdate, AdminDashboard, AdminFnaUpdate, AdminLoginInput, AdminSession, AdminUser, AdminUserInput, AdminUserUpdate, Advisor, Appointment, AppointmentInput, AppointmentUpdate, Client, DashboardSummary, Document, DocumentInput, DocumentUpdate, FnaInput, FnaStatusUpdate, FnaSubmission, HealthStatus, LeadCreateResponse, LeadInput, Policy, PolicyInput, PolicyUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardSummaryUrl: () => string;
/**
 * @summary Dashboard summary stats
 */
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Dashboard summary stats
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdvisorLeadUrl: () => string;
/**
 * @summary Create a lead assigned to the authenticated advisor
 */
export declare const createAdvisorLead: (leadInput: LeadInput, options?: RequestInit) => Promise<LeadCreateResponse>;
export declare const getCreateAdvisorLeadMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdvisorLead>>, TError, {
        data: BodyType<LeadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdvisorLead>>, TError, {
    data: BodyType<LeadInput>;
}, TContext>;
export type CreateAdvisorLeadMutationResult = NonNullable<Awaited<ReturnType<typeof createAdvisorLead>>>;
export type CreateAdvisorLeadMutationBody = BodyType<LeadInput>;
export type CreateAdvisorLeadMutationError = ErrorType<void>;
/**
* @summary Create a lead assigned to the authenticated advisor
*/
export declare const useCreateAdvisorLead: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdvisorLead>>, TError, {
        data: BodyType<LeadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdvisorLead>>, TError, {
    data: BodyType<LeadInput>;
}, TContext>;
export declare const getCreateAdminLeadUrl: () => string;
/**
 * @summary Create a lead from the admin portal
 */
export declare const createAdminLead: (leadInput: LeadInput, options?: RequestInit) => Promise<LeadCreateResponse>;
export declare const getCreateAdminLeadMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminLead>>, TError, {
        data: BodyType<LeadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdminLead>>, TError, {
    data: BodyType<LeadInput>;
}, TContext>;
export type CreateAdminLeadMutationResult = NonNullable<Awaited<ReturnType<typeof createAdminLead>>>;
export type CreateAdminLeadMutationBody = BodyType<LeadInput>;
export type CreateAdminLeadMutationError = ErrorType<void>;
/**
* @summary Create a lead from the admin portal
*/
export declare const useCreateAdminLead: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminLead>>, TError, {
        data: BodyType<LeadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdminLead>>, TError, {
    data: BodyType<LeadInput>;
}, TContext>;
export declare const getListFnaSubmissionsUrl: () => string;
/**
 * @summary List FNA submissions
 */
export declare const listFnaSubmissions: (options?: RequestInit) => Promise<FnaSubmission[]>;
export declare const getListFnaSubmissionsQueryKey: () => readonly ["/api/fna"];
export declare const getListFnaSubmissionsQueryOptions: <TData = Awaited<ReturnType<typeof listFnaSubmissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFnaSubmissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFnaSubmissions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFnaSubmissionsQueryResult = NonNullable<Awaited<ReturnType<typeof listFnaSubmissions>>>;
export type ListFnaSubmissionsQueryError = ErrorType<unknown>;
/**
 * @summary List FNA submissions
 */
export declare function useListFnaSubmissions<TData = Awaited<ReturnType<typeof listFnaSubmissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFnaSubmissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFnaSubmissionUrl: () => string;
/**
 * @summary Submit a new FNA
 */
export declare const createFnaSubmission: (fnaInput: FnaInput, options?: RequestInit) => Promise<FnaSubmission>;
export declare const getCreateFnaSubmissionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFnaSubmission>>, TError, {
        data: BodyType<FnaInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFnaSubmission>>, TError, {
    data: BodyType<FnaInput>;
}, TContext>;
export type CreateFnaSubmissionMutationResult = NonNullable<Awaited<ReturnType<typeof createFnaSubmission>>>;
export type CreateFnaSubmissionMutationBody = BodyType<FnaInput>;
export type CreateFnaSubmissionMutationError = ErrorType<unknown>;
/**
* @summary Submit a new FNA
*/
export declare const useCreateFnaSubmission: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFnaSubmission>>, TError, {
        data: BodyType<FnaInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFnaSubmission>>, TError, {
    data: BodyType<FnaInput>;
}, TContext>;
export declare const getGetFnaSubmissionUrl: (id: number) => string;
/**
 * @summary Get a single FNA submission
 */
export declare const getFnaSubmission: (id: number, options?: RequestInit) => Promise<FnaSubmission>;
export declare const getGetFnaSubmissionQueryKey: (id: number) => readonly [`/api/fna/${number}`];
export declare const getGetFnaSubmissionQueryOptions: <TData = Awaited<ReturnType<typeof getFnaSubmission>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFnaSubmission>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFnaSubmission>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFnaSubmissionQueryResult = NonNullable<Awaited<ReturnType<typeof getFnaSubmission>>>;
export type GetFnaSubmissionQueryError = ErrorType<void>;
/**
 * @summary Get a single FNA submission
 */
export declare function useGetFnaSubmission<TData = Awaited<ReturnType<typeof getFnaSubmission>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFnaSubmission>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateFnaStatusUrl: (id: number) => string;
/**
 * @summary Update FNA status
 */
export declare const updateFnaStatus: (id: number, fnaStatusUpdate: FnaStatusUpdate, options?: RequestInit) => Promise<FnaSubmission>;
export declare const getUpdateFnaStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFnaStatus>>, TError, {
        id: number;
        data: BodyType<FnaStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFnaStatus>>, TError, {
    id: number;
    data: BodyType<FnaStatusUpdate>;
}, TContext>;
export type UpdateFnaStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateFnaStatus>>>;
export type UpdateFnaStatusMutationBody = BodyType<FnaStatusUpdate>;
export type UpdateFnaStatusMutationError = ErrorType<unknown>;
/**
* @summary Update FNA status
*/
export declare const useUpdateFnaStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFnaStatus>>, TError, {
        id: number;
        data: BodyType<FnaStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFnaStatus>>, TError, {
    id: number;
    data: BodyType<FnaStatusUpdate>;
}, TContext>;
export declare const getListPoliciesUrl: () => string;
/**
 * @summary List client policies
 */
export declare const listPolicies: (options?: RequestInit) => Promise<Policy[]>;
export declare const getListPoliciesQueryKey: () => readonly ["/api/policies"];
export declare const getListPoliciesQueryOptions: <TData = Awaited<ReturnType<typeof listPolicies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPolicies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPolicies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPoliciesQueryResult = NonNullable<Awaited<ReturnType<typeof listPolicies>>>;
export type ListPoliciesQueryError = ErrorType<unknown>;
/**
 * @summary List client policies
 */
export declare function useListPolicies<TData = Awaited<ReturnType<typeof listPolicies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPolicies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAppointmentsUrl: () => string;
/**
 * @summary List appointments
 */
export declare const listAppointments: (options?: RequestInit) => Promise<Appointment[]>;
export declare const getListAppointmentsQueryKey: () => readonly ["/api/appointments"];
export declare const getListAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listAppointments>>>;
export type ListAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List appointments
 */
export declare function useListAppointments<TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAppointmentUrl: () => string;
/**
 * @summary Book an appointment
 */
export declare const createAppointment: (appointmentInput: AppointmentInput, options?: RequestInit) => Promise<Appointment>;
export declare const getCreateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export type CreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAppointment>>>;
export type CreateAppointmentMutationBody = BodyType<AppointmentInput>;
export type CreateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Book an appointment
*/
export declare const useCreateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export declare const getListDocumentsUrl: () => string;
/**
 * @summary List documents
 */
export declare const listDocuments: (options?: RequestInit) => Promise<Document[]>;
export declare const getListDocumentsQueryKey: () => readonly ["/api/documents"];
export declare const getListDocumentsQueryOptions: <TData = Awaited<ReturnType<typeof listDocuments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDocumentsQueryResult = NonNullable<Awaited<ReturnType<typeof listDocuments>>>;
export type ListDocumentsQueryError = ErrorType<unknown>;
/**
 * @summary List documents
 */
export declare function useListDocuments<TData = Awaited<ReturnType<typeof listDocuments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUploadDocumentUrl: () => string;
/**
 * @summary Upload a document record
 */
export declare const uploadDocument: (documentInput: DocumentInput, options?: RequestInit) => Promise<Document>;
export declare const getUploadDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadDocument>>, TError, {
        data: BodyType<DocumentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadDocument>>, TError, {
    data: BodyType<DocumentInput>;
}, TContext>;
export type UploadDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof uploadDocument>>>;
export type UploadDocumentMutationBody = BodyType<DocumentInput>;
export type UploadDocumentMutationError = ErrorType<unknown>;
/**
* @summary Upload a document record
*/
export declare const useUploadDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadDocument>>, TError, {
        data: BodyType<DocumentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadDocument>>, TError, {
    data: BodyType<DocumentInput>;
}, TContext>;
export declare const getListAdvisorsUrl: () => string;
/**
 * @summary List financial advisors
 */
export declare const listAdvisors: (options?: RequestInit) => Promise<Advisor[]>;
export declare const getListAdvisorsQueryKey: () => readonly ["/api/advisors"];
export declare const getListAdvisorsQueryOptions: <TData = Awaited<ReturnType<typeof listAdvisors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdvisors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdvisors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdvisorsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdvisors>>>;
export type ListAdvisorsQueryError = ErrorType<unknown>;
/**
 * @summary List financial advisors
 */
export declare function useListAdvisors<TData = Awaited<ReturnType<typeof listAdvisors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdvisors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdvisorUrl: (id: number) => string;
/**
 * @summary Get a specific advisor
 */
export declare const getAdvisor: (id: number, options?: RequestInit) => Promise<Advisor>;
export declare const getGetAdvisorQueryKey: (id: number) => readonly [`/api/advisors/${number}`];
export declare const getGetAdvisorQueryOptions: <TData = Awaited<ReturnType<typeof getAdvisor>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdvisor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdvisor>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdvisorQueryResult = NonNullable<Awaited<ReturnType<typeof getAdvisor>>>;
export type GetAdvisorQueryError = ErrorType<void>;
/**
 * @summary Get a specific advisor
 */
export declare function useGetAdvisor<TData = Awaited<ReturnType<typeof getAdvisor>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdvisor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminGetSessionUrl: () => string;
/**
 * @summary Get current admin session
 */
export declare const adminGetSession: (options?: RequestInit) => Promise<AdminSession>;
export declare const getAdminGetSessionQueryKey: () => readonly ["/api/admin/auth/session"];
export declare const getAdminGetSessionQueryOptions: <TData = Awaited<ReturnType<typeof adminGetSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetSession>>>;
export type AdminGetSessionQueryError = ErrorType<unknown>;
/**
 * @summary Get current admin session
 */
export declare function useAdminGetSession<TData = Awaited<ReturnType<typeof adminGetSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminLoginUrl: () => string;
/**
 * @summary Admin login
 */
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: RequestInit) => Promise<AdminSession>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<void>;
/**
* @summary Admin login
*/
export declare const useAdminLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export declare const getAdminLogoutUrl: () => string;
/**
 * @summary Admin logout
 */
export declare const adminLogout: (options?: RequestInit) => Promise<void>;
export declare const getAdminLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
export type AdminLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogout>>>;
export type AdminLogoutMutationError = ErrorType<unknown>;
/**
* @summary Admin logout
*/
export declare const useAdminLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogout>>, TError, void, TContext>;
export declare const getAdminGetDashboardUrl: () => string;
/**
 * @summary Platform-wide admin dashboard stats
 */
export declare const adminGetDashboard: (options?: RequestInit) => Promise<AdminDashboard>;
export declare const getAdminGetDashboardQueryKey: () => readonly ["/api/admin/dashboard"];
export declare const getAdminGetDashboardQueryOptions: <TData = Awaited<ReturnType<typeof adminGetDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetDashboard>>>;
export type AdminGetDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Platform-wide admin dashboard stats
 */
export declare function useAdminGetDashboard<TData = Awaited<ReturnType<typeof adminGetDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminListAdvisorsUrl: () => string;
/**
 * @summary List all advisors
 */
export declare const adminListAdvisors: (options?: RequestInit) => Promise<AdminAdvisor[]>;
export declare const getAdminListAdvisorsQueryKey: () => readonly ["/api/admin/advisors"];
export declare const getAdminListAdvisorsQueryOptions: <TData = Awaited<ReturnType<typeof adminListAdvisors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAdvisors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListAdvisors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListAdvisorsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListAdvisors>>>;
export type AdminListAdvisorsQueryError = ErrorType<unknown>;
/**
 * @summary List all advisors
 */
export declare function useAdminListAdvisors<TData = Awaited<ReturnType<typeof adminListAdvisors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAdvisors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminCreateAdvisorUrl: () => string;
/**
 * @summary Create a new advisor
 */
export declare const adminCreateAdvisor: (adminAdvisorInput: AdminAdvisorInput, options?: RequestInit) => Promise<AdminAdvisor>;
export declare const getAdminCreateAdvisorMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdvisor>>, TError, {
        data: BodyType<AdminAdvisorInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdvisor>>, TError, {
    data: BodyType<AdminAdvisorInput>;
}, TContext>;
export type AdminCreateAdvisorMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateAdvisor>>>;
export type AdminCreateAdvisorMutationBody = BodyType<AdminAdvisorInput>;
export type AdminCreateAdvisorMutationError = ErrorType<unknown>;
/**
* @summary Create a new advisor
*/
export declare const useAdminCreateAdvisor: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdvisor>>, TError, {
        data: BodyType<AdminAdvisorInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateAdvisor>>, TError, {
    data: BodyType<AdminAdvisorInput>;
}, TContext>;
export declare const getAdminGetAdvisorUrl: (id: number) => string;
/**
 * @summary Get advisor details
 */
export declare const adminGetAdvisor: (id: number, options?: RequestInit) => Promise<AdminAdvisor>;
export declare const getAdminGetAdvisorQueryKey: (id: number) => readonly [`/api/admin/advisors/${number}`];
export declare const getAdminGetAdvisorQueryOptions: <TData = Awaited<ReturnType<typeof adminGetAdvisor>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetAdvisor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetAdvisor>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetAdvisorQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetAdvisor>>>;
export type AdminGetAdvisorQueryError = ErrorType<void>;
/**
 * @summary Get advisor details
 */
export declare function useAdminGetAdvisor<TData = Awaited<ReturnType<typeof adminGetAdvisor>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetAdvisor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminUpdateAdvisorUrl: (id: number) => string;
/**
 * @summary Update advisor
 */
export declare const adminUpdateAdvisor: (id: number, adminAdvisorUpdate: AdminAdvisorUpdate, options?: RequestInit) => Promise<AdminAdvisor>;
export declare const getAdminUpdateAdvisorMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdvisor>>, TError, {
        id: number;
        data: BodyType<AdminAdvisorUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdvisor>>, TError, {
    id: number;
    data: BodyType<AdminAdvisorUpdate>;
}, TContext>;
export type AdminUpdateAdvisorMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateAdvisor>>>;
export type AdminUpdateAdvisorMutationBody = BodyType<AdminAdvisorUpdate>;
export type AdminUpdateAdvisorMutationError = ErrorType<unknown>;
/**
* @summary Update advisor
*/
export declare const useAdminUpdateAdvisor: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdvisor>>, TError, {
        id: number;
        data: BodyType<AdminAdvisorUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateAdvisor>>, TError, {
    id: number;
    data: BodyType<AdminAdvisorUpdate>;
}, TContext>;
export declare const getAdminDeleteAdvisorUrl: (id: number) => string;
/**
 * @summary Delete advisor
 */
export declare const adminDeleteAdvisor: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteAdvisorMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdvisor>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdvisor>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteAdvisorMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteAdvisor>>>;
export type AdminDeleteAdvisorMutationError = ErrorType<unknown>;
/**
* @summary Delete advisor
*/
export declare const useAdminDeleteAdvisor: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdvisor>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteAdvisor>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListAdminsUrl: () => string;
/**
 * @summary List admin users (super_admin only)
 */
export declare const adminListAdmins: (options?: RequestInit) => Promise<AdminUser[]>;
export declare const getAdminListAdminsQueryKey: () => readonly ["/api/admin/admins"];
export declare const getAdminListAdminsQueryOptions: <TData = Awaited<ReturnType<typeof adminListAdmins>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAdmins>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListAdmins>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListAdminsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListAdmins>>>;
export type AdminListAdminsQueryError = ErrorType<unknown>;
/**
 * @summary List admin users (super_admin only)
 */
export declare function useAdminListAdmins<TData = Awaited<ReturnType<typeof adminListAdmins>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAdmins>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminCreateAdminUrl: () => string;
/**
 * @summary Create admin user (super_admin only)
 */
export declare const adminCreateAdmin: (adminUserInput: AdminUserInput, options?: RequestInit) => Promise<AdminUser>;
export declare const getAdminCreateAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdmin>>, TError, {
        data: BodyType<AdminUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdmin>>, TError, {
    data: BodyType<AdminUserInput>;
}, TContext>;
export type AdminCreateAdminMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateAdmin>>>;
export type AdminCreateAdminMutationBody = BodyType<AdminUserInput>;
export type AdminCreateAdminMutationError = ErrorType<unknown>;
/**
* @summary Create admin user (super_admin only)
*/
export declare const useAdminCreateAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAdmin>>, TError, {
        data: BodyType<AdminUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateAdmin>>, TError, {
    data: BodyType<AdminUserInput>;
}, TContext>;
export declare const getAdminUpdateAdminUrl: (id: number) => string;
/**
 * @summary Update admin user (super_admin only)
 */
export declare const adminUpdateAdmin: (id: number, adminUserUpdate: AdminUserUpdate, options?: RequestInit) => Promise<AdminUser>;
export declare const getAdminUpdateAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdmin>>, TError, {
        id: number;
        data: BodyType<AdminUserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdmin>>, TError, {
    id: number;
    data: BodyType<AdminUserUpdate>;
}, TContext>;
export type AdminUpdateAdminMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateAdmin>>>;
export type AdminUpdateAdminMutationBody = BodyType<AdminUserUpdate>;
export type AdminUpdateAdminMutationError = ErrorType<unknown>;
/**
* @summary Update admin user (super_admin only)
*/
export declare const useAdminUpdateAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAdmin>>, TError, {
        id: number;
        data: BodyType<AdminUserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateAdmin>>, TError, {
    id: number;
    data: BodyType<AdminUserUpdate>;
}, TContext>;
export declare const getAdminDeleteAdminUrl: (id: number) => string;
/**
 * @summary Delete admin user (super_admin only)
 */
export declare const adminDeleteAdmin: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdmin>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdmin>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteAdminMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteAdmin>>>;
export type AdminDeleteAdminMutationError = ErrorType<unknown>;
/**
* @summary Delete admin user (super_admin only)
*/
export declare const useAdminDeleteAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAdmin>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteAdmin>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListFnaUrl: () => string;
/**
 * @summary List all FNA submissions
 */
export declare const adminListFna: (options?: RequestInit) => Promise<FnaSubmission[]>;
export declare const getAdminListFnaQueryKey: () => readonly ["/api/admin/fna"];
export declare const getAdminListFnaQueryOptions: <TData = Awaited<ReturnType<typeof adminListFna>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListFna>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListFna>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListFnaQueryResult = NonNullable<Awaited<ReturnType<typeof adminListFna>>>;
export type AdminListFnaQueryError = ErrorType<unknown>;
/**
 * @summary List all FNA submissions
 */
export declare function useAdminListFna<TData = Awaited<ReturnType<typeof adminListFna>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListFna>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminGetFnaUrl: (id: number) => string;
/**
 * @summary Get FNA submission details
 */
export declare const adminGetFna: (id: number, options?: RequestInit) => Promise<FnaSubmission>;
export declare const getAdminGetFnaQueryKey: (id: number) => readonly [`/api/admin/fna/${number}`];
export declare const getAdminGetFnaQueryOptions: <TData = Awaited<ReturnType<typeof adminGetFna>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetFna>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetFna>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetFnaQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetFna>>>;
export type AdminGetFnaQueryError = ErrorType<void>;
/**
 * @summary Get FNA submission details
 */
export declare function useAdminGetFna<TData = Awaited<ReturnType<typeof adminGetFna>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetFna>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminUpdateFnaUrl: (id: number) => string;
/**
 * @summary Update FNA (status, advisor assignment, notes)
 */
export declare const adminUpdateFna: (id: number, adminFnaUpdate: AdminFnaUpdate, options?: RequestInit) => Promise<FnaSubmission>;
export declare const getAdminUpdateFnaMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateFna>>, TError, {
        id: number;
        data: BodyType<AdminFnaUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateFna>>, TError, {
    id: number;
    data: BodyType<AdminFnaUpdate>;
}, TContext>;
export type AdminUpdateFnaMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateFna>>>;
export type AdminUpdateFnaMutationBody = BodyType<AdminFnaUpdate>;
export type AdminUpdateFnaMutationError = ErrorType<unknown>;
/**
* @summary Update FNA (status, advisor assignment, notes)
*/
export declare const useAdminUpdateFna: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateFna>>, TError, {
        id: number;
        data: BodyType<AdminFnaUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateFna>>, TError, {
    id: number;
    data: BodyType<AdminFnaUpdate>;
}, TContext>;
export declare const getAdminDeleteFnaUrl: (id: number) => string;
/**
 * @summary Delete FNA submission
 */
export declare const adminDeleteFna: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteFnaMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFna>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFna>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteFnaMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteFna>>>;
export type AdminDeleteFnaMutationError = ErrorType<unknown>;
/**
* @summary Delete FNA submission
*/
export declare const useAdminDeleteFna: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteFna>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteFna>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListAppointmentsUrl: () => string;
/**
 * @summary List all appointments
 */
export declare const adminListAppointments: (options?: RequestInit) => Promise<Appointment[]>;
export declare const getAdminListAppointmentsQueryKey: () => readonly ["/api/admin/appointments"];
export declare const getAdminListAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof adminListAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListAppointments>>>;
export type AdminListAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List all appointments
 */
export declare function useAdminListAppointments<TData = Awaited<ReturnType<typeof adminListAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminCreateAppointmentUrl: () => string;
/**
 * @summary Create appointment
 */
export declare const adminCreateAppointment: (appointmentInput: AppointmentInput, options?: RequestInit) => Promise<Appointment>;
export declare const getAdminCreateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreateAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export type AdminCreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreateAppointment>>>;
export type AdminCreateAppointmentMutationBody = BodyType<AppointmentInput>;
export type AdminCreateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Create appointment
*/
export declare const useAdminCreateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreateAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreateAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export declare const getAdminUpdateAppointmentUrl: (id: number) => string;
/**
 * @summary Update appointment
 */
export declare const adminUpdateAppointment: (id: number, appointmentUpdate: AppointmentUpdate, options?: RequestInit) => Promise<Appointment>;
export declare const getAdminUpdateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentUpdate>;
}, TContext>;
export type AdminUpdateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateAppointment>>>;
export type AdminUpdateAppointmentMutationBody = BodyType<AppointmentUpdate>;
export type AdminUpdateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Update appointment
*/
export declare const useAdminUpdateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentUpdate>;
}, TContext>;
export declare const getAdminDeleteAppointmentUrl: (id: number) => string;
/**
 * @summary Delete appointment
 */
export declare const adminDeleteAppointment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAppointment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAppointment>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteAppointment>>>;
export type AdminDeleteAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Delete appointment
*/
export declare const useAdminDeleteAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteAppointment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteAppointment>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListPoliciesUrl: () => string;
/**
 * @summary List all policies
 */
export declare const adminListPolicies: (options?: RequestInit) => Promise<Policy[]>;
export declare const getAdminListPoliciesQueryKey: () => readonly ["/api/admin/policies"];
export declare const getAdminListPoliciesQueryOptions: <TData = Awaited<ReturnType<typeof adminListPolicies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListPolicies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListPolicies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListPoliciesQueryResult = NonNullable<Awaited<ReturnType<typeof adminListPolicies>>>;
export type AdminListPoliciesQueryError = ErrorType<unknown>;
/**
 * @summary List all policies
 */
export declare function useAdminListPolicies<TData = Awaited<ReturnType<typeof adminListPolicies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListPolicies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminCreatePolicyUrl: () => string;
/**
 * @summary Create policy
 */
export declare const adminCreatePolicy: (policyInput: PolicyInput, options?: RequestInit) => Promise<Policy>;
export declare const getAdminCreatePolicyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreatePolicy>>, TError, {
        data: BodyType<PolicyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminCreatePolicy>>, TError, {
    data: BodyType<PolicyInput>;
}, TContext>;
export type AdminCreatePolicyMutationResult = NonNullable<Awaited<ReturnType<typeof adminCreatePolicy>>>;
export type AdminCreatePolicyMutationBody = BodyType<PolicyInput>;
export type AdminCreatePolicyMutationError = ErrorType<unknown>;
/**
* @summary Create policy
*/
export declare const useAdminCreatePolicy: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminCreatePolicy>>, TError, {
        data: BodyType<PolicyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminCreatePolicy>>, TError, {
    data: BodyType<PolicyInput>;
}, TContext>;
export declare const getAdminUpdatePolicyUrl: (id: number) => string;
/**
 * @summary Update policy
 */
export declare const adminUpdatePolicy: (id: number, policyUpdate: PolicyUpdate, options?: RequestInit) => Promise<Policy>;
export declare const getAdminUpdatePolicyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdatePolicy>>, TError, {
        id: number;
        data: BodyType<PolicyUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdatePolicy>>, TError, {
    id: number;
    data: BodyType<PolicyUpdate>;
}, TContext>;
export type AdminUpdatePolicyMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdatePolicy>>>;
export type AdminUpdatePolicyMutationBody = BodyType<PolicyUpdate>;
export type AdminUpdatePolicyMutationError = ErrorType<unknown>;
/**
* @summary Update policy
*/
export declare const useAdminUpdatePolicy: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdatePolicy>>, TError, {
        id: number;
        data: BodyType<PolicyUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdatePolicy>>, TError, {
    id: number;
    data: BodyType<PolicyUpdate>;
}, TContext>;
export declare const getAdminDeletePolicyUrl: (id: number) => string;
/**
 * @summary Delete policy
 */
export declare const adminDeletePolicy: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeletePolicyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeletePolicy>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeletePolicy>>, TError, {
    id: number;
}, TContext>;
export type AdminDeletePolicyMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeletePolicy>>>;
export type AdminDeletePolicyMutationError = ErrorType<unknown>;
/**
* @summary Delete policy
*/
export declare const useAdminDeletePolicy: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeletePolicy>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeletePolicy>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListDocumentsUrl: () => string;
/**
 * @summary List all documents
 */
export declare const adminListDocuments: (options?: RequestInit) => Promise<Document[]>;
export declare const getAdminListDocumentsQueryKey: () => readonly ["/api/admin/documents"];
export declare const getAdminListDocumentsQueryOptions: <TData = Awaited<ReturnType<typeof adminListDocuments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListDocuments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListDocumentsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListDocuments>>>;
export type AdminListDocumentsQueryError = ErrorType<unknown>;
/**
 * @summary List all documents
 */
export declare function useAdminListDocuments<TData = Awaited<ReturnType<typeof adminListDocuments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListDocuments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminUpdateDocumentUrl: (id: number) => string;
/**
 * @summary Update document status
 */
export declare const adminUpdateDocument: (id: number, documentUpdate: DocumentUpdate, options?: RequestInit) => Promise<Document>;
export declare const getAdminUpdateDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateDocument>>, TError, {
        id: number;
        data: BodyType<DocumentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateDocument>>, TError, {
    id: number;
    data: BodyType<DocumentUpdate>;
}, TContext>;
export type AdminUpdateDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateDocument>>>;
export type AdminUpdateDocumentMutationBody = BodyType<DocumentUpdate>;
export type AdminUpdateDocumentMutationError = ErrorType<unknown>;
/**
* @summary Update document status
*/
export declare const useAdminUpdateDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateDocument>>, TError, {
        id: number;
        data: BodyType<DocumentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateDocument>>, TError, {
    id: number;
    data: BodyType<DocumentUpdate>;
}, TContext>;
export declare const getAdminDeleteDocumentUrl: (id: number) => string;
/**
 * @summary Delete document
 */
export declare const adminDeleteDocument: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteDocumentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteDocument>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteDocumentMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteDocument>>>;
export type AdminDeleteDocumentMutationError = ErrorType<unknown>;
/**
* @summary Delete document
*/
export declare const useAdminDeleteDocument: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteDocument>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteDocument>>, TError, {
    id: number;
}, TContext>;
export declare const getAdminListClientsUrl: () => string;
/**
 * @summary List all clients
 */
export declare const adminListClients: (options?: RequestInit) => Promise<Client[]>;
export declare const getAdminListClientsQueryKey: () => readonly ["/api/admin/clients"];
export declare const getAdminListClientsQueryOptions: <TData = Awaited<ReturnType<typeof adminListClients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListClients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListClients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListClientsQueryResult = NonNullable<Awaited<ReturnType<typeof adminListClients>>>;
export type AdminListClientsQueryError = ErrorType<unknown>;
/**
 * @summary List all clients
 */
export declare function useAdminListClients<TData = Awaited<ReturnType<typeof adminListClients>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListClients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminGetClientUrl: (id: number) => string;
/**
 * @summary Get client details
 */
export declare const adminGetClient: (id: number, options?: RequestInit) => Promise<Client>;
export declare const getAdminGetClientQueryKey: (id: number) => readonly [`/api/admin/clients/${number}`];
export declare const getAdminGetClientQueryOptions: <TData = Awaited<ReturnType<typeof adminGetClient>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetClient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetClient>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetClientQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetClient>>>;
export type AdminGetClientQueryError = ErrorType<void>;
/**
 * @summary Get client details
 */
export declare function useAdminGetClient<TData = Awaited<ReturnType<typeof adminGetClient>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetClient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminDeleteClientUrl: (id: number) => string;
/**
 * @summary Delete client
 */
export declare const adminDeleteClient: (id: number, options?: RequestInit) => Promise<void>;
export declare const getAdminDeleteClientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteClient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteClient>>, TError, {
    id: number;
}, TContext>;
export type AdminDeleteClientMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteClient>>>;
export type AdminDeleteClientMutationError = ErrorType<unknown>;
/**
* @summary Delete client
*/
export declare const useAdminDeleteClient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteClient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteClient>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map