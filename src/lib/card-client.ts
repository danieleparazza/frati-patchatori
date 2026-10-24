// Client-side helpers for holy cards: the front (the card's inline SVG) and the back (SVG in the
// figure's <template class="card-back">), each as a standalone copy with unique ids.

let copies = 0;

/** Clones an SVG and suffixes its ids, so the copy can live in the same page as the original. */
export function standaloneCopy(svg: SVGElement) {
  const copy = svg.cloneNode(true) as SVGElement;
  const suffix = `-c${++copies}`;
  copy.removeAttribute('tabindex');
  copy.removeAttribute('role');
  copy.classList.remove('zoomable');
  const ids = [...copy.querySelectorAll('[id]')].map((el) => el.id);
  copy.querySelectorAll('[id]').forEach((el) => (el.id += suffix));
  copy.querySelectorAll('*').forEach((n) => {
    for (const attr of ['fill', 'stroke', 'clip-path']) {
      const v = n.getAttribute(attr);
      const m = v?.match(/^url\(#(.+)\)$/);
      if (m && ids.includes(m[1])) n.setAttribute(attr, `url(#${m[1]}${suffix})`);
    }
  });
  return copy;
}

export function cardSvgs(fig: HTMLElement) {
  const front = fig.querySelector<SVGElement>(':scope > svg');
  const tpl = fig.querySelector<HTMLTemplateElement>('template.card-back');
  const back = tpl?.content.querySelector<SVGElement>('svg') ?? null;
  return { front: front ? standaloneCopy(front) : null, back: back ? standaloneCopy(back) : null };
}
