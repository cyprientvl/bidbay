import axios from 'axios'
import { useAuthStore } from '../store/auth';

const URLAPI = "http://localhost:3000/api"

async function queryGet<Type>(url: string){
    const response = await axios.get<Type>(`${URLAPI}/${url}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().token.value}`
        }
    })
    return response.data;
}

async function queryDelete(url : string){
    return await axios.delete(`${URLAPI}/${url}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().token.value}`
        }
    })
}

async function queryPost<Type>(url: string, data: any){
    const response = await axios.post<Type>(`${URLAPI}/${url}`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().token.value}`
        }
    })
    return response.data;
}

async function queryPut<Type>(url: string, data: any){
    const response = await axios.put<Type>(`${URLAPI}/${url}`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().token.value}`
        }
    })
    return response.data;
}

export { queryGet, queryPost, queryPut, queryDelete };