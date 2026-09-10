import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-8 2xl:py-10">
      <div className="max-w-[1280px] px-4 lg:px-8 mx-auto w-full flex flex-col lg:flex-row-reverse justify-between items-center gap-6">
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
      </div>
    </footer>
  );
}
