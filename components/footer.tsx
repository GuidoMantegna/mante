import Image from "next/image";

export function Footer() {
  return (
    <footer className=" border-t px-4 py-8 lg:px-8 lg:py-4 2xl:py-10 flex flex-col lg:flex-row-reverse lg:justify-between lg:items-center gap-6">
      <div>
        <Image
          alt="Logo Manté"
          src="/iso-logo-dark.svg"
          width={135}
          height={135}
        />
      </div>
      <div className="text-xs tracking-tighter lg:tracking-normal flex flex-col gap-1">
        <p className="font-bold">Diseñamos, fabricamos e instalamos mobiliario a medida.</p>
        <p>COCINAS - PLACARES - VESTIDORES</p>
        <p>Maschwitz, Buenos Aires, Argentina.</p>
        <p>Todos los derechos reservados © 2026 | Website by Guido Mantegna</p>
      </div>
    </footer>
  );
}
