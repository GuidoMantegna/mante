import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProjectsGrid,
  TILE_SPANS,
  type ProjectImage,
} from "@/components/projects-grid";

const COCINAS: ProjectImage[] = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/projects/new/cocina-${index + 1}.jpg`,
  alt: `Cocina a medida ${index + 1}`,
}));

const PLACARDS: ProjectImage[] = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/projects/new/placard-${index + 1}.jpg`,
  alt: `Placard a medida ${index + 1}`,
}));

function getTiles(): HTMLElement[] {
  return screen.getAllByTestId("project-tile");
}

function getImage(index: number): HTMLImageElement {
  return getTiles()[index].querySelector("img") as HTMLImageElement;
}

/** `next/image` llama al `onLoad` del consumidor tras una cadena de promesas. */
async function loadTile(index: number): Promise<void> {
  await act(async () => {
    fireEvent.load(getImage(index));
  });
}

function renderGrid(props: Partial<Parameters<typeof ProjectsGrid>[0]> = {}) {
  return render(
    <ProjectsGrid images={COCINAS} onSelect={() => {}} {...props} />,
  );
}

describe("ProjectsGrid", () => {
  afterEach(cleanup);

  it("renderiza las seis imágenes recibidas en orden", () => {
    renderGrid();

    expect(getTiles().map((tile) => tile.dataset.src)).toEqual(
      COCINAS.map((image) => image.src),
    );
  });

  it("aplica el patrón asimétrico de columnas 2/3/3/2/2/3", () => {
    renderGrid();

    const tiles = getTiles();

    expect(tiles.map((tile) => Number(tile.dataset.span))).toEqual([
      ...TILE_SPANS,
    ]);
    expect(tiles[0]).toHaveClass("col-span-2");
    expect(tiles[1]).toHaveClass("col-span-3");
    expect(tiles[2]).toHaveClass("col-span-3");
    expect(tiles[3]).toHaveClass("col-span-2");
  });

  it("cada fila del mosaico suma cinco columnas", () => {
    for (let row = 0; row < 3; row += 1) {
      expect(TILE_SPANS[row * 2] + TILE_SPANS[row * 2 + 1]).toBe(5);
    }
  });

  it("cada tile es un botón cuyo nombre accesible es el alt de su imagen", () => {
    renderGrid();

    for (const image of COCINAS) {
      const button = screen.getByRole("button", { name: image.alt });
      expect(button).toHaveAttribute("type", "button");
    }
  });

  it("al pulsar un tile informa su índice", () => {
    const onSelect = vi.fn();
    renderGrid({ onSelect });

    fireEvent.click(getTiles()[3]);

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it("sólo el índice priority se precarga; el resto carga en diferido", () => {
    renderGrid({ priorityIndex: 0 });

    // `priority` deja el `loading` sin declarar, que es el default `eager`.
    expect(getImage(0)).not.toHaveAttribute("loading");

    for (let index = 1; index < COCINAS.length; index += 1) {
      expect(getImage(index)).toHaveAttribute("loading", "lazy");
    }
  });

  it("sin índice priority todas las imágenes cargan en diferido", () => {
    renderGrid();

    for (let index = 0; index < COCINAS.length; index += 1) {
      expect(getImage(index)).toHaveAttribute("loading", "lazy");
    }
  });

  it("declara sizes distintos para tiles angostos y anchos", () => {
    renderGrid();

    expect(getImage(0).getAttribute("sizes")).toContain("40vw");
    expect(getImage(1).getAttribute("sizes")).toContain("58vw");
  });

  it("muestra un esqueleto en cada tile hasta que su imagen carga", async () => {
    renderGrid();

    expect(screen.getAllByTestId("project-tile-skeleton")).toHaveLength(6);
    expect(getTiles()[0].dataset.loaded).toBe("false");

    await loadTile(0);

    expect(screen.getAllByTestId("project-tile-skeleton")).toHaveLength(5);
    expect(getTiles()[0].dataset.loaded).toBe("true");
  });

  it("cargar una imagen no oculta el esqueleto de los demás tiles", async () => {
    renderGrid();

    await loadTile(2);

    expect(getTiles()[2].dataset.loaded).toBe("true");
    for (const index of [0, 1, 3, 4, 5]) {
      expect(getTiles()[index].dataset.loaded).toBe("false");
    }
  });

  it("expone data-loading mientras falte cargar alguna imagen", async () => {
    renderGrid();

    const grid = screen.getByTestId("projects-grid");
    expect(grid.dataset.loading).toBe("true");

    for (let index = 0; index < COCINAS.length; index += 1) {
      await loadTile(index);
    }

    expect(grid.dataset.loading).toBe("false");
    expect(grid.dataset.loadedCount).toBe("6");
  });

  it("al cambiar el set de imágenes vuelve a mostrar los esqueletos", async () => {
    const { rerender } = renderGrid();

    await loadTile(0);
    expect(getTiles()[0].dataset.loaded).toBe("true");

    rerender(<ProjectsGrid images={PLACARDS} onSelect={() => {}} />);

    expect(getTiles().map((tile) => tile.dataset.src)).toEqual(
      PLACARDS.map((image) => image.src),
    );
    expect(screen.getAllByTestId("project-tile-skeleton")).toHaveLength(6);
  });

  it("recuerda las imágenes ya cargadas al volver a un set anterior", async () => {
    const { rerender } = renderGrid();

    await loadTile(0);
    rerender(<ProjectsGrid images={PLACARDS} onSelect={() => {}} />);
    rerender(<ProjectsGrid images={COCINAS} onSelect={() => {}} />);

    expect(getTiles()[0].dataset.loaded).toBe("true");
    expect(screen.getAllByTestId("project-tile-skeleton")).toHaveLength(5);
  });

  it("recorta en el nodo compartido y no en el tile", () => {
    renderGrid();

    expect(getImage(0)).toHaveClass("object-cover");
    // El recorte va en el nodo que vuela; si lo hiciera el tile, recortaría
    // también el vuelo de vuelta del lightbox.
    expect(getImage(0).parentElement).toHaveClass("overflow-hidden");
    expect(getTiles()[0]).toHaveClass("rounded-lg");
    expect(getTiles()[0]).not.toHaveClass("overflow-hidden");
  });

  it("el tile de la imagen abierta suelta su nodo compartido", () => {
    renderGrid({ hiddenSrc: COCINAS[2].src });

    const tiles = getTiles();
    expect(tiles[2].dataset.flying).toBe("true");
    expect(tiles[2].querySelector("img")).toBeNull();

    // Los demás siguen intactos: sólo se vacía el que está volando.
    expect(tiles[1].dataset.flying).toBe("false");
    expect(tiles[1].querySelector("img")).not.toBeNull();
  });

  it("el tile vaciado conserva su nombre accesible y su caja", () => {
    renderGrid({ hiddenSrc: COCINAS[0].src });

    const tile = screen.getByRole("button", { name: COCINAS[0].alt });
    expect(tile).toHaveClass("col-span-2");
    expect(
      tile.querySelector("[data-testid='project-tile-skeleton']"),
    ).toBeNull();
  });

  it("al cerrarse vuelve a montar el nodo compartido del tile", () => {
    const { rerender } = renderGrid({ hiddenSrc: COCINAS[2].src });

    rerender(
      <ProjectsGrid images={COCINAS} onSelect={() => {}} hiddenSrc={null} />,
    );

    expect(getTiles()[2].dataset.flying).toBe("false");
    expect(getImage(2)).toBeInTheDocument();
  });
});
