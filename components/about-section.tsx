import Image from "next/image";

export function AboutSection() {
  return (
    <main className="h-svh w-full flex">
      <section className="section-left relative flex flex-col justify-end w-[35%] px-4 py-12 border-r-1">
          <div className="border-b mb-4" />
          <div className="text-xl">
            <p>COCINAS</p>
            <p>PLACARES</p>
            <p>VESTIDORES</p>
          </div>
      </section>
      <section className="section-left relative h-full flex-1 border-r-1">
        <Image
          src="/images/nosotros.svg"
          alt="texture"
          fill
          sizes="100vw"
          // priority={}
          className="object-cover"
        />
      </section>
    </main>
  );
}
