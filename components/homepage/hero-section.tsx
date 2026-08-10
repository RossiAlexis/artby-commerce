import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  coverImageUrl: string;
  heroTagline: string;
};

export function HeroSection({ coverImageUrl, heroTagline }: HeroSectionProps) {
  return (
    <div className="relative w-full">
      <Image
        src={coverImageUrl}
        alt="Vero Miller pintando"
        width={2880}
        height={800}
        priority
        className="h-auto w-full"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-16 flex flex-col items-start justify-center gap-4 px-6 text-center">
        <div className="hidden md:block">
          <p className="max-w-2xl font-serif text-2xl font-bold text-stone-900 md:text-4xl">
            {heroTagline}
          </p>
          <Link
            href="/galeria"
            transitionTypes={["nav-forward"]}
            className="text-primary hover:text-primary-hover underline underline-offset-4"
          >
            Ver galería
          </Link>
        </div>
      </div>
    </div>
  );
}
