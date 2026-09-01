import Image from "next/image";

export function ProjectsSection() {
  return (
    <main className="section-main" id="proyectos">
      <section className="section-left">
        <div className="section-left-content">
          {/* SECTION TITLE */}
          <div>
            <h2 className="section-title">Nuestros</h2>
            <h2 className="section-title text-cancel">Proyectos</h2>
          </div>
          {/* PROJECTS SELECTOR */}
          <div className="flex flex-col items-start gap-4">
            {/* DIVIDER */}
            <div className="text-xs flex flex-col items-end w-full mb-2">
              <Image
                alt="Dibujo Cocinas"
                src="/images/cocinas-draw.png"
                className="mx-2"
                width={200}
                height={200}
              />
              <div className="border-b border-cancel w-full" />
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
