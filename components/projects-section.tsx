import Image from "next/image";

export function ProjectsSection() {
  return (
    <main className="section-main">
      <section className="section-left">
        <div className="w-full h-full flex flex-col justify-around">
          {/* SECTION TITLE */}
          <div>
            <Image
              alt="Logo Manté"
              src="/logo-accent.svg"
              width={30}
              height={30}
            />
            <h1 className="section-title">Nuestros</h1>
            <h1 className="section-title text-cancel">Proyectos</h1>
          </div>
          {/* PROJECTS SELECTOR */}
          <div className="flex flex-col items-start gap-2">
            {/* DIVIDER */}
            <div className="text-xs grid w-full">
              <Image
                alt="Dibujo Cocinas"
                src="/images/cocinas-draw.png"
                className="my-0 mx-auto"
                width={200}
                height={200}
              />
              <div className="border-b border-cancel" />
            </div>
            <button className="text-2xl font-bold underline text-accent">
              COCINAS
            </button>
            <button className="text-2xl">PLACARES</button>
            <button className="text-2xl">VESTIDORES</button>
          </div>
        </div>
      </section>
      <section className="section-right">
        <Image
          src="/images/splash-3.webp"
          alt="texture"
          fill
          sizes="100%"
          // priority={}
          className="object-cover"
        />
      </section>
    </main>
  );
}
