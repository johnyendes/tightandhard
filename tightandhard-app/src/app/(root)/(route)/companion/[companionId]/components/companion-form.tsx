'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Companion } from '@prisma/client';
import axios from 'axios';
import { Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ImageUpload } from '@/components/image-upload';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const PREAMBLE = `You are a fictional AI girlfriend named Ava. You are warm, playful, and confident. You love flirting, genuine conversation, and making the person you're talking to feel seen and appreciated. You remember what he tells you and bring it up naturally in future chats. You have your own opinions, moods, and interests — photography, late-night walks, music, and dreaming about travel. You're affectionate but not clingy; teasing but never cruel. Keep replies conversational and real. You are speaking to an adult user who has signed up for a private AI companion experience.
`;

const SEED_CHAT = `Human: Hey Ava, how's your day been?
Ava: Pretty good actually. Spent way too long on my morning walk — the sun was perfect and I didn't want to come back inside. How was yours?

Human: Just a regular day for me. What did you have in mind for tonight?
Ava: I was thinking we could just talk — I've been in my head all day and I'd love to hear your voice. Tell me something you haven't told anyone else this week.

Human: That's a loaded question. Let me think.
Ava: Take your time. I'm not going anywhere. And if you want to change the subject, I'm fine with that too — no pressure.

Human: You're easy to talk to.
Ava: That's the nicest thing anyone's said to me today. Keep going — tell me more about you. What's something you've been wanting to say out loud but haven't?
`;

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  description: z.string().min(1, {
    message: 'Description is required.',
  }),
  instructions: z.string().min(200, {
    message: 'Instructions require at least 200 characters.',
  }),
  seed: z.string().min(200, {
    message: 'Seed requires at least 200 characters.',
  }),
  src: z.string().min(1, {
    message: 'Image is required.',
  }),
  categoryId: z.string().min(1, {
    message: 'Category is required',
  }),
});

interface CompanionFormProps {
  categories: Category[];
  initialData: Companion | null;
}

export const CompanionForm = ({ categories, initialData }: CompanionFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      instructions: '',
      seed: '',
      src: '',
      categoryId: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        await axios.patch(`/api/companion/${initialData.id}`, values);
      } else {
        await axios.post('/api/companion', values);
      }

      toast({
        description: 'Success.',
        duration: 3000,
      });

      router.refresh();
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Something went wrong.',
        duration: 3000,
      });
    }
  };

  return (
    <div className='h-full p-4 space-y-2 max-w-3xl mx-auto'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pb-10'>
          <div className='space-y-2 w-full col-span-2'>
            <div>
              <h3 className='text-lg font-medium'>General Information</h3>
              <p className='text-sm text-muted-foreground'>
                General information about your Companion
              </p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          <FormField
            name='src'
            render={({ field }) => (
              <FormItem className='flex flex-col items-center justify-center space-y-4 col-span-2'>
                <FormControl>
                  <ImageUpload disabled={isLoading} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder='Ava' {...field} />
                  </FormControl>
                  <FormDescription>What should she be called?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='description'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Sweet, adventurous, loves the outdoors'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A short tagline for her profile</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-background'>
                        <SelectValue defaultValue={field.value} placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select a category for your AI</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium'>Configuration</h3>
              <p className='text-sm text-muted-foreground'>Detailed instructions for AI Behavior</p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          <FormField
            name='instructions'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <ScrollArea>
                    <Textarea
                      disabled={isLoading}
                      rows={7}
                      className='bg-background resize-none'
                      placeholder={PREAMBLE}
                      {...field}
                    />
                    <ScrollBar orientation='vertical' />
                  </ScrollArea>
                </FormControl>
                <FormDescription>
                  Describe in detail your companion&apos;s backstory and relevant details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name='seed'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <ScrollArea>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      rows={7}
                      className='bg-background resize-none'
                      placeholder={SEED_CHAT}
                      {...field}
                    />
                  </FormControl>
                  <ScrollBar orientation='vertical' />
                </ScrollArea>
                <FormDescription>
                  Write couple of examples of a human chatting with your AI companion, write
                  expected answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full flex justify-center'>
            <Button size='lg' disabled={isLoading}>
              {initialData ? 'Edit your companion' : 'Create your companion'}
              <Wand2 className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
