import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-10 px-[20px] flex flex-col lg:flex-row-reverse lg:justify-between lg:items-center gap-6">
      <div>
        <Image
          alt="Logo Manté"
          src="/iso-logo-dark.svg"
          width={150}
          height={150}
        />
      </div>
      <div className="text-xs flex flex-col gap-1">
        <p className="font-bold">Diseñamos, fabricamos e instalamos mobiliario a medida.</p>
        <p>COCINAS - PLACARES - VESTIDORES</p>
        {/* <div className="border-b border-cancel" /> */}
        <p>Maschwitz, Buenos Aires, Argentina.</p>
        <p>Todos los derechos reservados © 2026 | Website by Guido Mantegna</p>
      </div>
    </footer>
  );
}
