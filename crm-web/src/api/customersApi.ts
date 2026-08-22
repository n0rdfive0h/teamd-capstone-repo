import type { Customer, CustomerDraft, CustomerStatus } from '../types/customer'
import { http } from './http'

interface CustomerApiResponse {
    customerId:string,
    fullName:string,
    status:CustomerStatus,
    email:string,
}

function mapToCustomer(res: CustomerApiResponse): Customer {
  return {
    customerId: res.customerId,
    fullName: res.fullName,
    status: res.status,
    email: res.email,
  };
}



export const CustomerApiClient = {
    // create customer and POST to server
    create: async (draft: CustomerDraft, signal?:AbortSignal): Promise<Customer> => {
        // craft response
        const response = await http<CustomerApiResponse>(
            '/api/v1/customers', {
                method: 'POST',
                body: JSON.stringify(draft),
            },
            signal
        )// end response

        // return with function
        return mapToCustomer(response);
    },// end create

    getProfile: async (customerId:string, signal?:AbortSignal): Promise<Customer> => {
        const response = await http<CustomerApiResponse>(
            `/api/v1/customers/${customerId}`,
            {method: 'GET',},
            signal
        )

        return mapToCustomer(response)
    },// end getProfile

    search: async (query:string, signal?:AbortSignal): Promise<Customer[]> => {
        // get query
        const encodedQuery = encodeURIComponent(query)
        
        const response = await http<CustomerApiResponse[]>(
            `/api/v1/customers?query=${encodedQuery}`,
            {method: 'GET',},
            signal,
        )

        return response.map(mapToCustomer)
    },// end search

    updateStatus: async (customerId:string, status:CustomerStatus, signal?:AbortSignal): Promise<Customer> => {
        const response = await http<CustomerApiResponse>(
            `/api/v1/customers/${customerId}/status`, 
            { 
            method: 'PATCH', 
            body: JSON.stringify({ newStatus: status }), 
            }, 
            signal,
        )
        return mapToCustomer(response)
    }
}