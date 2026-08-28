import Image from "next/image"
import Link from "next/link"

export const SECTIONS = [
    // { id: "porque-mante", label: "POR QUÉ MANTÉ" },
    { id: "projects", label: "PROYECTOS" },
    { id: "nosotros", label: "NOSOTROS" },
    { id: "contacto", label: "CONTACTO" },
]

export function Navbar() {
    return (
        <nav className="fixed z-1 flex justify-between border-b w-full p-4 lg:px-8 font-charon text-black">
            <Link href="#home" className="w-[75px]">
                <Image src="/iso-logo-dark.svg" width={75} height={75} alt="Manté" />
            </Link>
            <ul className="flex gap-4">
                {SECTIONS.map((section) => (
                    <li key={section.id}>
                        <Link href={`#${section.id}`}>{section.label}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}