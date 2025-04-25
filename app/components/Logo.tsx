import Image from 'next/image';

export default function Logo() {
  return (
    <div className="relative w-full h-full">
      <Image
        src="/images/logo.png"
        alt="Palisociety Logo"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
} 