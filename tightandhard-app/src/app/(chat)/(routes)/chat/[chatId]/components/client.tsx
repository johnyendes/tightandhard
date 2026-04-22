'use client';

import { Companion, Message } from '@prisma/client';
import { useCompletion } from 'ai/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { ChatForm } from '@/components/chat-form';
import { ChatHeader } from '@/components/chat-header';
import { ChatMessageProps } from '@/components/chat-message';
import { ChatMessages } from '@/components/chat-messages';
import { VoiceModeToggle } from '@/components/voice-mode-toggle';
import { useVoiceMode } from '@/hooks/use-voice-mode';

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: { messages: number };
  };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);
  const voice = useVoiceMode();

  const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
    api: `/api/chat/${companion.id}`,
    streamProtocol: 'text',
    onFinish(_prompt, completion) {
      const systemMessage: ChatMessageProps = { role: 'system', content: completion };
      setMessages((current) => [...current, systemMessage]);
      setInput('');

      // Auto-play voice if enabled. Persona's voiceStyle drives tone.
      const voiceStyle = (companion as Companion & { voiceStyle?: string }).voiceStyle;
      if (voice.enabled && voiceStyle && completion) {
        voice.playMessage(completion, voiceStyle);
      }

      router.refresh();
    },
  });

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Stop playback when user starts typing the next message
    if (voice.isPlaying && e.target.value.length > 0) {
      voice.stopPlayback();
    }
    handleInputChange(e);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = { role: 'user', content: input };
    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className='flex flex-col h-full p-4 space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex-1 min-w-0'>
          <ChatHeader companion={companion} />
        </div>
        <VoiceModeToggle
          enabled={voice.enabled}
          isPlaying={voice.isPlaying}
          onToggle={voice.toggle}
        />
      </div>
      <ChatMessages companion={companion} isLoading={isLoading} messages={messages} />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={onInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
