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
    <section id="sobre-vero" className="px-6 pb-16 md:px-10">
      <div className="bg-card border-border grid overflow-hidden rounded-tr-3xl rounded-br-3xl border md:grid-cols-3">
        <div className="border-primary relative aspect-[420/480] w-full overflow-hidden rounded-tr-[50px] rounded-br-[50px] border-2 md:aspect-auto md:h-[480px] md:w-[420px]">
          <Image
            src={aboutImageUrl}
            alt={aboutTitle}
            sizes="(min-width: 768px) 33vw, 100vw"
            fill
            priority
            className="object-cover object-top"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-8 md:col-span-2 md:pr-21 md:pl-16">
          <h2 className="font-serif text-2xl font-semibold">{aboutTitle}</h2>
          <p className="text-muted-foreground text-base whitespace-pre-line">
            {aboutDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
