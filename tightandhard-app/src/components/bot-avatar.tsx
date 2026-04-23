import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface BotAvatarProps {
  src: string;
  videoSrc?: string | null;
}

export const BotAvatar = ({ src, videoSrc }: BotAvatarProps) => {
  // If we have a hero video, auto-play it muted in the avatar circle.
  // Falls back to the static image gracefully.
  if (videoSrc) {
    return (
      <div className='h-12 w-12 rounded-full overflow-hidden relative'>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={videoSrc}
          poster={src}
          autoPlay
          muted
          loop
          playsInline
          className='absolute inset-0 w-full h-full object-cover'
        />
      </div>
    );
  }

  return (
    <Avatar className='h-12 w-12'>
      <AvatarImage src={src} />
    </Avatar>
  );
};
