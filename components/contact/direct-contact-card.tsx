import Image from "next/image";

function instagramHandle(url: string) {
  const path = url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  const handle = path.replace(/\/+$/, "");
  return handle ? `@${handle}` : url;
}

export function DirectContactCard({
  contactEmail,
  instagramUrl,
}: {
  contactEmail?: string;
  instagramUrl?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-3.5 rounded-lg bg-[#f0ebe3] px-7 py-6 lg:w-[22.5rem]">
      <p className="text-foreground text-sm font-semibold">
        También podés escribirme directo
      </p>
      {contactEmail && (
        <a
          href={`mailto:${contactEmail}`}
          className="text-primary flex items-center gap-1 text-[0.8125rem]"
        >
          <Image
            src="/icons/email-outline.svg"
            alt=""
            width={15}
            height={15}
            aria-hidden
          />
          {contactEmail}
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary flex items-center gap-1 text-[0.8125rem]"
        >
          <Image
            src="/icons/instagram.svg"
            alt=""
            width={14}
            height={14}
            aria-hidden
          />
          {instagramHandle(instagramUrl)}
        </a>
      )}
      <p className="text-[0.75rem] text-[#7c756f]">
        Suelo responder dentro de las 48 hs.{" "}
        <span className="hidden md:inline">
          Si es por una obra puntual, mencioná el título.
        </span>
      </p>
    </div>
  );
}
