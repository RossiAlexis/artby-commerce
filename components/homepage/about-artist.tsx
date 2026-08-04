import Image from "next/image";

type AboutArtistProps = {
  aboutImageUrl: string;
  aboutTitle: string;
  aboutDescription: string;
};

export function AboutArtist({
  aboutImageUrl,
  aboutTitle,
  aboutDescription,
}: AboutArtistProps) {
  return (
    <section className="px-6 pb-16 md:px-10">
      <div className="bg-card border-border grid overflow-hidden rounded-3xl border md:grid-cols-3">
        <div className="relative">
          <Image
            src={aboutImageUrl}
            alt={aboutTitle}
            sizes="(min-width: 768px) 33vw, 100vw"
            width={2400}
            height={800}
            priority
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-8 md:col-span-2 md:pr-21 md:pl-16">
          <h2 className="font-serif text-2xl">{aboutTitle}</h2>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {aboutDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
