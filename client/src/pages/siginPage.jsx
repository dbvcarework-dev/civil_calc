import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const SiginPage = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();


    const handleSubmit = (e) => {
        console.log(employeeId, name, password);
        setEmployeeId('');
        setName('');
        setPassword('');

        axios.post('http://localhost:3000/api/users', {
            employee_id: employeeId,
            name: name,
            password: password
        }).then((res) => {
            navigate('/login-page')
        }).catch((err) => {
            console.log(err);
        })
    }
    return (

        <div className='bg-slate-500 h-screen w-screen flex justify-center items-center'>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }} action="" className='flex flex-col gap-4 bg-white p-4 rounded-lg'>
                <h1 className='text-2xl font-bold text-center'>Welcome, Register Here!</h1>
                <input onChange={(e) => { setEmployeeId(e.target.value) }}
                    value={employeeId}
                    type="text"
                    placeholder='Employee ID'
                    className='border border-gray-300 rounded-md p-2' />

                <input onChange={(e) => { setName(e.target.value) }}
                    value={name}
                    type="text"
                    placeholder='Name'
                    className='border border-gray-300 rounded-md p-2' />

                <input onChange={(e) => { setPassword(e.target.value) }}
                    value={password}
                    type="password"
                    placeholder='Password'
                    className='border border-gray-300 rounded-md p-2' />
                <button type='submit' className='bg-blue-500 text-white rounded-md p-2'>Register</button>

            </form>
        </div>
    )
}

export default SiginPage