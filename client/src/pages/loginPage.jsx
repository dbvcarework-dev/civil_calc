import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


const loginPage = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = () => {
        axios.post('http://localhost:3000/api/login', {
            employee_id: employeeId,
            password: password
        }).then((res) => {
            alert(res.data.message);
            navigate('/beam-design')
        }).catch((err) => {
            console.log(err);
        })
    }
    return (
        <div className='bg-slate-500 h-screen w-screen flex justify-center items-center'>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }} action="" className='flex flex-col gap-4 bg-white p-4 rounded-lg'>
                <h1 className='text-2xl font-bold text-center'>Heyy, Login Here!</h1>
                <input onChange={(e) => { setEmployeeId(e.target.value) }} value={employeeId} type="text" placeholder='Employee ID' className='border border-gray-300 rounded-md p-2' />
                <input onChange={(e) => { setPassword(e.target.value) }} value={password} type="password" placeholder='Password' className='border border-gray-300 rounded-md p-2' />
                <button type='submit' className='bg-blue-500 text-white rounded-md p-2'>Login</button>
            </form>
        </div>
    )
}

export default loginPage