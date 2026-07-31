import Image from "next/image";

export default function Home() {
  return (
    <main className="">
      <div className="flex h-80 w-screen pb-19.5">
        <Image
          src="https://images.unsplash.com/photo-1784318519037-7ee0b1668e95?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Cover image"
          className="block  object-cover w-screen h-auto"
          loading="eager"
          width={1440}
          height={580}
        />
      </div>
      <div className="mx-30 flex items-center justify-between">

        <span className="text-lg text-[#A6A6A6]">Obras disponibles</span>
        <span className="text-base text-[#A6A6A6]">{"Ver todos ->"}</span>
      </div>
    </main>
  )
}
