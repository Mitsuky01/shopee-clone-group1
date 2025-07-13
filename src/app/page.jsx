'use client'
import { app } from '@/utils/firebase'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

const LoginPage = () => {
  const db = getFirestore(app);
  const auth = getAuth(app)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false);

 const onSubmit = async (data) => {
    setErrorMsg('')
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user
      const uid = user.uid
      const userDocRef = doc(db, "users", uid)
      const userSnapshot = await getDoc(userDocRef)

      if (!userSnapshot.exists()) { 
        setErrorMsg("user's profile not found in database")
        await signOut(auth)
        return
      }

      const userDocData = userSnapshot.data();
      const role = userDocData.role; 

      if (role === 'seller') {
        router.push('/seller/dashboard');
      } else if (role === 'customer') {
        router.push('/customer/dashboard');
      } else {
        setErrorMsg('not valid user');
        await signOut(auth); 
      }

    } catch (error) {

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMsg('Wrong email or password');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Email not valid.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMsg('too many requests for login. Please try again!');
      } else {
        setErrorMsg(`${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Login</h2>
      <input placeholder="Email" {...register('email', { required: true })} className="input" />
      {errors.email && <p className="text-red-500">Email is required</p>}

      <input placeholder="Password" type="password" {...register('password', { required: true })} className="input" />
      {errors.password && <p className="text-red-500">Password is required</p>}

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      <button type="submit" className="btn">Login</button>

       <p className="text-sm">
        Don’t have an account?{' '}
        <a href="/register" className="text-blue-600 underline">
          Register here
        </a>
      </p>
    </form>
  )
}

export default LoginPage
