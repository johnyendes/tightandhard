import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center px-6 py-12 bg-secondary/20'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center space-y-1'>
          <p className='text-sm uppercase tracking-widest text-muted-foreground'>TightandHard Models</p>
          <h1 className='text-2xl font-bold'>Create your account</h1>
          <p className='text-sm text-muted-foreground'>Start generating consistent AI models for your campaigns.</p>
        </div>
        <SignUp path='/sign-up' />
      </div>
    </div>
  );
}
