import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const { signIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (values: FormValues) => {
    await signIn(values.email, values.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-clay p-6">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input
              {...register('email')}
              className="w-full rounded-lg border border-black/10 p-2"
              placeholder="Email"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <input
              {...register('password')}
              type="password"
              className="w-full rounded-lg border border-black/10 p-2"
              placeholder="Password"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button className="rounded-lg bg-ocean text-white py-2" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
