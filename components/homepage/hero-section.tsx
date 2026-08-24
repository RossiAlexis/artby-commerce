import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  coverImageUrl: string;
  heroTagline: string;
};

export function HeroSection({ coverImageUrl, heroTagline }: HeroSectionProps) {
  return (
    <div className="relative h-[36.25rem] w-full overflow-hidden">
      <Image
        src={coverImageUrl}
        alt="Vero Miller pintando"
        fill
        priority
        className="object-cover object-bottom opacity-80"
        sizes="100vw"
      />
      <div className="absolute bottom-16 left-6 hidden w-[37.5rem] flex-col items-center justify-center gap-3 text-left md:left-30 md:flex">
        <p className="text-foreground text-center font-serif text-4xl leading-[2.75rem] font-bold">
          {heroTagline}
        </p>
        <Link
          href="/galeria"
          transitionTypes={["nav-forward"]}
          className="text-primary hover:text-primary-hover text-lg font-medium"
        >
          Ver galería
        </Link>
      </div>
    </div>
  );
}
