import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  coverImageUrl: string;
  heroTagline: string;
};

export function HeroSection({ coverImageUrl, heroTagline }: HeroSectionProps) {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      <Image
        src={coverImageUrl}
        alt="Vero Miller pintando"
        width={2880}
        height={680}
        priority
        className="h-auto w-full"
        sizes="100vw"
      />
      <div className="absolute inset-x-6 bottom-6 hidden flex-col items-center gap-3 text-center md:bottom-10 md:left-30 md:flex md:w-[37.5rem]">
        <p className="text-foreground text-center font-serif text-4xl leading-[2.75rem] font-bold">
          {heroTagline}
        </p>
        <Link
          href="/galeria"
          className="text-primary hover:text-primary-hover text-lg font-medium"
        >
          Ver galería
        </Link>
      </div>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center md:hidden">
        <p className="text-foreground font-serif text-[1.75rem] leading-[2.125rem] font-bold">
          {heroTagline}
        </p>
        <Link
          href="/galeria"
          className="text-primary hover:text-primary-hover text-lg font-medium"
        >
          Ver galería →
        </Link>
      </div>
    </div>
  );
}
