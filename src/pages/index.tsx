import { useRouter } from 'next/router';
import React, { useState } from 'react'

const Index = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSubmit = async () => {
    if (username === 'host' && password === 'host') {
      router.push('/host')
    } else if (username === 'guest' && password === 'guest') {
      router.push('/guest')
    }
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-black'>
      <div className='flex flex-col space-y-4 items-center border border-gray-600 rounded-md p-4'>
        <div className=''>
          <h1 className='font-bold text-3xl'>Login To Orion</h1>
        </div>
        <div>
          <input type='text' placeholder='Username' className='border border-gray-600 rounded-md p-2 bg-black outline-none' onChange={
            (e) => setUsername(e.target.value)
          } />
        </div>
        <div>
          <input type='password' placeholder='Password' className='border border-gray-600 rounded-md p-2 bg-black outline-none' onChange={
            (e) => setPassword(e.target.value)
          } />
        </div>
        <div>
          <button className='bg-blue-500 text-white p-2 rounded-md' onClick={handleSubmit}>Login</button>
        </div>
      </div>
    </div>
  )
}

export default Index