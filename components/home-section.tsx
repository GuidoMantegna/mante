import Image from "next/image";

export function HomeSection() {
  return (
    <main className="section-main" id="home">
      <section className="section-left">
        <div className="flex flex-col justify-center gap-6 lg:gap-12">
          {/* SECTION TITLE */}
          <div>
            <Image
              alt="Logo Manté"
              src="/logo-accent.svg"
              width={30}
              height={30}
            />
            <h1 className="section-title">Somos</h1>
            <h1 className="section-title text-cancel">
              Manté
            </h1>
          </div>
          {/* DIVIDER */}
          <div className="text-xs grid">
            <h2>DISEÑAMOS . FABRICAMOS . INSTALAMOS</h2>
            <div className="border-b border-cancel" />
            <h2>MOBILIARIO A MEDIDA</h2>
          </div>
          {/* MAIN TEXT */}
          <div className="text-sm">
            <p>Diseñamos espacios para ser vividos.</p>
            <br/>
            <p>
              Creemos que un buen mueble no solo tiene que verse bien. Tiene que
              resolver, durar y acompañar la forma de vivir de quienes lo usan
              todos los días.
            </p>
          </div>
        </div>
      </section>
      <section className="section-right">
        <Image
          src="/images/kitchen-draw.svg"
          alt="texture"
          //   fill
          //   sizes="100vw"
          // priority={}
          width={450}
          height={450}
          className="object-cover"
        />
      </section>
    </main>
  );
}
