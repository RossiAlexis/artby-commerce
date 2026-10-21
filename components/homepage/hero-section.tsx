import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  coverImageUrl: string;
  heroTagline: string;
};

export function HeroSection({ coverImageUrl, heroTagline }: HeroSectionProps) {
  return (
    <div className="relative h-[36.25rem] w-full overflow-hidden bg-background">
      <Image
        src={coverImageUrl}
        alt="Vero Miller pintando"
        fill
        priority
        className="object-contain object-center"
        sizes="100vw"
      />
      <div className="absolute inset-x-6 top-[22%] flex flex-col items-center gap-3 text-center md:inset-x-auto md:top-auto md:bottom-16 md:left-30 md:w-[37.5rem]">
        <p className="text-foreground text-center font-serif text-[1.75rem] leading-[2.125rem] font-bold md:text-4xl md:leading-[2.75rem]">
          {heroTagline}
        </p>
        <Link
          href="/galeria"
          className="text-primary hover:text-primary-hover text-lg font-medium"
        >
          Ver galería
          <span className="md:hidden"> →</span>
        </Link>
      </div>
    </div>
  );
}
