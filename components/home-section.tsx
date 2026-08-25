import Image from "next/image";

export function HomeSection() {
  return (
    <main className="h-svh w-full flex">
      <section className="section-left relative h-full w-[35%]">
        <Image
          src="/images/textura-1.jpg"
          alt="texture"
          fill
          sizes="100vw"
          // priority={}
          className="object-cover"
        />
      </section>
      <section className="section-right h-full flex-1"></section>
    </main>
  );
}
