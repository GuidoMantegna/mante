import { FaWhatsapp } from "react-icons/fa";

export function WaButton() {
  const TEXT = encodeURIComponent("Hola 👋! Los contacto desde la página y quisiera obtener más información sobre sus servicios.");
  return (
    <a href={`https://wa.me/5491178431766?text=${TEXT}`} target="_blank" rel="noopener noreferrer">
      <FaWhatsapp size={25} className="cursor-pointer hover:scale-110 transition-transform" color="var(--whatsapp)" />
    </a>
  );
}