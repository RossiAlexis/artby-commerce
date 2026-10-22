import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  coverImageUrl: string;
  heroTagline: string;
};

export function HeroSection({ coverImageUrl, heroTagline }: HeroSectionProps) {
  return (
    <div className="bg-background relative min-h-[32rem] w-full overflow-hidden md:aspect-[2880/1400] md:min-h-[40rem]">
      <Image
        src={coverImageUrl}
        alt="Vero Miller pintando"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-x-0 top-[58%] flex -translate-y-1/2 flex-col items-center gap-4 px-6 text-center">
        <p className="text-foreground max-w-[27rem] text-center font-serif text-[1.75rem] leading-[2.125rem] font-bold md:text-4xl md:leading-[2.75rem]">
          {heroTagline}
        </p>
        <Link
          href="/galeria"
          className="text-primary hover:text-primary-hover text-lg font-medium"
        >
          Ver galería
        </Link>
      </div>
    </div>
  );
}
