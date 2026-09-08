import { CiHeart } from "react-icons/ci";

export function Reviews() {
    return (
        <div className="flex flex-col lg:flex-row w-full max-w-[1280px] mx-auto lg:border-y border-cancel lg:py-8 px-4 lg:gap-8 text-sm text-center">
            <div className="flex-1 flex flex-col gap-2 p-6">
                <p>
                    "Los llamamos para hacer una cocina y terminamos haciendo toda la casa. Son unos genios!""
                </p>
                <CiHeart className="text-accent mx-auto" />
                <div className="font-bold">
                    <span>Agostina</span>
                    <span> | </span>
                    <a href="https://www.instagram.com/mante.ar" target="_blank" rel="noopener noreferrer" >@mante.ar</a>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 p-6 border-y lg:border-x lg:border-y-transparent border-cancel">
                <p>
                    "Los llamamos para hacer una cocina y terminamos haciendo toda la casa. Son unos genios!""
                </p>
                <CiHeart className="text-accent mx-auto" />
                <div className="font-bold">
                    <span>Agostina</span>
                    <span> | </span>
                    <a href="https://www.instagram.com/mante.ar" target="_blank" rel="noopener noreferrer" >@mante.ar</a>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 p-6">
                <p>
                    "Los llamamos para hacer una cocina y terminamos haciendo toda la casa. Son unos genios!""
                </p>
                <CiHeart className="text-accent mx-auto" />
                <div className="font-bold">
                    <span>Agostina</span>
                    <span> | </span>
                    <a href="https://www.instagram.com/mante.ar" target="_blank" rel="noopener noreferrer" >@mante.ar</a>
                </div>
            </div>
        </div>
    )

}