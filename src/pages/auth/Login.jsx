'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure the login function
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError(''); // Clear any previous errors

    try {
      await login(values.name, values.password); // Use the login function
      navigate('/chat'); // Redirect to the chat page after successful login
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.'); // Set error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[350px] text-sm">
      <div className="flex justify-between items-baseline mb-5">
        <h1 className="font-bold text-5xl">Chat App</h1>
        <h3 className="font-bold text-xl items-baseline relative top-2">Login</h3>
      </div>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormDescription>This is your password.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Submit'}
            </Button>
            <small className="text-center">
              Don't you have an account?{' '}
              <Link to="/register" className="font-semibold underline text-blue-700">
                Register
              </Link>
            </small>
          </div>
        </form>
      </Form>
    </div>
  );
}