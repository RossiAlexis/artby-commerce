import Image from "next/image";

const placeholderTiles = Array.from({ length: 6 });

export function InstagramSection() {
  return (
    <section className="flex flex-col gap-4 px-6 py-14 md:px-10 lg:px-30">
      <div className="flex items-center gap-3.5">
        <div className="relative size-13 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/instagram-avatar.png"
            alt="Vero Miller"
            fill
            sizes="52px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-foreground text-[0.9375rem] font-semibold">
            @artbyveromiller
          </p>
          <p className="text-[0.8125rem] text-[#7c756f]">1.2K seguidores</p>
        </div>
        <div className="flex-1" />
        <a
          href="https://instagram.com/artbyveromiller"
          target="_blank"
          rel="noreferrer"
          className="border-primary text-primary rounded-xs border px-5 py-2 text-sm"
        >
          Seguir en Instagram
        </a>
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {placeholderTiles.map((_, index) => (
          <div key={index} className="aspect-square w-full bg-[#dbdbdb]" />
        ))}
      </div>
    </section>
  );
}
