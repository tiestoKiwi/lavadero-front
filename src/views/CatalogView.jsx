import CatalogCards from "../components/shared/CatalogCards";

export default function CatalogView({ items, formatter }) {
  return <section className="section-card"><CatalogCards items={items} formatter={formatter} /></section>;
}
