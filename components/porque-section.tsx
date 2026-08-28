import Image from "next/image";

export function PorqueSection() {
  return (
    <main className="w-full flex">
      <section className="section-left relative flex flex-col justify-end gap-4 w-[35%] px-4 py-12 border-r-1">
          <div className="w-[50px]">
            <Image
              src="/logo-dark.svg"
              alt="Logo Manté"
              width={50}
              height={50}
            />
          </div>
          <div className="text-xl">
            <p>DISEÑAMOS</p>
            <p>FABRICAMOS</p>
            <p>INSTALAMOS</p>
            <p>MOBILIARIO A MEDIDA</p>
          </div>
      </section>
      <section className="section-right h-full flex-1 px-4 py-12 flex flex-col gap-20">
          <h2 className="text-6xl">
            ¿POR <br /> QUÉ{" "}
            <span className="text-accent">
              <br />
              MANTÉ?
            </span>
          </h2>
          <div>
            <div className="border-b mb-4" />
            <p>
              Diseñamos espacios para ser vividos. Creemos que un buen mueble no
              solo tiene que verse bien. Tiene que resolver, durar y acompañar
              la forma de vivir de quienes lo usan todos los días.
            </p>
          </div>
      </section>
    </main>
  );
}
