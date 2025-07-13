'use client'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore'
import { useState } from 'react'
import { app } from '@/utils/firebase'

const RegisterPage = () => {
  const db = getFirestore(app)
  const auth = getAuth(app)
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

 const onSubmit = async (data) => {
    setErrorMsg('');
    setLoading(true);
    const { email, password, confirmPassword, role } = data; 

    if (password !== confirmPassword) {
      setErrorMsg("Password not match");
      setLoading(false); 
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      const defaultRole = 'customer'; 

      await setDoc(doc(db, "users", uid), {
        email: email,
        role: role || defaultRole,
        createdAt: serverTimestamp(), 
      });

      router.push(`/${role || defaultRole}/dashboard`); 

    } catch (error) {
      console.error("Terjadi kesalahan saat registrasi:", error);

      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Email already registered. Please use another email!');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password too weak (min 6 length character)');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Email not valid');
      } else {
        setErrorMsg(error.message);
      }

      if (auth.currentUser) { 
         await signOut(auth);
      }

    } finally {
      setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Register</h2>

      <select {...register('role', { required: true })} className="input">
        <option value="">Select role</option>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
      </select>
      {errors.role && <p className="text-red-500">Role is required</p>}

      <input
        type="email"
        placeholder="Email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email format'
          }
        })}
        className="input"
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        {...register('password', { required: 'Password is required' })}
        className="input"
      />
      {errors.password && <p className="text-red-500">{errors.password.message}</p>}

      <input
        type="password"
        placeholder="Confirm Password"
        {...register('confirmPassword', {
          required: 'Confirm password is required',
          validate: (val) => val === watch('password') || 'Passwords do not match'
        })}
        className="input"
      />
      {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <button type="submit" className="btn">
        Register
      </button>

      <p className="text-sm">
        Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
      </p>
    </form>
  )
}

export default RegisterPage
