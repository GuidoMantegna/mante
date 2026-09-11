import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-8 2xl:py-10">
      <div className="max-w-[1280px] px-4 lg:px-8 mx-auto w-full flex flex-col lg:flex-row-reverse justify-between lg:items-center gap-4 lg:gap-6">
        <div>
          <Image
            alt="Logo Manté"
            src="/iso-logo-mix.svg"
            width={1016}
            height={279}
            className="w-[100px] h-auto lg:w-[135px]"
          />
        </div>
        <div className="text-xs tracking-tighter lg:tracking-normal flex flex-col lg:gap-1">
          <p className="font-bold">Diseñamos, fabricamos e instalamos mobiliario a medida.</p>
          <p>COCINAS - PLACARES - VESTIDORES</p>
          <p>Maschwitz, Buenos Aires, Argentina.</p>
          <p>Todos los derechos reservados © 2026 | <a href="https://guidomantegna.vercel.app/" target="_blank" rel="noopener noreferrer" >Website by GM.</a></p>
        </div>
      </div>
    </footer>
  );
}
