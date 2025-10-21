import React,{useState, useEffect} from 'react'
import { Navigate } from 'react-router-dom'
import axios from "axios"


export default function AdminProtectedRoute({children}) {
    const [isAuth, setAuth] = useState(null)

    useEffect(()=>{
        async function fetchAuth(){
            try {
                const res = await axios.get("http://localhost:3000/admin/protectedroute", {withCredentials: true}) 
                setAuth(res.data.success)
                
            } catch (error) {
                setAuth(false)
            }
        }
        fetchAuth()
    }, [])

    if(isAuth === null) return(<p>...Loading</p>)
  return (isAuth? children: <Navigate to="/trainer/login" />)
}
