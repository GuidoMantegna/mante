import Image from "next/image";

export function PorqueSection() {
  return (
    <main className="h-svh w-full flex">
      <section className="section-left relative flex items-end h-full w-[35%] px-4 py-12 bg-cancel">
        <div className="h-1/2 flex flex-col justify-between">
          <div className="w-[75px]">
            <Image
              src="/logo-white.svg"
              alt="Logo Manté"
              width={75}
              height={75}
            />
          </div>
          <div className="text-light text-xl">
            <p>DISEÑAMOS</p>
            <p>FABRICAMOS</p>
            <p>INSTALAMOS</p>
            <p>MOBILIARIO A MEDIDA</p>
          </div>
        </div>
      </section>
      <section className="section-right h-full flex-1 flex items-end px-4 py-12">
        <div className="h-1/2 flex flex-col justify-between">
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
        </div>
      </section>
    </main>
  );
}
