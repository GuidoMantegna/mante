import Image from "next/image";

export function AboutSection() {
  return (
    <main className="section-main" id="nosotros">
      <section className="section-left">
        <div className="section-left-content">
          {/* SECTION TITLE */}
          <div>
            <h2 className="section-title">Sobre</h2>
            <h2 className="section-title text-cancel">Nosotros</h2>
          </div>
          {/* MAIN TEXT */}
          <div className="text-sm">
            {/* DIVIDER */}
            <div className="text-xs grid gap-2 w-full mb-2">
              <Image
                alt="Logo Manté"
                src="/logo-accent.svg"
                width={30}
                height={30}
              />
              <div className="border-b border-cancel" />
            </div>
            <p>
              Somos un equipo apasionado por transformar ideas en espacios
              funcionales y personalizados.
            </p>
            <br />
            <p>
              Acompañamos cada proyecto de manera cercana, cuidando cada detalle
              para que el resultado refleje la forma de vivir de quienes lo
              disfrutan.
            </p>
          </div>
        </div>
      </section>
      <section className="section-right">
        <Image
          src="/images/nosotros.svg"
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
