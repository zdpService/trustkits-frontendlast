import "./webServices.css";
import { webServices } from "./webServices";

const SectionServices = () => {
  return (
    <section className="section_services">
      <div className="section_services__header">
        <h1>Nos services de développement web</h1>
        <p>
          trustkits offre une gamme complète de services pour créer, améliorer
          et maintenir votre site web ou application mobile, afin de garantir
          votre succès en ligne.
        </p>
      </div>

      <div className="section_services__grid">
        {webServices.map((service, index) => (
          <div className="service_card" key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SectionServices;
